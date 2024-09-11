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
