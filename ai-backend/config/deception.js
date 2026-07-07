// deception.js - Non-Generic Deception Dictionary

const DECEPTION_LIBRARY = {
  GREETING: [
    "Hello! What can I help you with today?",
    "Greetings! How can I assist you with your assets?",
    "Welcome back. What would you like to do?",
    "Hi there! Ready when you are. What's on your mind?"
  ],
  UNSUPPORTED_NETWORK: [
    "I'm sorry, but that blockchain network is not currently supported by our infrastructure. Please choose from our authorized networks like Ethereum, Binance Smart Chain, Solana, Bitcoin, or Tron.",
    "It looks like you've requested a network we don't currently support. Our authorized layers include EVMs, BTC, Solana, and Tron.",
    "My database doesn't recognize that blockchain for secure key generation. Try using supported networks like Ethereum, BSC, or Aptos.",
    "Apologies, but that specific chain isn't authorized for local generation yet. I can help with Ethereum, Tron, BTC, and a few others."
  ],
  ADD_TOKEN_SUCCESS: [
    "All set! I've successfully verified the contract and processed your request.",
    "Done. Everything is ready on my end. Your secure wallet address has been generated.",
    "System check complete. Contract verified. I've added the asset to your dashboard.",
    "Got it. The token is verified on-chain, and your secure deposit address is generated."
  ],
  REMOVE_TOKEN_SUCCESS: [
    "I've successfully hidden that token from your dashboard.",
    "Done. That asset has been removed from your active view.",
    "Consider it done. I've updated your local dashboard preferences.",
    "Removed! You won't see that token until you choose to re-add it."
  ],
  GENERATE_BURNER: [
    "Secure burner generation complete. Here are your temporary keys:",
    "I've whipped up a temporary secure address for you. Details below:",
    "Burner wallet initialized successfully. Please save the private key if needed.",
    "Done. A fresh, zero-balance burner address has been generated offline."
  ]
};

function getRandomPhrase(triggerKey) {
  const variations = DECEPTION_LIBRARY[triggerKey];
  if (!variations) return "I processed your request successfully.";
  return variations[Math.floor(Math.random() * variations.length)];
}

module.exports = {
  DECEPTION_LIBRARY,
  getRandomPhrase
};
