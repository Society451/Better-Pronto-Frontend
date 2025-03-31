// Sample message data - in a real app, this would come from an API
const messageData = {
    1: [ // Chat ID 1 (John Doe)
        {
            sender: "John Doe",
            text: "Hello! How are you?",
            timestamp: "10:00 AM",
            isSent: false
        },
        {
            sender: "You",
            text: "I'm good, thanks! How about you?",
            timestamp: "10:01 AM",
            isSent: true
        }
    ],
    2: [ // Chat ID 2 (Jane Smith)
        {
            sender: "Jane Smith",
            text: "Did you finish that project?",
            timestamp: "09:45 AM",
            isSent: false
        },
        {
            sender: "You",
            text: "Almost done, will send it by tomorrow!",
            timestamp: "09:47 AM",
            isSent: true
        }
    ]
};

// Function to load and display messages for a specific chat
function loadMessages(chatId) {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    // Get messages for the selected chat
    const messages = messageData[chatId] || [];
    
    // Create and append message elements
    messages.forEach(message => {
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to the bottom of the messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Function to create a message element
function createMessageElement(message) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.isSent ? 'sent' : 'received'}`;
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    // Create sender element
    const senderElement = document.createElement('span');
    senderElement.className = 'sender';
    senderElement.textContent = message.sender;
    
    // Create timestamp element
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = message.timestamp;
    
    // Add sender and timestamp to header
    messageHeader.appendChild(senderElement);
    messageHeader.appendChild(timestamp);
    
    // Create message text
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message.text;
    
    // Add header and text to message
    messageElement.appendChild(messageHeader);
    messageElement.appendChild(messageParagraph);
    
    return messageElement;
}

// Initialize the messages component
document.addEventListener('DOMContentLoaded', function() {
    // Load messages for the first chat by default
    loadMessages(1);
    
    // Listen for chat selection changes
    document.addEventListener('chatSelected', function(e) {
        if (e.detail && e.detail.chatId) {
            loadMessages(e.detail.chatId);
        }
    });
    
    // Expose the addMessageToChat function globally so the message input component can use it
    window.addMessageToChat = function(sender, text, isSent) {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;
        
        // Create message data
        const message = {
            sender: sender,
            text: text,
            timestamp: getCurrentTime(),
            isSent: isSent
        };
        
        // Create and append message element
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to the bottom of messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
});

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