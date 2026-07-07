// contextController.js

function getContextCapabilities(currentScreen) {
  if (currentScreen === 'Wallet') {
    return [
      "Navigate to your dashboard to view active assets.",
      "Add new tokens directly to your active tracking list.",
      "Remove or hide tokens from the dashboard view.",
      "Fetch your deposit QR codes or generate secure on-chain burner addresses.",
      "Send or schedule outbound crypto payments across supported networks."
    ].join('\n- ');
  }
  
  if (currentScreen === 'History') {
    return [
      "Filter your transactions dynamically by specific date ranges.",
      "Isolate only incoming deposits or outgoing withdrawals.",
      "Search for specific payments using a Transaction ID.",
      "Verify on-chain activity by scanning transaction hash strings."
    ].join('\n- ');
  }
  
  if (currentScreen === 'Settings') {
    return [
      "Toggle between dark and light themes globally.",
      "Switch your baseline fiat display currency.",
      "Update your application language and locale.",
      "Test network speeds by actively checking local latency pings.",
      "Update and toggle email or push notification preferences."
    ].join('\n- ');
  }

  // Fallback
  return "I can assist you with various tasks depending on the screen you are currently viewing.";
}

module.exports = {
  getContextCapabilities
};
