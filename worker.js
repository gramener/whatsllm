import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import { tools as servicedeskTools } from "./servicedesk.js";
import { openai, groq } from "./utils.js";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

const assetManifest = JSON.parse(manifestJSON);

// toolList is the list of tools that the agent can use.
// It's an object of TOOL_NAME: { description: "DESCRIPTION", action: (content, token) => RESPONSE }
const toolList = {
  HELP: {
    description: "Greet users, explain what you can do.",
    action: async () => {
      // Get first 10 tools except HELP
      const toolKeys = Object.keys(toolList)
        .filter((key) => key !== "HELP")
        .slice(0, 10);
      return {
        type: "interactive",
        interactive: {
          type: "list",
          header: {
            type: "text",
            text: "Author Assist",
          },
          body: {
            text: "Welcome to Author Assist. Here are some questions you can ask. Or, you could just ask anything and I'll try to help.",
          },
          action: {
            button: "View Tools",
            sections: [
              {
                title: "Tools",
                rows: toolKeys.map((key) => ({
                  id: key,
                  title: key,
                  description: toolList[key].question,
                })),
              },
            ],
          },
        },
      };
    },
  },

  // Import specific tools
  ...servicedeskTools,

  CHAT: {
    description: "Answer to questions using text and images.",
    action: async ({ content, token }) => await openai([{ role: "user", content }], token),
  },

  NONE: {
    description: "Handle ANY question that don't match any of the above",
    action: async ({ content, token }) =>
      await openai(
        [
          {
            role: "system",
            content: `Explain that you can't help with the user query. That you can't read previous chat messages. Explain your capabilities from below:
${capabilities}`,
          },
          { role: "user", content },
        ],
        token,
      ),
  },
};

// capabilities lists TOOL_NAME: DESCRIPTION, one per line
const capabilities = Object.entries(toolList)
  .map(([key, info]) => `${key}: ${info.description}`)
  .join("\n");

export default {
  async fetch(request, env, ctx) {
    const { WEBHOOK_VERIFY_TOKEN, ACCESS_TOKEN, LLMFOUNDRY_TOKEN } = env;
    const url = new URL(request.url);

    const api = async (path, options) =>
      await fetch(`https://graph.facebook.com/v18.0/${path}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
        ...options,
      }).then((res) => res.json());

    if (request.method == "GET") {
      // Handle webhook verification
      if (url.pathname === "/webhook") {
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
          console.log("Webhook verified successfully!");
          return new Response(challenge, { status: 200 });
        } else {
          return new Response("Forbidden", { status: 403 });
        }
      }

      // Serve static assets if applicable
      try {
        return await getAssetFromKV(
          { request, waitUntil: ctx.waitUntil.bind(ctx) },
          { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest },
        );
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }

    // Handle incoming webhook messages
    if (request.method === "POST" && url.pathname === "/webhook") {
      let content;
      const body = await request.json();
      const business_phone_number_id = body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
      const message = body.entry?.[0]?.changes[0]?.value?.messages?.[0];
      const statuses = body.entry?.[0]?.changes[0]?.value?.statuses;

      // Fetch the content based on the type of message
      if (message?.type === "image") {
        const { url, mime_type } = await api(message.image.id);
        let response = await fetch(url, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "User-Agent": "curl/7.64.1" },
        });
        // Convert the image to base64. String.fromCharCode fails for large arrays, so chunk it.
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const binaryArray = [];
        for (let i = 0; i < bytes.length; i += 10000) binaryArray.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 10000)));
        const base64 = btoa(binaryArray.join(""));
        // Get the image and text
        content = [
          {
            type: "image_url",
            image_url: { url: `data:${mime_type};base64,${base64}`, detail: "low" },
          },
          { type: "text", text: message.image.caption || "Describe this image" },
        ];
      } else if (message?.type === "text") {
        content = [{ type: "text", text: message.text.body }];
      } else if (message?.type === "interactive") {
        content = [{ type: "text", text: message.interactive.list_reply.title }];
      } else if (statuses) {
        return new Response(null, { status: 200 });
      } else {
        return new Response("Not Found", { status: 404 });
      }

      const contacts = body.entry?.[0]?.changes[0]?.value?.contacts ?? [];
      // Call Llama 3.1 8b to get the function call
      const toolText = await groq(
        [
          {
            role: "system",
            content: `You route WhatsApp requests to the right agent. Here are the agents:
${capabilities}

Pick the best agent to reply to this WhatsApp message. Respond with ONLY the agent's name (e.g. "HELP", "CHAT", ...).`,
          },
          { role: "user", content: content.map((c) => (c.type == "image_url" ? "[IMAGE]" : c.text)).join("\n") },
        ],
        LLMFOUNDRY_TOKEN,
        {
          "X-WhatsApp-From": message?.from ?? "",
          "X-WhatsApp-Contacts": contacts.map((c) => `${c.profile?.name ?? ""} (${c.wa_id})`).join(", "),
        },
      );

      // Call the right tool, defaulting to the last
      const toolRegex = new RegExp(`\\b(${Object.keys(toolList).join("|")})\\b`, "g");
      const tool = toolText.match(toolRegex)?.[0];
      const response = await (toolList[tool] ?? Object.keys(toolList).at(-1)).action({
        content,
        token: LLMFOUNDRY_TOKEN,
        sender: message.from,
      });

      if (typeof response === "object") {
        await api(`${business_phone_number_id}/messages`, {
          method: "POST",
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: message.from,
            ...response,
          }),
        });
      } else {
        // Send reply message
        await api(`${business_phone_number_id}/messages`, {
          method: "POST",
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: message.from,
            text: { body: response },
            context: { message_id: message.id },
          }),
        });
      }

      // Mark incoming message as read
      await api(`${business_phone_number_id}/messages`, {
        method: "POST",
        body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: message.id }),
      });
    }

    return new Response(null, { status: 200 });
  },
};
