import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import { openai, getMenu, groq } from "./utils.js";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

// We import tools from specific agents, e.g.
// import { tools } from "./springernature.js";
import { tools } from "./servicedesk.js";

const assetManifest = JSON.parse(manifestJSON);

// toolList is the list of tools that the agent can use.
// It's an object of TOOL_NAME: { description: "DESCRIPTION", action: (content, token) => RESPONSE }
const toolList = {
  // Import specific tools
  ...tools,

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
        token
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

    const api = async (path, options) => {
      const baseUrl = "https://graph.facebook.com/v18.0/";
      const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      };
      return fetch(`${baseUrl}${path}`, { headers, ...options }).then((res) => res.json());
    };

    if (request.method === "GET") {
      if (url.pathname === "/webhook") return this.verifyWebhook(url, WEBHOOK_VERIFY_TOKEN);
      else return this.serveStaticAsset(env, ctx);
    }
    if (request.method === "POST" && url.pathname === "/webhook") return this.handleWebhook(request, api, LLMFOUNDRY_TOKEN);
    return new Response(null, { status: 200 });
  },

  verifyWebhook(url, WEBHOOK_VERIFY_TOKEN) {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
      console.log("Webhook verified successfully!");
      return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status: 403 });
  },

  async serveStaticAsset(env, ctx) {
    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest }
      );
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  },

  async handleWebhook(request, api, LLMFOUNDRY_TOKEN) {
    const body = await request.json();
    const entry = body.entry?.[0]?.changes[0]?.value;
    const business_phone_number_id = entry?.metadata?.phone_number_id;
    const message = entry?.messages?.[0];
    const statuses = entry?.statuses;

    if (statuses) return new Response(null, { status: 200 });
    if (!message) return new Response("Not Found", { status: 404 });

    const content = await this.getMessageContent(message, api);
    if (!content) return new Response("Not Found", { status: 404 });

    const contacts = entry?.contacts ?? [];
    const tool = await this.selectTool(content, message, contacts, LLMFOUNDRY_TOKEN);
    const response = await this.executeToolAction(tool, content, LLMFOUNDRY_TOKEN, message.from);
    console.log("RESPONSE", JSON.stringify(response, null, 2));

    await this.sendResponse(api, business_phone_number_id, message, response);
    await this.markMessageAsRead(api, business_phone_number_id, message.id);

    return new Response(null, { status: 200 });
  },

  async getMessageContent(message, api) {
    switch (message.type) {
      case "image":
        return this.getImageContent(message, api);
      case "text":
        return [{ type: "text", text: message.text.body }];
      case "interactive":
        return [{ type: "text", text: message.interactive.list_reply.title }];
      default:
        return null;
    }
  },

  async getImageContent(message, api) {
    const { url, mime_type } = await api(message.image.id);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "User-Agent": "curl/7.64.1" },
    });
    const base64 = await this.arrayBufferToBase64(await response.arrayBuffer());
    return [
      {
        type: "image_url",
        image_url: { url: `data:${mime_type};base64,${base64}`, detail: "low" },
      },
      { type: "text", text: message.image.caption || "Describe this image" },
    ];
  },

  async arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    const binaryArray = [];
    for (let i = 0; i < bytes.length; i += 10000) {
      binaryArray.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 10000)));
    }
    return btoa(binaryArray.join(""));
  },

  async selectTool(content, message, contacts, LLMFOUNDRY_TOKEN) {
    // If the user selected a tool, return it
    const toolName = content?.[0]?.text;
    if (toolList.hasOwnProperty(toolName)) return toolName;

    // Otherwise, ask the LLM to select the best tool
    const toolText = await groq(
      [
        {
          role: "system",
          content: `You route WhatsApp requests to the right agent. Here are the agents:
${capabilities}

Pick the best agent to reply to this WhatsApp message. Respond with ONLY the agent's name (e.g. "HELP", "CHAT", ...).`,
        },
        { role: "user", content: content.map((c) => (c.type === "image_url" ? "[IMAGE]" : c.text)).join("\n") },
      ],
      LLMFOUNDRY_TOKEN,
      {
        "X-WhatsApp-From": message?.from ?? "",
        "X-WhatsApp-Contacts": contacts.map((c) => `${c.profile?.name ?? ""} (${c.wa_id})`).join(", "),
      }
    );

    // Return the shortest match that contains the exact tooltext
    const match = toolText.toLowerCase().trim();
    const matches = Object.keys(toolList)
      .filter((k) => k.toLowerCase().includes(match))
      .sort((a, b) => a.length - b.length);
    return matches.length > 0 ? matches[0] : "NONE";
  },

  async executeToolAction(tool, content, LLMFOUNDRY_TOKEN, sender) {
    return toolList[tool].action({
      content,
      token: LLMFOUNDRY_TOKEN,
      sender,
    });
  },

  async sendResponse(api, business_phone_number_id, message, response) {
    const basePayload = {
      messaging_product: "whatsapp",
      to: message.from,
    };

    if (typeof response === "object") {
      await api(`${business_phone_number_id}/messages`, {
        method: "POST",
        body: JSON.stringify({ ...basePayload, ...response }),
      });
    } else {
      await api(`${business_phone_number_id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          ...basePayload,
          text: { body: response },
          context: { message_id: message.id },
        }),
      });
    }
  },

  async markMessageAsRead(api, business_phone_number_id, message_id) {
    await api(`${business_phone_number_id}/messages`, {
      method: "POST",
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id }),
    });
  },
};
