# WhatsLLM

A simple LLM chatbot webhook on WhatsApp.

## Usage

Send a WhatsApp message to [+65 8646 2570](https://wa.me/6586462570) or [+1 555 133 0603](https://wa.me/15551330603). GPT-4o-mini will reply.

## WhatsApp Setup

- Log into [Meta for Developers](https://developers.facebook.com/) and create a new app
- Set up WhatsApp as a product
- [Generate a system user access token](https://developers.facebook.com/docs/whatsapp/business-management-api/get-started#business-integration-system-user-access-tokens)
- [Add the phone number](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/add-a-phone-number) to the WhatsApp Business app and add a payment method

## Hook Setup

- Log into <https://dash.cloudflare.com/> as <root.node@gmail.com>
- Create a worker called `whatsllm` deployed at <https://whatsllm.sanand.workers.dev>
- Clone [this repository](https://github.com/gramener/whatsllm)
- Run `npm install`
- Run `npx wrangler secret put <key>` also add them to `.dev.vars` as `KEY=value`:
  - `WEBHOOK_VERIFY_TOKEN`: Via [Meta Developer Console](https://developers.facebook.com/apps/1247415196273061/whatsapp-business/wa-settings/?business_id=354938351047080&phone_number_id)
  - `ACCESS_TOKEN`: Via [Meta Developer Console](https://developers.facebook.com/apps/1247415196273061/whatsapp-business/wa-dev-console/?business_id=354938351047080) -- or generated via `curl https://graph.facebook.com/oauth/access_token?client_id=1247415196273061&client_secret=$APP_SECRET&grant_type=client_credentials`
  - `LLMFOUNDRY_TOKEN`: Via [LLM Foundry](https://llmfoundry.straive.com/code)
- Run `npm run deploy` to deploy on Cloudflare
