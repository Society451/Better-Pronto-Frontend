// Sample message data - in a real app, this would come from an API
const messageData = {
    1: [ // Chat ID 1 (John Doe)
        {
            id: 1,
            sender: "John Doe",
            text: "Hello! How are you?",
            timestamp: "10:00 AM",
            isSent: false
        },
        {
            id: 2,
            sender: "You",
            text: "I'm good, thanks! How about you?",
            timestamp: "10:01 AM",
            isSent: true
        }
    ],
    2: [ // Chat ID 2 (Jane Smith)
        {
            id: 3,
            sender: "Jane Smith",
            text: "Did you finish that project?",
            timestamp: "09:45 AM",
            isSent: false
        },
        {
            id: 4,
            sender: "You",
            text: "Almost done, will send it by tomorrow!",
            timestamp: "09:47 AM",
            isSent: true
        }
    ]
};

// Keep track of next message ID
let nextMessageId = 5;

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
    messageElement.dataset.messageId = message.id;
    
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
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'message-delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = 'Delete message';
    
    // Add header, text, and delete button to message
    messageElement.appendChild(messageHeader);
    messageElement.appendChild(messageParagraph);
    messageElement.appendChild(deleteButton);
    
    return messageElement;
}

// Function to delete a message
function deleteMessage(messageId, chatId) {
    // Find the chat data
    const chatMessages = messageData[chatId];
    if (!chatMessages) return;
    
    // Find the message index
    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    // Remove the message from data
    chatMessages.splice(messageIndex, 1);
    
    // Remove the message element from DOM
    const messageElement = document.querySelector(`.message[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.classList.add('deleting');
        // Add fade-out animation
        messageElement.style.opacity = '0';
        messageElement.style.height = '0';
        messageElement.style.margin = '0';
        messageElement.style.padding = '0';
        messageElement.style.transition = 'opacity 0.3s, height 0.3s, margin 0.3s, padding 0.3s';
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }
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
    
    // Set up global shift key tracking
    let shiftKeyPressed = false;
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Shift') {
            shiftKeyPressed = true;
            document.querySelectorAll('.message-delete-btn').forEach(btn => {
                btn.classList.add('delete-active');
            });
        }
    });
    
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Shift') {
            shiftKeyPressed = false;
            document.querySelectorAll('.message-delete-btn').forEach(btn => {
                btn.classList.remove('delete-active');
            });
        }
    });
    
    // Event delegation for delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.message-delete-btn')) {
            const messageElement = e.target.closest('.message');
            if (messageElement) {
                const messageId = parseInt(messageElement.dataset.messageId);
                const currentChatId = document.querySelector('.chat-item.selected')?.dataset.id;
                
                if (currentChatId) {
                    deleteMessage(messageId, parseInt(currentChatId));
                }
            }
        }
    });
    
    // Expose the addMessageToChat function globally so the message input component can use it
    window.addMessageToChat = function(sender, text, isSent) {
        const messagesContainer = document.getElementById('messages');
        const currentChatId = document.querySelector('.chat-item.selected')?.dataset.id;
        if (!messagesContainer || !currentChatId) return;
        
        // Create message data
        const message = {
            id: nextMessageId++,
            sender: sender,
            text: text,
            timestamp: getCurrentTime(),
            isSent: isSent
        };
        
        // Add to data store
        const chatId = parseInt(currentChatId);
        if (!messageData[chatId]) {
            messageData[chatId] = [];
        }
        messageData[chatId].push(message);
        
        // Create and append message element
        const messageElement = createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to the bottom of messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Return the created message (useful for testing/debugging)
        return message;
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