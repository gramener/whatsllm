export default {
  async fetch(request, env) {
    const { WEBHOOK_VERIFY_TOKEN, ACCESS_TOKEN, LLMFOUNDRY_TOKEN } = env;
    const url = new URL(request.url);

    const api = async (path, options) =>
      await fetch(`https://graph.facebook.com/v18.0/${path}`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
        ...options,
      }).then((res) => res.json());

    if (request.method == "GET" && url.pathname == "/") {
      return new Response(
        "<h1>WhatsLLM</h1><p>See <a href='https://github.com/gramener/whatsllm'>github.com/gramener/whatsllm</a> for details</p>",
        {
          headers: { "Content-Type": "text/html" },
          status: 200,
        },
      );
    }

    // Handle webhook verification
    if (request.method === "GET" && url.pathname === "/webhook") {
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

    // Handle incoming webhook messages
    if (request.method === "POST" && url.pathname === "/webhook") {
      let content;
      const body = await request.json();
      const business_phone_number_id = body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
      const message = body.entry?.[0]?.changes[0]?.value?.messages?.[0];
      const statuses = body.entry?.[0]?.changes[0]?.value?.statuses;

      if (message?.type === "image") {
        const { url, mime_type } = await api(message.image.id);
        let response = await fetch(url, {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "User-Agent": "curl/7.64.1" },
        });
        const buffer = await response.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const binaryArray = [];
        for (let i = 0; i < bytes.length; i += 10000)
          binaryArray.push(String.fromCharCode.apply(null, bytes.subarray(i, i + 10000)));
        const base64 = btoa(binaryArray.join(""));
        content = [
          {
            type: "image_url",
            image_url: { url: `data:${mime_type};base64,${base64}`, detail: "low" },
          },
          { type: "text", text: message.image.caption || "Describe this image" },
        ];
      } else if (message?.type === "text") {
        content = [{ type: "text", text: message.text.body }];
      } else if (statuses) {
        return new Response(null, { status: 200 });
      } else {
        return new Response("Not Found", { status: 404 });
      }
      const response = await fetch("https://llmfoundry.straive.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LLMFOUNDRY_TOKEN}:whatsllm`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content }],
        }),
      }).then((res) => res.json());

      // Send reply message
      await api(`${business_phone_number_id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.from,
          text: {
            body: response.choices?.[0]?.message?.content ?? response.error?.message ?? JSON.stringify(response),
          },
          context: { message_id: message.id },
        }),
      });

      // Mark incoming message as read
      await api(`${business_phone_number_id}/messages`, {
        method: "POST",
        body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: message.id }),
      });
    }

    return new Response(null, { status: 200 });
  },
};
