/* Generic Service Desk */
import { getMenu } from "./utils.js";

/* `tools` is the list of tools that the agent can use.
   It is an object of TOOL_NAME: { description: "DESCRIPTION", question: "QUESTION", action: (content, token) => RESPONSE }

   When a tool is selected, the agent will call the `action({content, token, sender})` where:

   - `content` is the user's message
   - `token` is the LLMFoundry token
   - `sender` is the sender's ID
*/
export const tools = {
  HELP: {
    description: "Greet users, explain what you can do.",
    action: () =>
      getMenu({
        tools,
        header: "Customer Query Assist",
        body: "Welcome to Query Assist Assist. Here are some questions you can ask. Or, you could just ask anything and I'll try to help.",
        button: "Common questions",
        keys: [
          "1. BALANCE & PAYMENTS",
          "2. BILLING ERRORS",
          "3. SPECIFIC CHARGES",
          "4. SERVICE CHANGES",
          "5. SPECIAL REQUESTS",
          "6. FORGOT PASSWORD",
          "7. ACCOUNT LOCKED",
          "8. LOGIN ERRORS",
          "9. ACCOUNT CREATION",
        ],
      }),
  },
  "1. BALANCE & PAYMENTS": {
    description: "Explain balance, due date, payment history, and how to pay",
    question: "What is my balance? When is it due? How do I pay?",
    action: () =>
      getMenu({
        tools,
        header: "Balance & Payments",
        body: "Find your due date, balance, payment history and how to pay",
        button: "Common questions",
        keys: ["1.1. BALANCE & DUE DATE", "1.2. BILL PAYMENT", "1.3. PAYMENT HISTORY", "HELP"],
      }),
  },
  "1.1. BALANCE & DUE DATE": {
    description: "Explain balance, due date",
    question: "What is my balance and due date?",
    action: () => `Your balance is $${(Math.random() * 5000).toFixed(2)}, due on ${randomDate()}`,
  },
  "1.2. BILL PAYMENT": {
    description: "Explain how to pay",
    question: "How do I pay?",
    action: () => `You can pay via:
1. Web link: https://example.com/dummy-link
2. Through 3rd Party Payment (Billdesk)
3. Via Credit Card
4. Via Net Banking
5. Through QR code (ApplePay, Gpay, Whatsapp Pay)
6. Cheque

Visit https://example.com/dummy-link for more details.`,
  },
  "1.3. PAYMENT HISTORY": {
    description: "Explain payment history",
    question: "What is my payment history?",
    action: () => `Click here for your payment history PDF invoice: https://example.com/dummy-link`,
  },
  "2. BILLING ERRORS": {
    description: "Explain billing errors",
    question: "What are some common billing errors?",
    action: () =>
      getMenu({
        tools,
        header: "Billing Errors",
        body: "Find out what to do if you have billing errors",
        button: "Common questions",
        keys: ["2.1. INCORRECT CHARGES", "2.2. DISPUTES", "HELP"],
      }),
  },
  "2.1. INCORRECT CHARGES": {
    description: "Explain incorrect charges",
    question: "What if I have an incorrect charge?",
    action: () => `Please explain your issue. We will raise a ticket for it.`,
  },
  "2.2. DISPUTES": {
    description: "Explain adjustments & disputes",
    question: "What if I have an adjustment or dispute?",
    action: () => `Please visit https://example.com/dummy-link

This page explains the different kinds of adjustments and credits, as well as how to dispute a charge.`,
  },
  "3. SPECIFIC CHARGES": {
    description: "Explain specific charges",
    question: "What do I do if I have a specific charge?",
    action: () =>
      getMenu({
        tools,
        header: "Specific Charges",
        body: "Find out what to do if you have a specific charge",
        button: "Common questions",
        keys: ["3.1. ITEMIZED CHARGES", "3.2. RECURRING CHARGES", "3.3. LATE FEES", "HELP"],
      }),
  },
  "3.1. ITEMIZED CHARGES": {
    description: "Explain itemized charges",
    question: "What do I do if I have an itemized charge?",
    action: () => `For questions about specific itemized charges on your bill, please contact our customer support:

1. Call us at 1-800-123-4567 (available 24/7)
2. Email us at support@example.com

Our support team can provide detailed explanations of any charges on your account and address any concerns you may have.`,
  },
  "3.2. RECURRING CHARGES": {
    description: "Explain recurring charges",
    question: "What do I do if I have a recurring charge?",
    action: () => `Recurring charges are regular, automatic payments for ongoing services. Here's what you need to know:

1. Review your bill: Check your statement for any unfamiliar recurring charges.
2. Identify the service: Determine which service the charge is for.
3. Contact customer support: If you don't recognize the charge, reach out to us at 1-800-123-4567.
4. Cancel unwanted services: To cancel a recurring charge, log into your account at https://example.com/dummy-link and go to "Subscriptions" or "Recurring Payments".
5. Update payment method: If you need to update your payment method for a recurring charge, visit the "Payment Methods" section in your account settings.

For any other questions about recurring charges, please don't hesitate to ask.`,
  },
  "3.3. LATE FEES": {
    description: "Explain late fees & penalties",
    question: "What do I do if I have late fees or penalties?",
    action: () => `If you've incurred late fees or penalties, here's what you can do:

1. Check your balance: Log into your account at https://example.com/dummy-link to view your current balance, including any late fees.
2. Pay the outstanding amount: Make a payment as soon as possible to prevent additional fees.
3. Request a one-time waiver: If this is your first late payment, contact customer support at 1-800-123-4567 to request a one-time fee waiver.
4. Set up automatic payments: To avoid future late fees, consider setting up automatic payments in your account settings.
5. Understand our policy: Late fees are typically applied 3 days after the due date. The fee is 1.5% of the outstanding balance or $15, whichever is greater.

If you're experiencing financial hardship, please contact our customer support team to discuss payment options.`,
  },
  "4. SERVICE CHANGES": {
    description: "Explain service changes",
    question: "What do I do if I have a service change?",
    action: () =>
      getMenu({
        tools,
        header: "Service Changes",
        body: "What are the billing tiers? What's the impact of an upgrade? How do prorated charges work?",
        button: "Common questions",
        keys: ["4.1. TIERS & BILLING", "4.2. PRORATED CHARGES", "HELP"],
      }),
  },
  "4.1. TIERS & BILLING": {
    description: "Explain billing tiers",
    question: "What are the billing tiers?",
    action: () => `Our service offers the following billing tiers:

1. Basic Tier: $9.99/month
   - Up to 100 transactions
   - Basic reporting
   - Email support

2. Pro Tier: $24.99/month
   - Up to 1,000 transactions
   - Advanced reporting
   - Priority email support
   - API access

3. Enterprise Tier: $99.99/month
   - Unlimited transactions
   - Custom reporting
   - 24/7 phone support
   - Dedicated account manager
   - Full API access

You can upgrade or downgrade your tier at any time through your account settings at https://example.com/dummy-link. Changes will be reflected in your next billing cycle.

For more details on each tier's features, visit our pricing page: https://example.com/dummy-link/pricing`,
  },
  "4.2. PRORATED CHARGES": {
    description: "Explain prorated charges",
    question: "How do prorated charges work?",
    action: () => `Prorated charges occur when you make changes to your service mid-billing cycle. Here's how they work:

1. Upgrades: If you upgrade your service, you'll be charged the difference between your current and new plan for the remaining days in your billing cycle.

2. Downgrades: If you downgrade, you'll receive a credit for the difference, applied to your next bill.

3. New subscriptions: If you start a new subscription mid-cycle, you'll only be charged for the days you used the service.

4. Cancellations: If you cancel mid-cycle, you'll receive a refund for the unused portion of your service.

Example:
If you upgrade from a $10/month plan to a $20/month plan 15 days into your 30-day billing cycle, you'd be charged: $5 (half of the $10 difference) for the current cycle.

Prorated charges are always calculated based on the number of days in the billing cycle. For more details, visit: https://example.com/dummy-link/billing`,
  },
  "5. SPECIAL REQUESTS": {
    description: "Explain special requests",
    question: "What do I do if I have a special request?",
    action: () =>
      getMenu({
        tools,
        header: "Special Requests",
        body: "How do I handle billing statements, address changes, and cancellations?",
        button: "Common questions",
        keys: ["5.1. STATEMENTS", "5.2. ADDRESS CHANGES", "5.3. CANCELLATION", "HELP"],
      }),
  },
  "5.1. STATEMENTS": {
    description: "Explain billing statements",
    question: "How do I get a billing statement?",
    action: () => `To access your billing statements:

1. Log in to your account at https://example.com/dummy-link
2. Navigate to "Billing" or "Invoices" in your account dashboard
3. Select the month for which you need a statement
4. Click "Download PDF" or "View Statement"

You can view and download statements for the past 12 months. If you need older statements, please contact customer support.

To receive statements by email:
1. Go to "Account Settings"
2. Find "Notification Preferences"
3. Enable "Receive monthly billing statements via email"

If you need a specific statement for tax or reimbursement purposes, we can provide a certified copy. Contact our billing department at billing@example.com with your request.`,
  },
  "5.2. ADDRESS CHANGES": {
    description: "Explain address changes",
    question: "How do I change my address?",
    action: () => `To update your address on file:

1. Log in to your account at https://example.com/dummy-link
2. Go to "Account Settings" or "Profile"
3. Find the "Contact Information" or "Address" section
4. Click "Edit" or "Update"
5. Enter your new address details
6. Click "Save" or "Confirm Changes"

Important notes:
- Address changes may take 1-2 billing cycles to fully process
- If you have automatic payments set up, ensure your payment method address is also updated
- For security, major changes may require additional verification

If you're moving to a different country, please contact customer support as this may affect your service options and pricing.

Need help? Contact us at 1-800-123-4567 or support@example.com`,
  },
  "5.3. CANCELLATION": {
    description: "Explain cancellation",
    question: "How do I cancel my subscription?",
    action: () => `We're sorry to see you go. To cancel your subscription:

1. Log in to your account at https://example.com/dummy-link
2. Go to "Subscription" or "Account Settings"
3. Find the "Cancel Subscription" option
4. Follow the prompts to confirm cancellation

Please note:
- Cancellations are effective at the end of your current billing cycle
- You'll have access to your account until the end of the paid period
- Any unused portion of a paid subscription is non-refundable, unless required by law

If you're cancelling due to an issue with our service, we'd love to help resolve it. Please contact our retention team at 1-800-555-9876 to discuss your concerns.

After cancellation, you can reactivate your account within 30 days to restore your data. After 30 days, all data will be permanently deleted.

Need assistance? Contact us at support@example.com`,
  },
  "6. FORGOT PASSWORD": {
    description: "Help with forgotten passwords",
    question: "I forgot my password. What should I do?",
    action: () =>
      getMenu({
        tools,
        header: "Forgot Password",
        body: "Solve website and app password issues",
        button: "Common questions",
        keys: ["6.1. WEBSITE LOGIN", "6.2. APP LOGIN", "HELP"],
      }),
  },
  "6.1. WEBSITE LOGIN": {
    description: "Reset website password",
    question: "How do I reset my website password?",
    action: () => `https://example.com/dummy-link

1. Go to the login page: Navigate to the website or app where you'd like to reset your password.
2. Locate the "Forgot Password" link: This is usually found near the login button.
3. Enter your email address: Type in the email address associated with your account.
4. Submit the request: Click the "Submit" or "Reset Password" button.
5. Check your email: You should receive an email with a link to reset your password.
6. Follow the instructions: Click the link in the email and follow the on-screen instructions to create a new password.`,
  },
  "6.2. APP LOGIN": {
    description: "Reset app password",
    question: "How do I reset my app password?",
    action: () => `https://example.com/dummy-link

1. Open the app: Launch the app on your device.
2. Locate the "Forgot Password" or "Login Issues" option: This is usually found near the login button or in the app's settings.
3. Enter your email address: Type in the email address associated with your account.
4. Follow the instructions: The app will likely send you a password reset link or code to your email address.
5. Check your email: Look for the email from the app and click on the link or enter the code provided.
6. Create a new password: You'll be prompted to create a new password for your account.`,
  },
  "7. ACCOUNT LOCKED": {
    description: "Help with locked accounts",
    question: "My account is locked. What should I do?",
    action: () =>
      getMenu({
        tools,
        header: "Account Locked",
        body: "Select an option to proceed:",
        button: "Common questions",
        keys: ["7.1. UNLOCK ACCOUNT", "7.2. FORGOT ACCOUNT", "HELP"],
      }),
  },
  "7.1. UNLOCK ACCOUNT": {
    description: "Unlock a locked account",
    question: "How do I unlock my account?",
    action: () => `https://example.com/dummy-link

1. Locate the "Unlock Account" option: This is usually found near the login form or in a help section.
2. Enter your email address: Type in the email address associated with your locked account.
3. Verify your identity: You may be asked to answer a security question or provide additional information to verify your identity.
4. Follow the instructions: Once you've successfully verified your identity, follow the on-screen instructions to unlock your account.`,
  },
  "7.2. FORGOT ACCOUNT": {
    description: "Recover forgotten account",
    question: "I forgot my account details. How can I recover them?",
    action: () => `If you've forgotten your account details, please call our customer support at 1-800-123-4567.
Our support team is available 24/7 and will assist you in recovering your account information.

Please have the following information ready:
1. Your full name
2. The email address you think might be associated with the account
3. Any other identifying information (e.g., phone number, address)

For security reasons, we can't recover account details through this chat interface.`,
  },
  "8. LOGIN ERRORS": {
    description: "Help with login errors",
    question: "I'm having trouble logging in. What could be the issue?",
    action: () =>
      getMenu({
        tools,
        header: "Login Errors",
        body: "Solve website and app login issues",
        button: "Common questions",
        keys: ["8.1. WRONG PASSWORD", "8.2. ACCOUNT ISSUES", "8.3. TECHNICAL PROBLEMS", "HELP"],
      }),
  },
  "8.1. WRONG PASSWORD": {
    description: "Help with incorrect password",
    question: "What should I do if I keep entering the wrong password?",
    action: () => `https://example.com/dummy-link

1. Go to the login page: Navigate to the website or app where you'd like to reset your password.
2. Locate the "Forgot Password" link: This is usually found near the login button.
3. Enter your email address: Type in the email address associated with your account.
4. Submit the request: Click the "Submit" or "Reset Password" button.
5. Check your email: You should receive an email with a link to reset your password.
6. Follow the instructions: Click the link in the email and follow the on-screen instructions to create a new password.`,
  },
  "8.2. ACCOUNT ISSUES": {
    description: "Help with account-related login issues",
    question: "I'm having account-related login issues. What should I do?",
    action: () => `If you're experiencing account-related login issues, please follow these steps:

1. Double-check your username and password
2. Ensure your account is not locked (try the "Account Locked" option in the main menu)
3. Verify your email address is correctly entered

If you're still unable to log in, please call our dedicated account support team at 1-800-555-1234. They're available 24/7 and can assist you with any account-related issues.`,
  },
  "8.3. TECHNICAL PROBLEMS": {
    description: "Help with technical login problems",
    question: "I have technical problems logging in. What can I do?",
    action: () => `If you're facing technical problems during login, try these troubleshooting steps:

1. Clear your browser cache and cookies
2. Try a different browser or device
3. Check your internet connection
4. Disable any VPN or proxy services temporarily

If the problem persists, please contact our technical support team at 1-888-999-5678. They're available Monday to Friday, 9 AM to 6 PM EST, and can help resolve any technical issues you're experiencing.`,
  },
  "9. ACCOUNT CREATION": {
    description: "Help with creating a new account",
    question: "I'm having trouble creating a new account.",
    action: () =>
      getMenu({
        tools,
        header: "Account Creation",
        body: "Select the type of account creation issue you're facing:",
        button: "Common questions",
        keys: ["REGISTRATION ERRORS", "VERIFICATION ISSUES", "ACCOUNT RESTRICTIONS", "HELP"],
      }),
  },
  "REGISTRATION ERRORS": {
    description: "Help with registration errors",
    question: "I'm encountering errors during registration.",
    action: () => `Thanks. We've noted your issue and raised a ticket for it. Your ticket number is ${Math.random().toString(10).substring(2, 10)}`,
  },
  "VERIFICATION ISSUES": {
    description: "Help with account verification issues",
    question: "I'm having problems verifying my account.",
    action: () => `Thanks. We've noted your issue and raised a ticket for it. Your ticket number is ${Math.random().toString(10).substring(2, 10)}`,
  },
  "ACCOUNT RESTRICTIONS": {
    description: "Help with account creation restrictions",
    question: "I'm unable to create an account due to restrictions.",
    action: () => `Thanks. We've noted your issue and raised a ticket for it. Your ticket number is ${Math.random().toString(10).substring(2, 10)}`,
  },
};

function randomDate() {
  return new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
