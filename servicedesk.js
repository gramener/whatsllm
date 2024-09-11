import { openai } from "./utils.js";

// Simulate a random number generator since Math.random() has no seed
// https://stackoverflow.com/a/47593316/100904
function splitmix32(a) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

const getRandomDate = (start, end, random) => new Date(start.getTime() + random() * (end.getTime() - start.getTime()));

async function generateManuscriptHistory(seed) {
  const random = splitmix32(seed);

  const history = [];
  let currentState = "Submitted";
  let currentDate = getRandomDate(new Date(2020, 0, 1), new Date(), random);

  history.push({ date: currentDate, state: currentState });

  while (currentState !== "Accepted" && currentState !== "Rejected" && currentState !== "Published") {
    let possibleNextStates;

    switch (currentState) {
      case "Submitted":
        possibleNextStates = ["Under Review"];
        break;
      case "Under Review":
        possibleNextStates = ["Review Completed"];
        break;
      case "Review Completed":
        possibleNextStates = ["Accepted", "Rejected", "Major Revision Required", "Minor Revision Required"];
        break;
      case "Major Revision Required":
      case "Minor Revision Required":
        possibleNextStates = ["In Revision"];
        break;
      case "In Revision":
        possibleNextStates = ["Resubmitted"];
        break;
      case "Resubmitted":
        possibleNextStates = ["Under Review"];
        break;
      case "Accepted":
        possibleNextStates = ["In Production"];
        break;
      case "In Production":
        possibleNextStates = ["Published"];
        break;
      default:
        possibleNextStates = [];
        break;
    }

    if (possibleNextStates.length === 0 || random() < 0.2) break;

    currentState = possibleNextStates[Math.floor(random() * possibleNextStates.length)];
    currentDate = getRandomDate(currentDate, new Date(), random);

    history.push({ date: currentDate, state: currentState });
  }

  return history;
}

export const tools = {
  MANUSCRIPT_GUIDELINES: {
    description: "Guidance on templates, book structure, and search engine optimization.",
    action: answerFrom("https://www.springernature.com/gp/authors/publish-a-book/manuscript-guidelines"),
  },
  LATEX_HELP: {
    description: "LaTeX guidelines for user's paper, book, or manuscript.",
    action: answerFrom("https://www.springernature.com/gp/authors/campaigns/latex-author-support"),
  },
  PUBLISHING_COST: {
    description: "Explain publication costs, article processing charges, etc.",
    action: contactUs,
  },
  PAPER_STATUS: {
    description: "Check status of user's paper, book, or manuscript.",
    action: async ({ content, token, sender }) => {
      const history = await generateManuscriptHistory(+sender);
      return await openai(
        [
          {
            role: "system",
            content: `Reply using this status history.\n\n${history.map((h) => `${h.date.toGMTString()}: ${h.state}`).join("\n")}`,
          },
          { role: "user", content },
        ],
        token,
      );
    },
  },
  CORRECTIONS: {
    description: "Handle correction requests from editorial to post-publication.",
    action: contactUs,
  },
  COMPLEMENTARY_EBOOK: {
    description: "Provide author a complementary ebook download link.",
    action: async ({ content, token, sender }) => {
      return await openai(
        [
          {
            role: "system",
            content:
              "Reply and share this eBook download link: https://resource-cms.springernature.com/springer-cms/rest/v1/content/16687326/data/v9",
          },
          { role: "user", content },
        ],
        token,
      );
    },
  },
  CHAPTER_LINK: {
    description: "Provide author a link to share specific articles/chapter copies as attachment.",
    action: raiseTicket,
  },
  DISCOUNT: {
    description: "Share author discount code for next purchase.",
    action: answerFrom(
      "https://support.springernature.com/en/support/solutions/articles/6000257425-how-to-get-your-author-discount-on-our-springerlink-webshop",
    ),
  },
  COMPLEMENTARY_BOOK: {
    description: "Provide author complementary book copies.",
    action: raiseTicket,
  },
  SALES_QUERY: {
    description: "Shale number of copies sold",
    action: fakeReply,
  },
  REMUNERATION_QUERY: {
    description: "Share author remunerations and royalties",
    action: contactUs,
  },
  INVOICE_COPY: {
    description: "Share invoice/receipt copy",
    action: async ({ content, token, sender }) => {
      return await openai(
        [
          { role: "system", content: "Reply with a link to this invoie: https://slicedinvoices.com/pdf/wordpress-pdf-invoice-plugin-sample.pdf" },
          { role: "user", content },
        ],
        token,
      );
    },
  },
  INVOICE_CORRECTION: {
    description: "Handle correction to invoice (VAT, address change, discount issues, etc.)",
    action: contactUs,
  },
};

async function fetchMarkdown(url) {
  return await fetch(`https://llmfoundry.straive.com/-/markdown?url=${encodeURIComponent(url)}`).then((res) => res.text());
}

function answerFrom(url) {
  return async ({ content, token, sender }) => {
    const page = await fetchMarkdown(url);
    return await openai(
      [
        { role: "system", content: `<CONTEXT>\n${page}\n</CONTEXT>\n\nAnswer this question ONLY using this context.` },
        { role: "user", content },
      ],
      token,
    );
  };
}

async function contactUs({ content, token, sender }) {
  return await openai(
    [
      { role: "system", content: "Reply asking the user to contact the us on email/chat" },
      { role: "user", content },
    ],
    token,
  );
}

async function raiseTicket({ content, token, sender }) {
  return await openai(
    [
      { role: "system", content: "Reply by saying you've raised a ticket and share a random ticket number" },
      { role: "user", content },
    ],
    token,
  );
}

async function fakeReply({ content, token, sender }) {
  return await openai(
    [
      { role: "system", content: "Reply with a realistic, detailed, and convincing fake answer" },
      { role: "user", content },
    ],
    token,
  );
}
