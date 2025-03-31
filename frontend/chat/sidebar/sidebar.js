// Sample chat data - in a real application, this would come from an API
const chatData = [
    {
        id: 1,
        name: "John Doe",
        profilePicture: null, // Will use default
        isPinned: false,
        isMuted: false
    },
    {
        id: 2,
        name: "Jane Smith",
        profilePicture: null, // Will use default
        isPinned: true,
        isMuted: false
    }
];

// Function to render chat items
function renderChatList() {
    const chatList = document.getElementById('chat-list');
    if (!chatList) {
        console.error('Chat list element not found');
        return;
    }
    
    // Clear existing items
    chatList.innerHTML = '';
    
    // Create chat items
    chatData.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.id = chat.id;
        
        // Create profile picture
        const profilePic = document.createElement('div');
        profilePic.className = 'profile-picture';
        // If we had a profile picture URL, we could set it as background image here
        
        // Create chat content
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        
        const chatName = document.createElement('div');
        chatName.className = 'chat-name';
        chatName.textContent = chat.name;
        
        chatContent.appendChild(chatName);
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        
        const dropdownTrigger = document.createElement('button');
        dropdownTrigger.className = 'dropdown-trigger';
        dropdownTrigger.title = 'More options';
        dropdownTrigger.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
        
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        
        // Dropdown options
        const dropdownOptions = [
            { text: 'Mark as Read', action: 'markAsRead' },
            { text: chat.isPinned ? 'Unpin' : 'Pin', action: 'togglePin' },
            { text: chat.isMuted ? 'Unmute' : 'Mute', action: 'toggleMute' },
            { text: 'Hide', action: 'hide' },
            { text: 'Nickname', action: 'setNickname' },
            { text: 'Leave', action: 'leave' }
        ];
        
        dropdownOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'dropdown-item';
            button.textContent = option.text;
            button.dataset.action = option.action;
            button.dataset.chatId = chat.id;
            dropdownMenu.appendChild(button);
        });
        
        dropdown.appendChild(dropdownTrigger);
        dropdown.appendChild(dropdownMenu);
        
        // Append all elements to chat item
        chatItem.appendChild(profilePic);
        chatItem.appendChild(chatContent);
        chatItem.appendChild(dropdown);
        
        // Add chat item to list
        chatList.appendChild(chatItem);
    });
    
    // Set up event listeners after rendering
    setupEventListeners();
}

// Set up event listeners for dropdown menus
function setupEventListeners() {
    // Toggle dropdown menu visibility
    document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const menu = this.nextElementSibling;
            // Close all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(item => {
                if (item !== menu) {
                    item.classList.remove('active');
                }
            });
            // Toggle current dropdown
            menu.classList.toggle('active');
        });
    });
    
    // Handle dropdown item clicks
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            const action = this.dataset.action;
            const chatId = parseInt(this.dataset.chatId);
            
            handleDropdownAction(action, chatId);
            
            // Close dropdown
            const menu = this.closest('.dropdown-menu');
            if (menu) menu.classList.remove('active');
        });
    });
    
    // Chat item click to select chat
    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                // Only trigger if not clicking on dropdown
                const chatId = parseInt(this.dataset.id);
                selectChat(chatId);
            }
        });
    });
}

// Handle dropdown item actions
function handleDropdownAction(action, chatId) {
    const chatIndex = chatData.findIndex(chat => chat.id === chatId);
    if (chatIndex === -1) return;
    
    switch (action) {
        case 'togglePin':
            chatData[chatIndex].isPinned = !chatData[chatIndex].isPinned;
            break;
        case 'toggleMute':
            chatData[chatIndex].isMuted = !chatData[chatIndex].isMuted;
            break;
        case 'setNickname':
            const newName = prompt('Enter new nickname:', chatData[chatIndex].name);
            if (newName && newName.trim()) {
                chatData[chatIndex].name = newName.trim();
            }
            break;
        case 'leave':
            if (confirm(`Are you sure you want to leave the chat with ${chatData[chatIndex].name}?`)) {
                chatData.splice(chatIndex, 1);
            }
            break;
        // Additional actions can be implemented here
    }
    
    // Re-render the chat list after any action
    renderChatList();
}

// Function to select a chat
function selectChat(chatId) {
    const selectedChat = chatData.find(chat => chat.id === chatId);
    if (!selectedChat) return;
    
    // Mark the selected chat item
    document.querySelectorAll('.chat-item').forEach(item => {
        if (parseInt(item.dataset.id) === chatId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Dispatch custom event for chat selection
    const chatSelectedEvent = new CustomEvent('chatSelected', { 
        detail: { 
            chatId: chatId,
            chatName: selectedChat.name
        },
        bubbles: true 
    });
    document.dispatchEvent(chatSelectedEvent);
}

// Close dropdown when clicking outside
document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
    });
});

// Initialize the sidebar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing sidebar');
    renderChatList();
    
    // Select the first chat by default if available
    if (chatData.length > 0) {
        selectChat(chatData[0].id);
    }
});

// Initialize immediately if DOM is already loaded
if (document.readyState === "complete" || 
    document.readyState === "loaded" || 
    document.readyState === "interactive") {
    console.log('DOM already ready - initializing sidebar immediately');
    renderChatList();
    
    // Select the first chat by default if available
    if (chatData.length > 0) {
        selectChat(chatData[0].id);
    }
}