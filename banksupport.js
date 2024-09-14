import { openai } from "./utils.js";

const customer = {
  customer_name: "Emma Rodriguez",
  age: "40",
  salary: "95000",
  products:
    "Savings Account (Balance: 12000, Interest Rate: 1.2%), Credit Card (Balance: 1500, Limit: 10000, Rewards Points: 12000, Interest Rate: 18.5%), Home Loan (Balance: 230000, Monthly Payment: 1500, Interest Rate: 3.8%, Remaining Years: 18), Investment Account (Balance: 45000, Interest Rate: 4.5%)",
  recent_transactions:
    "2024-09-10: Grocery Shopping at Whole Foods, Amount: 95.00 (Debit Card), 2024-09-09: Flight Booking at Delta Airlines, Amount: 600.00 (Credit Card), 2024-09-07: Dining at The Steakhouse, Amount: 150.00 (Credit Card), 2024-09-05: Mortgage Payment to Wells Fargo, Amount: 1000.00 (Automatic Debit), 2024-09-03: Clothing Store at Zara, Amount: 200.00 (Credit Card)",
  browsing_history:
    "2024-09-08: Home Loan Interest Rate Comparison (180 seconds), 2024-09-06: Best Cashback Credit Cards 2024 (120 seconds), 2024-09-04: Retirement Investment Plans (240 seconds), 2024-09-03: Auto Insurance Quote (90 seconds)",
  savings_pattern: "Average Monthly Savings: 1800, Total Savings: 12000",
  investment_pattern: "Stocks: 15000 (7.5% return), Mutual Funds: 20000 (5.2% return), Bonds: 10000 (3.8% return), Total Investment Value: 45000",
  credit_score: "740",
  insurance_held: "Health Insurance (Comprehensive, Premium: 200.00), Car Insurance (Full Coverage, Premium: 150.00)",
  recent_activity_flags: "None",
  account_balance: "12000",
  recent_loan_queries: "Auto Loan Inquiry on 2024-09-06 for 30000",
  financial_goals:
    "Retirement Fund: Target 500000, Current 45000, Monthly Contribution 1000; College Fund for Child: Target 100000, Current 15000, Monthly Contribution 500",
};

function mock(system) {
  return async ({ content, token }) =>
    await openai(
      [
        {
          role: "system",
          content: `You're an expert system assisting a bank agent in their conversation with a customer ${customer.customer_name}.
${system}
Format as a professional WhatsApp message.
Write talking points for the bank agent to share with the customer.
Don't address the agent nor the customer. Just write paragraphs like *<summary>*: <details>.
No bullets.`,
        },
        { role: "user", content },
      ],
      token,
    );
}

export const tools = {
  "CUSTOMER INFO": {
    description: "Search for a customer by age, salary, product holdings, and transaction history to identify key talking points.",
    question: "What should you know about the customer?",
    action: mock(`
Name: ${customer.customer_name}, Age: ${customer.age}, Salary: ${customer.salary}, Products: ${customer.products}, Recent Transactions: ${customer.recent_transactions}, Browsing History: ${customer.browsing_history}
Summarize the key talking points about this customer, highlighting any relevant products, transactions, and potential offers that align with their browsing history. Provide actionable suggestions for your conversation.
`),
  },
  "SPENDING RECOMMENDATION": {
    description: "Analyze recent transactions (e.g., frequent debit card use for shopping) and suggest relevant credit card offers with benefits.",
    question: "What card features will help their spend behavior?",
    action: mock(`
Recent transactions:
${customer.recent_transactions}
Identify suitable credit card offers based on frequent spending patterns (e.g., shopping, dining) and emphasize benefits like cashback, rewards points, or other perks. If relevant offers aren't available, suggest general options they might find useful.
`),
  },
  "BROWSING HISTORY INSIGHT": {
    description: "Review customer's recent browsing activity (e.g., home loan page) to suggest related products or financial advice.",
    question: "What advice is relevant to their browsing history?",
    action: mock(`
Browsing history:
${customer.browsing_history}
Recommend related products or services (e.g., loans, credit cards, insurance) that align with their interests. Tailor your suggestions to what they may be actively looking for and guide them accordingly.
`),
  },
  "PRODUCT RELEVANCE": {
    description: "Highlight relevant products based on customer's profile and explain why a specific product is the most suitable option.",
    question: "What products are relevant to their financial goals?",
    action: mock(`
Age: ${customer.age}, Salary: ${customer.salary}, Products: ${customer.products}
Determine which products are most suitable for this customer and explain why those options best match their financial goals. Focus on the benefits to help the customer make informed decisions.
`),
  },
  "SAVINGS ADVICE": {
    description: "Analyze savings patterns and recommend higher interest savings accounts or investment options.",
    question: "What savings products will help their saving pattern?",
    action: mock(`
Savings pattern:
${customer.savings_pattern}
Suggest savings accounts or investment opportunities with better interest rates. Help the customer by positioning these offers in a way that highlights the benefits for their financial future.
`),
  },
  "CREDIT SCORE HELP": {
    description: "Provide customer's credit score insights and recommend actions to improve or utilize their credit standing.",
    question: "What can they do to improve credit score?",
    action: mock(`
Credit score: ${customer.credit_score}.
Offer recommendations for improving or leveraging this score, such as accessing better loan or credit card offers. Guide the customer on how they can make the most of their credit standing.
`),
  },
  "UPGRADE ALERT": {
    description: "Notify about potential account or service upgrades (e.g., premium accounts) based on current usage and balances.",
    question: "What upgrades can they get?",
    action: mock(`
Based on the account usage and balance of ${customer.customer_name} (${customer.account_balance}), identify potential upgrades like premium accounts or additional services (e.g., investment management, travel perks). Provide talking points to help you promote these upgrades during your conversation.
`),
  },
  "CROSS SELL OPPORTUNITY": {
    description: "Identify cross-sell opportunities for insurance, loans, or investment products based on customer's financial activity.",
    question: "What cross-sell opportunities are there?",
    action: mock(`
Products:
${customer.products}
Identify cross-sell opportunities for additional products like insurance, loans, or investment plans that could complement their existing portfolio. Suggest ways to introduce these options naturally during your conversation.
`),
  },
  "TRANSACTION ANOMALY": {
    description: "Flag unusual spending patterns or account behavior and suggest a security review or a consultation.",
    question: "Are there any unusual transactions?",
    action: mock(`
Unusual transactions:
${customer.recent_transactions}
Guide the customer in a way that doesn't cause alarm, but suggest a security review or consultation if necessary. Provide clear steps on how to discuss these anomalies effectively.
`),
  },
  "FUTURE BUDGET TIPS": {
    description: "Based on transaction data, provide tips for future financial planning or budgeting tools that might help.",
    question: "What tips will help their budgeting?",
    action: mock(`
Recent transactions:
${customer.recent_transactions}
Based on this, suggest tips for future financial planning and recommend budgeting tools. Offer guidance on how to help the customer manage their spending more efficiently and set financial goals.
`),
  },
};
