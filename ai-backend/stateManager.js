// stateManager.js

// Simple in-memory session tracker for multi-step slot filling.
// In a production backend, this would use Redis mapped to a user/session ID.
const sessions = {};

function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      hasGreeted: false,
      currentFlow: null,
      step: null,
      data: {}
    };
  }
  return sessions[sessionId];
}

function updateSession(sessionId, updates) {
  const session = getSession(sessionId);
  Object.assign(session, updates);
  return session;
}

function clearSession(sessionId) {
  const existing = sessions[sessionId];
  sessions[sessionId] = {
    hasGreeted: existing ? existing.hasGreeted : false,
    currentFlow: null,
    pendingAction: null,
    step: null,
    data: {}
  };
}

module.exports = {
  getSession,
  updateSession,
  clearSession
};
