// llm(messages) calls GPT-4o-mini with the given messages and returns the response
export async function llm(messages, token) {
  const response = await fetch("https://llmfoundry.straive.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}:whatsllm`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "gpt-4o-mini", messages }),
  }).then((res) => res.json());
  return response.choices?.[0]?.message?.content ?? response.error?.message ?? JSON.stringify(response);
}
