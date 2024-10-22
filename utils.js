// llm(messages) calls GPT-4o-mini with the given messages and returns the response
export async function openai(messages, token, headers = {}) {
  const response = await fetch("https://llmfoundry.straive.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}:whatsllm`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  }).then((res) => res.json());
  return response.choices?.[0]?.message?.content ?? response.error?.message ?? JSON.stringify(response);
}

export async function groq(messages, token, headers = {}) {
  const response = await fetch("https://llmfoundry.straive.com/groq/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}:whatsllm-toolpicker`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ model: "llama-3.1-8b-instant", messages }),
  }).then((res) => res.json());
  return response.choices?.[0]?.message?.content ?? response.error?.message ?? JSON.stringify(response);
}

export async function fakeReply({ content, token }) {
  return await openai(
    [
      { role: "system", content: `Reply with a realistic, detailed, and convincing fake answer. ${context}` },
      { role: "user", content },
    ],
    token
  );
}

export function answerFrom(url) {
  return async ({ content, token }) => {
    const page = await fetchMarkdown(url);
    return await openai(
      [
        { role: "system", content: `<CONTEXT>\n${page}\n</CONTEXT>\n\nAnswer this question ONLY using this context.` },
        { role: "user", content },
      ],
      token
    );
  };
}

async function fetchMarkdown(url) {
  return await fetch(`https://llmfoundry.straive.com/-/markdown?url=${encodeURIComponent(url)}`).then((res) => res.text());
}

// https://developers.facebook.com/docs/whatsapp/guides/interactive-messages/
export function getMenu({ tools, header, body, button, keys }) {
  for (const key of keys) {
    if (!tools[key]) throw new Error(`Tool ${key} not found`);
  }
  return {
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: header.slice(0, 60) },
      // Body is required
      body: { text: body || "Choose an option" },
      action: {
        // Max 20 characters
        button: button.slice(0, 20),
        sections: [
          {
            title: "Tools",
            // Max 10 sections
            rows: keys.slice(0, 10).map((key) => ({
              id: key,
              // Max 24 characters
              title: key.slice(0, 24),
              // Max 72 characters
              description: tools[key].question?.slice?.(0, 72) ?? tools[key].description,
            })),
          },
        ],
      },
    },
  };
}
