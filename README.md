# WhatsLLM

A simple LLM chatbot webhook on WhatsApp.

## Usage

Send a [WhatsApp message to +1 555 133 0603](https://wa.me/15551330603). GPT-4o-mini will reply.

## Setup

- Log into <https://dash.cloudflare.com/> as <root.node@gmail.com>
- Create a worker called `whatsllm` deployed at <https://whatsllm.sanand.workers.dev>
- Clone [this repository](https://github.com/gramener/whatsllm)
- Run `npm install`
- Run `npx wrangler secret put <key>` also add them to `.dev.vars` as `KEY=value`:
  - `WEBHOOK_VERIFY_TOKEN`: Via [Facebook Developer Console](https://developers.facebook.com/apps/1247415196273061/whatsapp-business/wa-settings/?business_id=354938351047080&phone_number_id)
  - `GRAPH_API_TOKEN`: Via [Facebook Developer Console](https://developers.facebook.com/apps/1247415196273061/whatsapp-business/wa-dev-console/?business_id=354938351047080)
  - `OPENAI_API_KEY`: Via [OpenAI API Keys](https://platform.openai.com/api-keys)
- Run `npm run deploy` to deploy on Cloudflare
