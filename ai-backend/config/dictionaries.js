// dictionaries.js

const COMPOSITE_DICTIONARY = {
  Openers: [
    "Hello there.",
    "Greetings.",
    "Welcome to the console.",
    "Ready when you are.",
    "Systems online.",
    "At your service.",
    "Hi! Let's get started.",
    "Let's dive in."
  ],
  Active_Screen_Menus: {
    Wallet: [
      "From here, we can add tracking for new tokens, generate secure burner addresses on native chains, or schedule an outbound asset transfer.",
      "I can help you orchestrate transfers, provision new on-chain addresses, or manipulate your active dashboard tracking list.",
      "Your wallet powers include generating local offline addresses, removing tracked assets, and scheduling multi-chain sends.",
      "We can manage your asset list, provision a secure burner keypair, or dispatch tokens across supported chains.",
      "In this view, you can insert new contract trackers, hide existing assets, compute burner wallets, or initiate a fund transfer.",
      "Available operations: Add/remove dashboard tokens, generate secure multi-chain keys, and execute localized outgoing transfers."
    ],
    History: [
      "Here, you can filter your ledger dynamically, isolate incoming deposits or outgoing withdrawals, or search for specific Transaction IDs.",
      "I can sort your past activity by date, filter exclusively for incoming or outgoing funds, and query specific hash strings.",
      "Your ledger capabilities: filtering transactions, extracting specific date ranges, viewing deposit logs, or searching by exact TxID.",
      "We can audit your transaction ledger, refine search queries by status (deposit/withdrawal), or jump directly to a known hash.",
      "In this view, you have advanced search powers over your ledger: sorting by direction, querying hashes, or clearing existing filters.",
      "Available operations: Ledger audit filtering, targeted deposit/withdrawal isolation, and direct TxID cross-referencing."
    ],
    Settings: [
      "From Settings, we can toggle global dark/light themes, swap your fiat display currency, update local language options, or test network latency.",
      "I can assist with UI theme adjustments, fiat currency localization, language translation switching, or performing live network ping tests.",
      "Your config powers include theme manipulation, currency tracking adjustments, setting biometric/2FA security parameters, and executing latency pings.",
      "We can switch your app appearance, handle security configurations like 2FA, update display languages, or run network diagnostic tests.",
      "In this configuration view, you can actively toggle Dark Mode, re-base your fiat currency, change localized languages, or test ping speeds.",
      "Available operations: Theme engine toggling, language localization, currency rebasing, security controls, and live network diagnostics."
    ],
    TokenDetail: [
      "On this token view, I can pull live price data, 24-hour performance metrics, market cap, and trading volume directly from CoinGecko.",
      "I can run a scam indicator check on this token's contract, fetch current ROI analytics, or give you a full market snapshot.",
      "Available here: Live price lookup, percentage change analysis, all-time-high comparison, volume metrics, and scam contract scanning.",
      "In this view, I can give you detailed token analytics — price, market cap, 24h change, ATH, and volume — all sourced live."
    ]
  },
  Interactive_Slot_Prompts: {
    AWAITING_ASSET: [
      "Which specific coin and network are we targeting?",
      "Please specify the token symbol and the blockchain layer.",
      "What is the exact asset and network for this operation?",
      "Specify the token and network below.",
      "I need the exact coin ticker and the host blockchain.",
      "Provide the target asset and its native network."
    ],
    AWAITING_ADDRESS: [
      "Got it. What is the destination hash address?",
      "Understood. Please paste the target public key.",
      "Perfect. Where are we routing these assets to?",
      "Acknowledged. I need the receiver's deposit address.",
      "Confirmed. What's the destination string?",
      "Address received. Just kidding, I still need the target address." // little AI humor
    ],
    AWAITING_TIME: [
      "Excellent. When should we execute this transfer?",
      "Should this transaction be queued immediately or scheduled?",
      "Do you want to send this now, or pick a later time?",
      "Got the address. Is this an immediate execution?",
      "When do you want to dispatch this transaction?",
      "Should I push this to the network right now?"
    ],
    AWAITING_SEARCH_PARAMETER: [
      "What specific data point are we searching for?",
      "Please provide the search string or Transaction ID.",
      "What date range or hash are we isolating?",
      "Enter the specific parameter you want to cross-reference.",
      "I need the target data to execute the ledger filter.",
      "Provide the search value to refine the history view."
    ]
  },
  Action_Confirmations: [
    "Execution complete.",
    "All set.",
    "Done.",
    "Processed successfully.",
    "The system has executed the command.",
    "Confirmed.",
    "Action successfully queued.",
    "Operation finished."
  ],
  Closing_Flourishes: [
    "What are we working on next?",
    "Is there anything else?",
    "How else can I assist?",
    "What's our next move?",
    "Awaiting further instructions.",
    "Let me know what's next on the agenda."
  ],
  Fallbacks: [
    "I'm not quite catching that intent. Try using blunt commands like 'filter deposits' or 'add BTC'.",
    "That request falls outside my current parameters. Try focusing on the active screen's capabilities.",
    "I couldn't cross-reference that command. Feel free to ask 'What can you do?' for options.",
    "My parser missed that one. Please try a simpler, direct action verb.",
    "I'm built for specific concierge tasks. Can we try rephrasing that to match this screen's actions?",
    "Command not recognized in this context. Use concise keywords if possible.",
    "I didn't detect a valid intersection. Check my capability menu by typing 'help'."
  ]
};

function getRandomBlock(blockName, subKey = null) {
  let arr;
  if (subKey) {
    arr = COMPOSITE_DICTIONARY[blockName][subKey];
  } else {
    arr = COMPOSITE_DICTIONARY[blockName];
  }
  
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildCompositeResponse(blocks) {
  return blocks.map(b => getRandomBlock(b.name, b.subKey)).filter(Boolean).join(' ');
}

module.exports = {
  COMPOSITE_DICTIONARY,
  getRandomBlock,
  buildCompositeResponse
};
