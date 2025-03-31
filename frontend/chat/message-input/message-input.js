// Function to initialize the message input component
function initMessageInput() {
    const messageInput = document.querySelector('#message-input');
    const sendButton = document.querySelector('#send-button');
    
    if (!messageInput || !sendButton) return;
    
    // Handle send button click
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
    
    // Handle Enter key press (send message)
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default to avoid new line
            sendMessage();
        }
    });
}

// Function to send a message
function sendMessage() {
    const messageInput = document.querySelector('#message-input');
    const messageText = messageInput.value.trim();
    
    if (messageText) {
        // In a real application, this would send the message to a server
        // For now, we'll just add it to the messages container
        addMessageToChat('You', messageText, true);
        
        // Clear the input field
        messageInput.value = '';
    }
}

// Function to add a message to the chat
function addMessageToChat(sender, text, isSent) {
    const messagesContainer = document.querySelector('#messages');
    
    if (!messagesContainer) return;
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    // Create sender element
    const senderElement = document.createElement('span');
    senderElement.className = 'sender';
    senderElement.textContent = sender;
    
    // Create timestamp element
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = getCurrentTime();
    
    // Add sender and timestamp to header
    messageHeader.appendChild(senderElement);
    messageHeader.appendChild(timestamp);
    
    // Create message text
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = text;
    
    // Add header and text to message
    messageElement.appendChild(messageHeader);
    messageElement.appendChild(messageParagraph);
    
    // Add message to container
    messagesContainer.appendChild(messageElement);
    
    // Scroll to the bottom of messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Helper function to get current time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Pad with zero if needed
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutes}`;
}

// Initialize message input when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMessageInput();
});