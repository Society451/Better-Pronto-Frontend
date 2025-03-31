// Function to update the chat header with current chat information
function updateChatHeader(chatName, isOnline = true) {
    const chatHeaderContainer = document.getElementById('chat-header-container');
    if (!chatHeaderContainer) return;

    // Create the chat header structure
    const headerContent = `
        <div class="chat-header">
            <div class="contact-info">
                <div class="profile-picture">
                    <div class="status-indicator ${isOnline ? 'status-online' : 'status-offline'}"></div>
                </div>
                <h3 id="chat-heading">Chat with ${chatName || 'Select a chat'}</h3>
            </div>
            <div class="dropdown">
                <button class="dropdown-trigger" title="More options">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu">
                    <button class="dropdown-item" data-action="markAsRead">Mark as Read</button>
                    <button class="dropdown-item" data-action="togglePin">Pin</button>
                    <button class="dropdown-item" data-action="toggleMute">Mute</button>
                    <button class="dropdown-item" data-action="hide">Hide</button>
                    <button class="dropdown-item" data-action="setNickname">Nickname</button>
                    <button class="dropdown-item" data-action="leave">Leave</button>
                </div>
            </div>
        </div>
    `;
    
    chatHeaderContainer.innerHTML = headerContent;
    
    // Set up dropdown event listeners
    setupHeaderDropdown();
}

// Set up event listeners for the header dropdown
function setupHeaderDropdown() {
    const trigger = document.querySelector('.chat-header .dropdown-trigger');
    if (!trigger) return;
    
    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        const menu = this.nextElementSibling;
        menu.classList.toggle('active');
    });
    
    // Handle dropdown item clicks
    const dropdownItems = document.querySelectorAll('.chat-header .dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.dataset.action;
            
            // Handle header dropdown actions
            handleHeaderAction(action);
            
            // Close dropdown
            const menu = this.closest('.dropdown-menu');
            if (menu) menu.classList.remove('active');
        });
    });
}

// Handle header dropdown actions
function handleHeaderAction(action) {
    const chatName = document.getElementById('chat-heading').textContent.replace('Chat with ', '');
    
    switch(action) {
        case 'togglePin':
            alert(`${chatName} has been pinned`);
            break;
        case 'toggleMute':
            alert(`${chatName} has been muted`);
            break;
        case 'setNickname':
            const newName = prompt('Enter new nickname:', chatName);
            if (newName && newName.trim()) {
                document.getElementById('chat-heading').textContent = `Chat with ${newName.trim()}`;
                
                // Dispatch custom event so other components can update
                const nicknameEvent = new CustomEvent('chatNickname', { 
                    detail: { 
                        chatName: chatName,
                        newName: newName.trim() 
                    },
                    bubbles: true 
                });
                document.dispatchEvent(nicknameEvent);
            }
            break;
        case 'leave':
            if (confirm(`Are you sure you want to leave the chat with ${chatName}?`)) {
                alert(`You have left the chat with ${chatName}`);
                // In a real app, we would redirect or clear the chat
            }
            break;
        default:
            alert(`Action ${action} for ${chatName}`);
    }
}

// Initialize the header
document.addEventListener('DOMContentLoaded', function() {
    // Default header with empty chat name (will be updated when chat is selected)
    updateChatHeader('John Doe', true); // Default to first chat, online by default
    
    // Listen for chat selection events
    document.addEventListener('chatSelected', function(e) {
        if (e.detail) {
            updateChatHeader(e.detail.chatName, e.detail.isOnline);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.chat-header .dropdown')) {
            document.querySelectorAll('.chat-header .dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
});

// Initialize immediately if DOM is already loaded
if (document.readyState === "complete" || 
    document.readyState === "loaded" || 
    document.readyState === "interactive") {
    updateChatHeader('John Doe', true);
}