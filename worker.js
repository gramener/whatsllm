export default {
  async fetch(request, env) {
    const { WEBHOOK_VERIFY_TOKEN, ACCESS_TOKEN, OPENAI_API_KEY } = env;
    const url = new URL(request.url);

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
      const body = await request.json();
      const message = body.entry?.[0]?.changes[0]?.value?.messages?.[0];

      if (message?.type === "text") {
        const business_phone_number_id = body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

        // Get OpenAI response
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message.text.body }],
          }),
        }).then((res) => res.json());

        // Send reply message
        await fetch(`https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
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
        await fetch(`https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            status: "read",
            message_id: message.id,
          }),
        });
      }

      return new Response(null, { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
