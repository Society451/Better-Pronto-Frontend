// Data structures for chats
let directMessages = [];
let categorizedBubbles = {};
let uncategorizedBubbles = [];
let unreadBubbles = [];
let categories = [];

// Track API availability and chat data loading
let isApiAvailable = false;
let isDataLoaded = false;
let currentSearchTerm = '';
let isSearchVisible = false; // Track search visibility
let collapsedCategories = {}; // Keep track of collapsed state

// Check if pywebview API is available
function checkApiAvailability() {
    if (window.pywebview && window.pywebview.api) {
        console.log('PyWebView API is available');
        isApiAvailable = true;
        loadChatData();
    } else {
        console.log('PyWebView API not available yet, retrying in 500ms');
        setTimeout(checkApiAvailability, 500);
    }
}

// Load chat data from API
async function loadChatData() {
    try {
        console.log('Loading chat data from API...');
        
        // Fetch all data in parallel for better performance
        const [dms, categorizedChats, uncategorizedChats, unreadChats, categoryList] = await Promise.all([
            window.pywebview.api.get_Localdms(),
            window.pywebview.api.get_Localcategorized_bubbles(),
            window.pywebview.api.get_Localuncategorized_bubbles(),
            window.pywebview.api.get_Localunread_bubbles(),
            window.pywebview.api.get_Localcategories()
        ]);
        
        // Store the data
        directMessages = dms || [];
        categorizedBubbles = categorizedChats || {};
        uncategorizedBubbles = uncategorizedChats || [];
        unreadBubbles = unreadChats || [];
        categories = categoryList || [];
        
        console.log('Chat data loaded:', {
            dms: directMessages.length,
            categories: Object.keys(categorizedBubbles).length,
            uncategorized: uncategorizedBubbles.length,
            unread: unreadBubbles.length
        });
        
        isDataLoaded = true;
        renderSidebar();
    } catch (error) {
        console.error('Error loading chat data:', error);
        // Retry after a short delay
        setTimeout(loadChatData, 2000);
    }
}

// Render the entire sidebar with all chat categories
function renderSidebar(searchTerm = '') {
    const chatList = document.getElementById('chat-list');
    if (!chatList || !isDataLoaded) {
        console.error(isDataLoaded ? 'Chat list element not found' : 'Chat data not loaded yet');
        return;
    }
    
    // Store the current search term
    currentSearchTerm = searchTerm.toLowerCase().trim();
    
    // Clear existing items
    chatList.innerHTML = '';
    
    // Render unread messages section if there are any
    if (unreadBubbles.length > 0) {
        renderChatCategory('Unread', filterChatsBySearch(unreadBubbles, currentSearchTerm), 'unread', chatList);
    }
    
    // Render direct messages
    renderChatCategory('Direct Messages', filterChatsBySearch(directMessages, currentSearchTerm), 'dm', chatList);
    
    // Render categorized bubbles
    for (const category of categories) {
        if (categorizedBubbles[category]) {
            renderChatCategory(
                category, 
                filterChatsBySearch(categorizedBubbles[category], currentSearchTerm), 
                `category-${category.replace(/\s+/g, '-').toLowerCase()}`, 
                chatList
            );
        }
    }
    
    // Render uncategorized bubbles
    if (uncategorizedBubbles.length > 0) {
        renderChatCategory('Uncategorized', filterChatsBySearch(uncategorizedBubbles, currentSearchTerm), 'uncategorized', chatList);
    }
    
    // If no results found after filtering, show a message
    if (currentSearchTerm && chatList.childElementCount === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No chats found matching your search';
        chatList.appendChild(noResults);
    }
    
    // Set up event listeners
    setupEventListeners();
}

// Filter chats based on search term
function filterChatsBySearch(chats, searchTerm) {
    if (!searchTerm) return chats;
    return chats.filter(chat => chat.title.toLowerCase().includes(searchTerm));
}

// Render a category of chats with collapsible header
function renderChatCategory(categoryName, chats, categoryId, container) {
    if (!chats || chats.length === 0) return;
    
    // Create category container
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'chat-category';
    categoryContainer.dataset.categoryId = categoryId;
    
    // Create category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    
    // Create toggle icon
    const toggleIcon = document.createElement('i');
    toggleIcon.className = collapsedCategories[categoryId] 
        ? 'fas fa-chevron-right' 
        : 'fas fa-chevron-down';
    
    // Create category title
    const categoryTitle = document.createElement('span');
    categoryTitle.className = 'category-title';
    categoryTitle.textContent = `${categoryName} (${chats.length})`;
    
    // Assemble category header
    categoryHeader.appendChild(toggleIcon);
    categoryHeader.appendChild(categoryTitle);
    
    // Add click event to toggle collapse
    categoryHeader.addEventListener('click', () => {
        const chatItems = categoryContainer.querySelector('.category-items');
        const isCollapsed = chatItems.classList.toggle('collapsed');
        collapsedCategories[categoryId] = isCollapsed;
        toggleIcon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-down';
    });
    
    categoryContainer.appendChild(categoryHeader);
    
    // Create container for chat items
    const chatItemsContainer = document.createElement('div');
    chatItemsContainer.className = 'category-items';
    
    // Apply collapsed state if needed
    if (collapsedCategories[categoryId]) {
        chatItemsContainer.classList.add('collapsed');
    }
    
    // Create chat items
    chats.forEach(chat => {
        const chatItem = createChatItem(chat);
        chatItemsContainer.appendChild(chatItem);
    });
    
    categoryContainer.appendChild(chatItemsContainer);
    container.appendChild(categoryContainer);
}

// Create a chat item element
function createChatItem(chat) {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.dataset.id = chat.id;
    
    // Create profile picture with status indicator
    const profilePic = document.createElement('div');
    profilePic.className = 'profile-picture';
    
    // Create and add status indicator (default to offline since we don't have real status)
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator status-offline';
    profilePic.appendChild(statusIndicator);
    
    // Create chat content
    const chatContent = document.createElement('div');
    chatContent.className = 'chat-content';
    
    const chatName = document.createElement('div');
    chatName.className = 'chat-name';
    
    // If there's a search term, highlight the matching text
    if (currentSearchTerm) {
        chatName.innerHTML = highlightText(chat.title, currentSearchTerm);
    } else {
        chatName.textContent = chat.title;
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
        { text: 'Mute', action: 'toggleMute' },
        { text: 'Hide', action: 'hide' }
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
    
    return chatItem;
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

// Set up event listeners for dropdowns and chat items
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
            const chatId = this.dataset.chatId;
            
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
                const chatId = this.dataset.id;
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
        
        // If showing search, focus the input with a more reliable approach
        if (isSearchVisible) {
            setTimeout(() => {
                searchInput.focus();
                setTimeout(() => {
                    if (document.activeElement !== searchInput) {
                        searchInput.focus();
                    }
                }, 50);
            }, 50);
        } else {
            // If hiding search, clear it
            searchInput.value = '';
            document.getElementById('clear-search').style.display = 'none';
            renderSidebar(); // Reset to show all chats
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
    
    // Add event listener for escape key when the search input is focused
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSearchVisible) {
            isSearchVisible = false;
            searchContainer.classList.remove('active');
            toggleButton.classList.remove('active');
            
            // Clear search input
            searchInput.value = '';
            document.getElementById('clear-search').style.display = 'none';
            renderSidebar(); // Reset to show all chats
            
            // Update icon
            toggleButton.innerHTML = '<i class="fas fa-search"></i>';
            toggleButton.title = "Search Chats";
            
            searchInput.blur();
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
        renderSidebar(searchTerm);
    });
    
    // Clear button event listener
    clearButton.addEventListener('click', function() {
        searchInput.value = '';
        clearButton.style.display = 'none';
        renderSidebar(); // Reset to show all chats
        searchInput.focus(); // Focus back on the search input
    });
    
    // Handle keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
        // Escape key to clear search
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearButton.style.display = 'none';
            renderSidebar();
            searchInput.blur(); // Remove focus from search
        }
        
        // Enter key to select first chat if available
        if (e.key === 'Enter') {
            const firstChat = document.querySelector('.chat-item');
            if (firstChat) {
                const chatId = firstChat.dataset.id;
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
    if (!isApiAvailable) return;
    
    switch (action) {
        case 'markAsRead':
            console.log(`Marking chat ${chatId} as read`);
            if (window.pywebview.api.markBubbleAsRead) {
                window.pywebview.api.markBubbleAsRead(chatId)
                    .then(response => {
                        console.log('Mark as read response:', response);
                        // Refresh data after marking as read
                        loadChatData();
                    })
                    .catch(error => console.error('Error marking as read:', error));
            }
            break;
        case 'toggleMute':
            console.log(`Toggle mute for chat ${chatId}`);
            // Implement when API is available
            break;
        case 'hide':
            console.log(`Hide chat ${chatId}`);
            // Implement when API is available
            break;
    }
}

// Function to select a chat
function selectChat(chatId) {
    if (!isApiAvailable) return;
    
    // Find the chat in our data structures
    let selectedChat = null;
    
    // Check in direct messages
    selectedChat = directMessages.find(chat => chat.id == chatId);
    
    // If not found, check in categorized bubbles
    if (!selectedChat) {
        for (const category in categorizedBubbles) {
            selectedChat = categorizedBubbles[category].find(chat => chat.id == chatId);
            if (selectedChat) break;
        }
    }
    
    // If still not found, check in uncategorized bubbles
    if (!selectedChat) {
        selectedChat = uncategorizedBubbles.find(chat => chat.id == chatId);
    }
    
    if (!selectedChat) return;
    
    // Mark the selected chat item
    document.querySelectorAll('.chat-item').forEach(item => {
        if (item.dataset.id == chatId) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
    
    // Use the API's print_chat_info method for now (to be replaced with actual chat display)
    if (window.pywebview.api.print_chat_info) {
        window.pywebview.api.print_chat_info(selectedChat.title, chatId);
    }
    
    // Dispatch custom event for chat selection
    const chatSelectedEvent = new CustomEvent('chatSelected', { 
        detail: { 
            chatId: chatId,
            chatName: selectedChat.title
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
    setupSearchFunctionality();
    setupSearchToggle();
    
    // Check for API availability
    checkApiAvailability();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === "complete" || 
    document.readyState === "loaded" || 
    document.readyState === "interactive") {
    console.log('DOM already ready - initializing sidebar immediately');
    setupSearchFunctionality();
    setupSearchToggle();
    
    // Check for API availability
    checkApiAvailability();
}