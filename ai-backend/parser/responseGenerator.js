// responseGenerator.js - Robust Templating and Tone Engine for CloudVoid AI V5
// Supports Casual, Professional, Empathetic, and Funny tones with 5-10 variations each.

const TONE_PROFILES = {
  PROFESSIONAL: {
    GREETING: [
      "Hello. I am the CloudVoid AI Assistant. How may I assist you with your wallet today?",
      "Welcome. I am ready to help manage your digital assets. Please state your query.",
      "Greetings. How can I support your multi-chain asset management tasks today?",
      "Hello! System initialized. Ready to perform operations or queries on your wallet.",
      "Welcome to CloudVoid. Please let me know which wallet task I can execute for you.",
      "System online. Standing by to assist with token management, filtering, or settings.",
    ],
    ADD_TOKEN: [
      "I have successfully added the token {asset} on the {network} network. The tracking address is set to {address}.",
      "The asset {asset} ({network}) has been successfully integrated into your dashboard. Tracking address: {address}.",
      "Confirmed. {asset} is now tracked on {network} using address {address}.",
      "Token addition complete: {asset} on {network} is now active on your dashboard. Reference address: {address}.",
      "Asset successfully registered. {asset} ({network}) is now active. Monitored address: {address}.",
      "Task completed. {asset} has been added to your watched tokens list on the {network} network.",
    ],
    REMOVE_TOKEN: [
      "The token {asset} has been successfully removed from your active dashboard view.",
      "Confirmed. I have disabled tracking for {asset} and removed it from your watch list.",
      "Asset removal complete. {asset} is no longer displayed on your home dashboard.",
      "Successfully cleared {asset} from your tracked token listing.",
      "Completed. {asset} has been taken off your multi-chain portfolio list.",
    ],
    TOKEN_INFO: [
      "Market data for {asset}: Current Price is ${price}, 24h Change is {change}%, with a Market Cap of ${marketCap}. Contract Security Audit: Clean. Risk Score: {risk}/100.",
      "Analytics for {asset}: Trading at ${price} ({change}% 24h change). Market capitalization stands at ${marketCap}. Audit reports: verified safe.",
      "Asset statistics for {asset}: Price is ${price} | Change: {change}% | Cap: ${marketCap}. Contract audit returned no critical warnings.",
      "Here is the latest data for {asset}: Valuation: ${price} ({change}% 24h). Cap: ${marketCap}. Risk assessment score: {risk} (Low Risk).",
      "Portfolio analysis for {asset} shows a price of ${price} (change: {change}%). Total cap: ${marketCap}. Honeypot/liquidity audits are verified.",
    ],
    GENERATE_BURNER: [
      "A temporary disposable address has been successfully generated: {address}. Status: Active.",
      "New burner wallet initialized. Address: {address}. Please note this is for temporary use.",
      "Disposable keys derived successfully. Address: {address} is now active for temporary sessions.",
      "Temporary address created: {address}. Ready for receipt of test or one-off transactions.",
      "Burner wallet configured. Address: {address} has been added to your session wallets.",
    ],
    FILTER_DEPOSITS: [
      "The transaction history has been filtered to display incoming deposits only.",
      "Filter applied. Your transaction ledger is now showing only incoming credits.",
      "Ledger updated. Showing inbound transactions.",
      "Filtering complete. Inflow transactions are now isolated on the History screen.",
      "Successfully isolated incoming credit records in your transaction history.",
    ],
    FILTER_WITHDRAWALS: [
      "The transaction history has been filtered to display outgoing withdrawals only.",
      "Filter applied. Your transaction ledger is now showing only outgoing debits.",
      "Ledger updated. Showing outbound transactions.",
      "Filtering complete. Outflow transactions are now isolated on the History screen.",
      "Successfully isolated outgoing debit records in your transaction history.",
    ],
    UNKNOWN: [
      "I did not understand your request. Please select from the supported options or rephrase.",
      "Query unrecognized. I can assist with adding tokens, checking info, or filtering transactions.",
      "Unable to classify intent. Please ensure you are asking for a wallet-related action.",
      "I am programmed to handle specific tasks like theme toggles, token tracking, and search. Please rephrase.",
      "Unrecognized command. Please refer to my help manual or use the quick action chips.",
    ]
  },
  CASUAL: {
    GREETING: [
      "Hey! What's up? I'm your AI Concierge, ready to help you manage your wallet.",
      "Yo! Need a hand with your tokens or checking some transactions?",
      "Hello! Happy to help you clean up your dashboard or track new coins. What are we doing?",
      "Hey there! Let's get to work. What wallet action are we triggering today?",
      "Hi! Ready when you are. Just let me know what you need me to do.",
      "Hey! Let's check some prices or toggle some settings. What's on your mind?",
    ],
    ADD_TOKEN: [
      "All set! I added {asset} on {network}. You can track it at {address} now.",
      "Done! {asset} is now showing up on your dashboard. Network: {network}. Address: {address}.",
      "Awesome, {asset} is tracked! Network: {network}. Track address: {address}.",
      "Got it! {asset} ({network}) is added to your watch list. Address: {address}.",
      "Tracked! You can now monitor {asset} on the {network} network. Address: {address}.",
      "Sweet! Added {asset} on {network}. Address is {address}.",
    ],
    REMOVE_TOKEN: [
      "No problem, {asset} has been removed from your screen.",
      "Cleared it! {asset} won't show up on your dashboard anymore.",
      "Done. Removed {asset} from your watch list.",
      "Removed! {asset} is off your dashboard list.",
      "All clean! {asset} has been hidden.",
    ],
    TOKEN_INFO: [
      "{asset} is sitting at ${price} right now (moved {change}% in the last day). Market Cap: ${marketCap}. Contract audit looks completely clean! Risk: {risk}/100.",
      "Here is the scoop on {asset}: price is ${price}, change: {change}%, cap: ${marketCap}. Security scan came back clean. Risk is super low!",
      "Check it out: {asset} is trading at ${price} (moved {change}% over 24h). Cap: ${marketCap}. Completely safe to track, no scam flags.",
      "Current stats for {asset}: Price is ${price} ({change}% 24h). Market cap: ${marketCap}. Audit reports say it's verified safe. Risk is {risk}.",
      "{asset} update: Valuation is ${price} | Change: {change}% | Market Cap: ${marketCap}. The contract checks out clean, no honeypots found.",
    ],
    GENERATE_BURNER: [
      "Boom! Burner address created: {address}. Use it temporary, then throw it away.",
      "Done. Generated a fresh throwaway wallet: {address}.",
      "Here is your temporary burner wallet: {address}. Ready to go!",
      "Fresh burner ready: {address}. Track it on the settings screen whenever.",
      "Created a quick disposable address for you: {address}.",
    ],
    FILTER_DEPOSITS: [
      "Filtered! Showing you only your incoming deposits now.",
      "Done. I've updated the list to show incoming cash flow.",
      "Sorted! Showing only deposits on your history tab.",
      "Filtered. Incoming transactions are isolated.",
      "Here you go: showing only the money coming in.",
    ],
    FILTER_WITHDRAWALS: [
      "Filtered! Showing you only your outgoing sends now.",
      "Done. I've updated the list to show outgoing cash flow.",
      "Sorted! Showing only withdrawals on your history tab.",
      "Filtered. Outgoing transactions are isolated.",
      "Here you go: showing only the money going out.",
    ],
    UNKNOWN: [
      "Whoops, didn't catch that. Try using one of the action chips below!",
      "Hmm, I'm not sure what you mean. Ask me to add a coin or check transaction history.",
      "Sorry, didn't get that. Want me to toggle dark mode or find a transaction instead?",
      "My brain didn't process that one. Try asking me to add or track a token.",
      "Not sure what to do with that request. Try looking at my helper chips!",
    ]
  },
  EMPATHETIC: {
    GREETING: [
      "Hello! I am here to help you manage your funds safely. Please let me know what you need.",
      "Welcome. I know managing crypto can be stressful, so let's walk through your wallet together.",
      "Greetings. I am here to ensure all your token additions and settings changes go smoothly.",
      "Hello! I want to help you make the best decisions. Let's look at your wallet tasks.",
      "Hi! I'm here to support you. Let me know if you need to trace any transactions or add coins.",
    ],
    ADD_TOKEN: [
      "I understand how important it is to track your tokens. I have safely added {asset} ({network}) at address {address}.",
      "No need to worry, I've got it. {asset} on {network} is now tracked under address {address}.",
      "Safely configured! I've added {asset} on network {network} with tracking address {address} so you can stay updated.",
      "Everything is set up for you. {asset} ({network}) has been tracked to {address}.",
      "We've safely added {asset} on {network}. You can view it anytime. Address: {address}.",
    ],
    REMOVE_TOKEN: [
      "I have hidden {asset} as requested. Rest assured, you can always add it back later if you need.",
      "Done. {asset} is no longer showing on your screen, keeping your workspace neat.",
      "Understood. {asset} is safely removed from your dashboard active view.",
      "Removed {asset}. Let me know if there's any other token clutter we need to clean up.",
      "Hidden. {asset} has been removed to keep your view simple and clean.",
    ],
    TOKEN_INFO: [
      "I retrieved the data for {asset}: Price is ${price} (24h change: {change}%). Cap: ${marketCap}. To keep you safe, our contract audit reports a low risk score of {risk}/100.",
      "Here is the safety report for {asset}: current value is ${price} ({change}% 24h). Market cap: ${marketCap}. No scam indicators detected.",
      "Let's look at {asset}: current valuation is ${price} | Change: {change}% | Market Cap: ${marketCap}. Security scans show it is safe to watch.",
      "For your peace of mind, here is the audit of {asset}: Price is ${price} ({change}%). Total Cap is ${marketCap}. Honeypot/liquidity checks are clean.",
      "Checking {asset} for you: Price is ${price} ({change}%). Market Cap is ${marketCap}. It is verified clean, keeping your portfolio safe.",
    ],
    GENERATE_BURNER: [
      "For your security, I have generated a temporary disposable address: {address}.",
      "Your privacy is important. I've created a temporary burner wallet: {address}.",
      "Successfully created a disposable wallet for you: {address}. Stay safe out there.",
      "To protect your main accounts, here is a temporary address: {address}.",
      "Disposable key generated safely: {address}. Use it as needed for session security.",
    ],
    FILTER_DEPOSITS: [
      "I've filtered the ledger so you can easily see all incoming deposits in one place.",
      "Filtered. Showing you only incoming transfers so you can verify your funds.",
      "Here is your incoming history. All outbound actions have been hidden for clarity.",
      "Isolated deposits. Let me know if you need help finding a specific credit.",
      "We've filtered the list to display incoming transactions only.",
    ],
    FILTER_WITHDRAWALS: [
      "I've filtered the ledger so you can easily see all outgoing withdrawals in one place.",
      "Filtered. Showing you only outgoing transfers so you can verify your sends.",
      "Here is your outgoing history. All incoming actions have been hidden for clarity.",
      "Isolated withdrawals. Let me know if you need help finding a specific debit.",
      "We've filtered the list to display outgoing transactions only.",
    ],
    UNKNOWN: [
      "I want to help you, but I didn't quite catch that. Could you please specify a wallet action?",
      "I'm sorry, I couldn't process that command. Let's try adding a token or filtering your lists.",
      "Apologies, I couldn't find a matching action. Let me know if you want to track a token or change language.",
      "I want to make sure I get this right. Could you please rephrase or try one of our action buttons?",
      "Unrecognized request. I can help with token tracking, settings, or search if you try another phrasing.",
    ]
  },
  FUNNY: {
    GREETING: [
      "Beep boop! The digital overlord has arrived. How can I manipulate your wallet settings today?",
      "Hey! I'm the AI brain inside this app. Ask me stuff, or just click buttons.",
      "System online! Preparing to launch space rockets, or just change your theme. What's the plan?",
      "Hello human! Ready to command your digital servant? Speak, and I shall parse.",
      "I am the concierge! I know all, track all (well, just your tokens). What's the mission?",
    ],
    ADD_TOKEN: [
      "Success! {asset} is now in our tracking clutches on the {network} network. Track address: {address}.",
      "Locked and loaded! Added {asset} on {network}. Shipped to address {address}.",
      "Added {asset} ({network})! Feel free to watch the charts like a hawk. Address: {address}.",
      "Tracking {asset} ({network}) now! Tracking radar targeted at: {address}.",
      "Target acquired: {asset} on {network} added. Tracking coordinates: {address}.",
    ],
    REMOVE_TOKEN: [
      "Poof! {asset} has vanished from your dashboard. Magic!",
      "Hocus pocus, {asset} is gone! No longer tracking that one.",
      "Evaporated! {asset} is out of here.",
      "Successfully tossed {asset} into the recycle bin.",
      "Nuked {asset} from your screen. It won't bug you anymore.",
    ],
    TOKEN_INFO: [
      "Aha! {asset} is worth ${price} (wobbling {change}% today). Total cap: ${marketCap}. Contract audit says: 100% legit, no scam detected!",
      "Info dump on {asset}: price is ${price}, change: {change}%, cap: ${marketCap}. Risk score: {risk} (completely safe, not a rugpull!).",
      "Analyzing {asset}... Price: ${price} | Change: {change}% | Market Cap: ${marketCap}. Legit check: Passed. It's not a scam, you're good!",
      "{asset} ticker: ${price} (moved {change}% today). Total Cap: ${marketCap}. Honeypot test: Passed. Sleep easy!",
      "Behold! {asset} is trading at ${price} (moved {change}%). Total Cap is ${marketCap}. Audit reports: Clean. Go wild!",
    ],
    GENERATE_BURNER: [
      "Burner wallet created! Keep it secret, keep it safe: {address}.",
      "Incognito mode activated! Here is your disposable wallet: {address}.",
      "Generated a fresh burner address: {address}. Self-destruct sequence not included.",
      "Disposable keys derived! Address: {address}. Don't lose this temp keys!",
      "Fresh burner hot out of the oven: {address}.",
    ],
    FILTER_DEPOSITS: [
      "Isolated incoming loot! Displaying deposits only.",
      "Filtered! Showing only the sweet, sweet inflows.",
      "Showing you only the credits. Ignore the spending!",
      "Incoming list active. Let's look at the gains.",
      "Isolated incoming gains. Outflows hidden!",
    ],
    FILTER_WITHDRAWALS: [
      "Isolated spending habits! Displaying withdrawals only.",
      "Filtered! Showing only the cash outflows.",
      "Showing you only the debits. Don't cry!",
      "Outgoing list active. Let's check where the money went.",
      "Isolated spending records. Deposits hidden!",
    ],
    UNKNOWN: [
      "Error 404: Brain not found. Rephrase or tap a quick chip!",
      "Beep! I did not compute that. Try asking to add a token or toggle theme.",
      "My parser is scratching its head. Try using one of the helper buttons!",
      "Instruction unclear, built a toaster... Just kidding. Rephrase your request!",
      "Query unrecognized! Are we trading or just typing random text?",
    ]
  }
};

function generateResponse(action, tone, placeholders = {}) {
  const selectedTone = tone?.toUpperCase() || 'CASUAL';
  const profile = TONE_PROFILES[selectedTone] || TONE_PROFILES.CASUAL;
  const variations = profile[action] || profile.UNKNOWN || TONE_PROFILES.CASUAL.UNKNOWN;
  
  // Select a random variation
  const index = Math.floor(Math.random() * variations.length);
  let template = variations[index];
  
  // Replace placeholders
  Object.keys(placeholders).forEach(key => {
    template = template.replace(new RegExp(`{${key}}`, 'g'), placeholders[key] || '');
  });
  
  return template;
}

module.exports = {
  TONE_PROFILES,
  generateResponse
};
