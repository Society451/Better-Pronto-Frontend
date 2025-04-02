// Messages state tracking
let currentMessages = [];
let currentChatId = null;
let currentChatName = null;
let isLoadingMessages = false;

// Create message element from API message data
function createMessageFromAPIData(message) {
    // Create message container with appropriate class based on if it's from the current user
    const messageContainer = document.createElement('div');
    const isCurrentUser = message.author === 'You' || message.author?.includes('You'); // Consider better user identification
    messageContainer.className = `message-container ${isCurrentUser ? 'sent' : 'received'}`;
    messageContainer.dataset.messageId = message.message_id;
    
    // Create profile picture element
    const profilePic = document.createElement('div');
    profilePic.className = 'profile-picture';
    
    // Create and add profile image if URL is provided
    if (message.profilepicurl) {
        const img = document.createElement('img');
        img.src = message.profilepicurl;
        img.alt = message.author || 'User';
        img.className = 'profile-img';
        
        // Handle image loading errors by showing initials instead
        img.onerror = () => {
            img.style.display = 'none';
            const initials = createInitialsElement(message.author || 'User');
            profilePic.appendChild(initials);
        };
        
        profilePic.appendChild(img);
    } else {
        // If no profile pic URL, show initials
        const initials = createInitialsElement(message.author || 'User');
        profilePic.appendChild(initials);
    }
    
    // Create status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator status-offline'; // Default to offline
    profilePic.appendChild(statusIndicator);
    
    // Create message content container
    const messageElement = document.createElement('div');
    messageElement.className = 'message-content';
    
    // Create message header
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    // Create sender element
    const senderElement = document.createElement('span');
    senderElement.className = 'sender';
    senderElement.textContent = message.author || 'Unknown User';
    
    // Convert timestamp to readable format
    let formattedTimestamp;
    try {
        if (message.time_of_sending) {
            const date = new Date(message.time_of_sending * 1000); // Convert from Unix timestamp
            formattedTimestamp = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            formattedTimestamp = getCurrentTime();
        }
    } catch (e) {
        console.error('Error parsing timestamp:', e);
        formattedTimestamp = getCurrentTime();
    }
    
    // Create timestamp element
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    timestamp.textContent = formattedTimestamp;
    
    // Add sender and timestamp to header
    messageHeader.appendChild(senderElement);
    messageHeader.appendChild(timestamp);
    
    // Create message text
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message.content || '';
    
    // If message was edited, add an indicator
    if (message.edit_count > 0) {
        const editedIndicator = document.createElement('span');
        editedIndicator.className = 'edited-indicator';
        editedIndicator.textContent = ' (edited)';
        messageParagraph.appendChild(editedIndicator);
    }
    
    // Add reactions if present
    if (message.reactions && message.reactions.length > 0) {
        const reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        
        message.reactions.forEach(reaction => {
            const reactionElement = document.createElement('span');
            reactionElement.className = 'reaction';
            reactionElement.textContent = reaction.emoji || reaction.type || '👍';
            reactionElement.dataset.count = reaction.count || 1;
            reactionsContainer.appendChild(reactionElement);
        });
        
        messageElement.appendChild(reactionsContainer);
    }
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'message-delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = 'Delete message';
    
    // Add header, text, and delete button to message content
    messageElement.appendChild(messageHeader);
    messageElement.appendChild(messageParagraph);
    messageElement.appendChild(deleteButton);
    
    // Add profile picture and message content to the container
    messageContainer.appendChild(profilePic);
    messageContainer.appendChild(messageElement);
    
    return messageContainer;
}

// Helper function to create an element displaying user initials
function createInitialsElement(fullName) {
    const initialsDiv = document.createElement('div');
    initialsDiv.className = 'profile-initials';
    
    // Extract initials from name
    const initials = fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    
    initialsDiv.textContent = initials;
    
    // Generate a consistent color based on the name
    const hue = stringToHue(fullName);
    initialsDiv.style.backgroundColor = `hsl(${hue}, 60%, 80%)`;
    initialsDiv.style.color = `hsl(${hue}, 80%, 30%)`;
    
    return initialsDiv;
}

// Helper function to generate a consistent hue from a string
function stringToHue(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash % 360;
}

// Render messages to the UI
function renderMessages(messages, chatName) {
    currentMessages = messages;
    currentChatName = chatName;
    
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    // Clear existing messages
    messagesContainer.innerHTML = '';
    
    // Show loading placeholder if we're actively loading
    if (isLoadingMessages) {
        showMessageLoadingIndicator();
        return;
    }
    
    // If no messages, show placeholder
    if (!messages || messages.length === 0) {
        showNoMessagesPlaceholder();
        return;
    }
    
    // Sort messages by timestamp if available (oldest to newest)
    const sortedMessages = [...messages].sort((a, b) => {
        const timeA = a.time_of_sending || 0;
        const timeB = b.time_of_sending || 0;
        return timeA - timeB;
    });
    
    // Create and append message elements
    sortedMessages.forEach(message => {
        const messageElement = createMessageFromAPIData(message);
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to the bottom of the messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Update window title with chat name
    document.title = `${chatName} - Better Pronto`;
}

// Show loading indicator in messages container
function showMessageLoadingIndicator() {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    isLoadingMessages = true;
    
    // Create loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'messages-loading';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading messages...</div>
    `;
    
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(loadingIndicator);
}

// Hide message loading indicator
function hideMessageLoadingIndicator() {
    isLoadingMessages = false;
    
    // Rerender messages if we have them
    if (currentMessages.length > 0) {
        renderMessages(currentMessages, currentChatName);
    } else {
        showNoMessagesPlaceholder();
    }
}

// Show placeholder when no messages are available
function showNoMessagesPlaceholder() {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) return;
    
    const placeholder = document.createElement('div');
    placeholder.className = 'no-messages-placeholder';
    placeholder.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments"></i>
            <p>No messages yet</p>
            <p class="hint">Start the conversation by typing a message below</p>
        </div>
    `;
    
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(placeholder);
}

// Clear the messages container
function clearMessages() {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    currentMessages = [];
}

// Function to delete a message via API
async function deleteMessage(messageId) {
    if (!window.pywebview || !window.pywebview.api || !messageId) return false;
    
    try {
        const response = await window.pywebview.api.delete_message(messageId);
        if (response && response.ok) {
            // Find and remove the message from the DOM
            const messageElement = document.querySelector(`.message-container[data-message-id="${messageId}"]`);
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
            
            // Remove from current messages array
            const index = currentMessages.findIndex(msg => msg.message_id === messageId);
            if (index !== -1) {
                currentMessages.splice(index, 1);
            }
            
            return true;
        } else {
            console.error('Error deleting message:', response?.error || 'Unknown error');
            return false;
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        return false;
    }
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

// Initialize the messages component
document.addEventListener('DOMContentLoaded', function() {
    // Show empty state initially
    showNoMessagesPlaceholder();
    
    // Listen for chat selection changes from sidebar
    document.addEventListener('chatSelected', function(e) {
        if (e.detail && e.detail.chatId) {
            currentChatId = e.detail.chatId;
        }
    });
    
    // Set up global shift key tracking for delete functionality
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
    document.addEventListener('click', async function(e) {
        if (e.target.closest('.message-delete-btn')) {
            const messageContainer = e.target.closest('.message-container');
            if (messageContainer) {
                const messageId = messageContainer.dataset.messageId;
                if (messageId && window.pywebview && window.pywebview.api) {
                    const confirmed = confirm('Are you sure you want to delete this message?');
                    if (confirmed) {
                        const success = await deleteMessage(messageId);
                        if (success) {
                            console.log('Message deleted successfully');
                        } else {
                            console.error('Failed to delete message');
                        }
                    }
                }
            }
        }
    });
    
    // Expose functions for use by other components
    window.renderMessages = renderMessages;
    window.clearMessages = clearMessages;
    window.showMessageLoadingIndicator = showMessageLoadingIndicator;
    window.hideMessageLoadingIndicator = hideMessageLoadingIndicator;
    window.showNoMessagesPlaceholder = showNoMessagesPlaceholder;
    
    // Function to add a new message to the chat (used by message input component)
    window.addMessageToChat = function(sender, text, isSent) {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer || !currentChatId) return;
        
        // Create message object in our API format
        const messageObj = {
            time_of_sending: Math.floor(Date.now() / 1000),
            author: sender,
            profilepicurl: null,
            message_id: `temp-${Date.now()}`, // Temporary ID until we get real one from API
            content: text,
            is_sent_by_me: isSent
        };
        
        // Add to current messages
        currentMessages.push(messageObj);
        
        // Create and append message element
        const messageElement = createMessageFromAPIData(messageObj);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to the bottom of messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Send message via API if available
        if (window.pywebview && window.pywebview.api && window.pywebview.api.send_message) {
            // Get current user ID (you would need to implement proper user identification)
            const userID = null; // This would need to be obtained from your auth system
            
            window.pywebview.api.send_message(currentChatId, text, userID)
                .then(response => {
                    console.log('Message sent via API:', response);
                    
                    // After successful send, refresh messages to get the proper message ID
                    if (window.triggerMessagesRefresh) {
                        window.triggerMessagesRefresh(currentChatId);
                    }
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                });
        }
        
        return messageObj;
    };
});

// Make triggerMessagesRefresh available to the sidebar
window.triggerMessagesRefresh = function(bubbleId) {
    if (window.pywebview && window.pywebview.api && bubbleId) {
        const selectedChat = document.querySelector(`.chat-item[data-id="${bubbleId}"]`);
        const chatName = selectedChat ? selectedChat.querySelector('.chat-name').textContent : 'Chat';
        
        // Use the sidebar's function if available
        if (typeof triggerMessagesRefresh === 'function') {
            triggerMessagesRefresh(bubbleId);
        }
    }
};

// Initialize immediately if DOM is already loaded
if (document.readyState === "complete" || 
    document.readyState === "loaded" || 
    document.readyState === "interactive") {
    showNoMessagesPlaceholder();
}