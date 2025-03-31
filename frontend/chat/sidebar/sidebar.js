// Sample chat data - in a real application, this would come from an API
const chatData = [
    {
        id: 1,
        name: "John Doe",
        profilePicture: null, // Will use default
        isPinned: false,
        isMuted: false,
        isOnline: true // Online status
    },
    {
        id: 2,
        name: "Jane Smith",
        profilePicture: null, // Will use default
        isPinned: true,
        isMuted: false,
        isOnline: false // Offline status
    }
];

// Keep track of the current search term
let currentSearchTerm = '';
let isSearchVisible = false; // Track search visibility

// Function to render chat items
function renderChatList(searchTerm = '') {
    const chatList = document.getElementById('chat-list');
    if (!chatList) {
        console.error('Chat list element not found');
        return;
    }
    
    // Store the current search term
    currentSearchTerm = searchTerm.toLowerCase().trim();
    
    // Clear existing items
    chatList.innerHTML = '';
    
    // Filter chats based on search term if provided
    const filteredChats = currentSearchTerm 
        ? chatData.filter(chat => chat.name.toLowerCase().includes(currentSearchTerm))
        : chatData;
    
    // If no results found, show a message
    if (filteredChats.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No chats found';
        chatList.appendChild(noResults);
        return;
    }
    
    // Create chat items for filtered results
    filteredChats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.id = chat.id;
        
        // Create profile picture with status indicator
        const profilePic = document.createElement('div');
        profilePic.className = 'profile-picture';
        
        // Create and add status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = `status-indicator ${chat.isOnline ? 'status-online' : 'status-offline'}`;
        profilePic.appendChild(statusIndicator);
        
        // Create chat content
        const chatContent = document.createElement('div');
        chatContent.className = 'chat-content';
        
        const chatName = document.createElement('div');
        chatName.className = 'chat-name';
        
        // If there's a search term, highlight the matching text
        if (currentSearchTerm) {
            chatName.innerHTML = highlightText(chat.name, currentSearchTerm);
        } else {
            chatName.textContent = chat.name;
        }
        
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

// Function to highlight search terms in text
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Helper function to escape special characters in search term for regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

// Function to set up the search toggle functionality
function setupSearchToggle() {
    const toggleButton = document.querySelector('.toggle-search-button');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('chat-search');
    
    if (!toggleButton || !searchContainer || !searchInput) return;
    
    // Set initial state
    searchContainer.classList.toggle('active', isSearchVisible);
    
    // Toggle search visibility when the button is clicked
    toggleButton.addEventListener('click', function() {
        isSearchVisible = !isSearchVisible;
        searchContainer.classList.toggle('active', isSearchVisible);
        toggleButton.classList.toggle('active', isSearchVisible);
        
        // If showing search, focus the input
        if (isSearchVisible) {
            searchInput.focus();
        } else {
            // If hiding search, clear it
            searchInput.value = '';
            document.getElementById('clear-search').style.display = 'none';
            renderChatList(); // Reset to show all chats
        }
        
        // Update icon based on state
        if (isSearchVisible) {
            toggleButton.innerHTML = '<i class="fas fa-times"></i>';
            toggleButton.title = "Close Search";
        } else {
            toggleButton.innerHTML = '<i class="fas fa-search"></i>';
            toggleButton.title = "Search Chats";
        }
    });
}

// Set up search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('chat-search');
    const clearButton = document.getElementById('clear-search');
    
    if (!searchInput || !clearButton) return;
    
    // Search input event listener
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        
        // Show/hide clear button based on search input
        clearButton.style.display = searchTerm ? 'block' : 'none';
        
        // Render filtered chat list
        renderChatList(searchTerm);
    });
    
    // Clear button event listener
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        clearButton.style.display = 'none';
        renderChatList(); // Reset to show all chats
        searchInput.focus(); // Focus back on the search input
    });
    
    // Handle keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
        // Escape key to clear search
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearButton.style.display = 'none';
            renderChatList();
            searchInput.blur(); // Remove focus from search
        }
        
        // Enter key to select first chat if available
        if (e.key === 'Enter') {
            const firstChat = document.querySelector('.chat-item');
            if (firstChat) {
                const chatId = parseInt(firstChat.dataset.id);
                selectChat(chatId);
                searchInput.blur(); // Remove focus
            }
        }
    });
    
    // Shortcut for search focus: Ctrl+F or Command+F
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault(); // Prevent browser's default search
            searchInput.focus();
        }
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
    renderChatList(currentSearchTerm);
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
            chatName: selectedChat.name,
            isOnline: selectedChat.isOnline
        },
        bubbles: true 
    });
    document.dispatchEvent(chatSelectedEvent);
}

// Simulate status changes periodically (for demo purposes)
function simulateStatusChanges() {
    setInterval(() => {
        // Randomly toggle online status of one chat
        const randomIndex = Math.floor(Math.random() * chatData.length);
        chatData[randomIndex].isOnline = !chatData[randomIndex].isOnline;
        
        // Re-render the chat list
        renderChatList(currentSearchTerm);
        
        // Update header if the current selection matches the changed chat
        const currentChatId = document.querySelector('.chat-item.selected')?.dataset.id;
        if (currentChatId && parseInt(currentChatId) === chatData[randomIndex].id) {
            // Dispatch event to update header
            selectChat(parseInt(currentChatId));
        }
    }, 8000); // Every 8 seconds
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
    setupSearchFunctionality();
    setupSearchToggle(); // Add search toggle setup
    
    // Select the first chat by default if available
    if (chatData.length > 0) {
        selectChat(chatData[0].id);
    }
    
    // Start simulating status changes
    simulateStatusChanges();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === "complete" || 
    document.readyState === "loaded" || 
    document.readyState === "interactive") {
    console.log('DOM already ready - initializing sidebar immediately');
    renderChatList();
    setupSearchFunctionality();
    setupSearchToggle(); // Add search toggle setup
    
    // Select the first chat by default if available
    if (chatData.length > 0) {
        selectChat(chatData[0].id);
    }
    
    // Start simulating status changes
    simulateStatusChanges();
}