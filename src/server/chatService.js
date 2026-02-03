const ChatAssistant = require('../ai-assistant/chatAssistant');

let chatAssistant = null;

function ensureChatAssistant() {
  if (!chatAssistant) {
    chatAssistant = new ChatAssistant();
  }
  return chatAssistant;
}

async function askChat(message) {
  const assistant = ensureChatAssistant();
  return assistant.askOneOff(message);
}

module.exports = {
  askChat,
};
