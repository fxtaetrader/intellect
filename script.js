// ==================== STATE MANAGEMENT ====================
let currentUser = null;
let activeChat = null;
let chats = [];
let messages = {};
let typingTimeout = null;
let isPremium = false;
let pinnedMessages = {};
let scheduledMessages = {};

// Load data from localStorage
function loadData() {
    const savedUser = localStorage.getItem('intellect_user');
    const savedChats = localStorage.getItem('intellect_chats');
    const savedMessages = localStorage.getItem('intellect_messages');
    const savedPremium = localStorage.getItem('intellect_premium');
    
    if (savedUser) currentUser = JSON.parse(savedUser);
    if (savedChats) chats = JSON.parse(savedChats);
    if (savedMessages) messages = JSON.parse(savedMessages);
    if (savedPremium) isPremium = JSON.parse(savedPremium);
    
    if (currentUser) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        document.getElementById('currentUsername').textContent = currentUser.username;
        renderChats();
    }
}

// Save data to localStorage
function saveData() {
    if (currentUser) localStorage.setItem('intellect_user', JSON.stringify(currentUser));
    localStorage.setItem('intellect_chats', JSON.stringify(chats));
    localStorage.setItem('intellect_messages', JSON.stringify(messages));
    localStorage.setItem('intellect_premium', JSON.stringify(isPremium));
}

// ==================== AUTHENTICATION ====================
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    const users = JSON.parse(localStorage.getItem('intellect_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        saveData();
        
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        document.getElementById('currentUsername').textContent = user.username;
        
        // Initialize demo chats
        initializeDemoChats();
        renderChats();
        
        showNotification('Welcome back, ' + user.username + '!', 'success');
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('intellect_users') || '[]');
    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        username,
        email,
        password,
        phone,
        avatar: null,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('intellect_users', JSON.stringify(users));
    
    currentUser = newUser;
    saveData();
    
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
    document.getElementById('currentUsername').textContent = username;
    
    initializeDemoChats();
    renderChats();
    
    showNotification('Account created successfully!', 'success');
}

// ==================== CHAT FUNCTIONALITY ====================
function initializeDemoChats() {
    if (chats.length === 0) {
        // Create demo chats
        chats = [
            {
                id: 'chat_1',
                name: 'John Doe',
                lastMessage: 'Hey, how are you?',
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                unread: 2,
                avatar: null,
                online: true
            },
            {
                id: 'chat_2',
                name: 'Alice Smith',
                lastMessage: 'See you tomorrow!',
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                unread: 0,
                avatar: null,
                online: false
            },
            {
                id: 'chat_3',
                name: 'Tech Group',
                lastMessage: 'Bob: Check this out!',
                lastMessageTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                unread: 5,
                avatar: null,
                online: true,
                isGroup: true
            }
        ];
        
        // Create demo messages
        messages = {
            'chat_1': [
                {
                    id: 'msg_1',
                    sender: 'other',
                    content: 'Hey, how are you?',
                    time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
                    status: 'read'
                },
                {
                    id: 'msg_2',
                    sender: 'me',
                    content: 'I\'m good, thanks! How about you?',
                    time: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
                    status: 'read'
                },
                {
                    id: 'msg_3',
                    sender: 'other',
                    content: 'Pretty good! Working on a new project.',
                    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
                    status: 'delivered'
                }
            ],
            'chat_2': [
                {
                    id: 'msg_4',
                    sender: 'me',
                    content: 'Are we still meeting tomorrow?',
                    time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                    status: 'read'
                },
                {
                    id: 'msg_5',
                    sender: 'other',
                    content: 'Yes, see you at 2pm!',
                    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                    status: 'read'
                },
                {
                    id: 'msg_6',
                    sender: 'other',
                    content: 'See you tomorrow!',
                    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    status: 'read'
                }
            ],
            'chat_3': [
                {
                    id: 'msg_7',
                    sender: 'John',
                    content: 'Has anyone tried the new update?',
                    time: new Date(Date.now() - 1000 * 60 * 180).toISOString()
                },
                {
                    id: 'msg_8',
                    sender: 'Alice',
                    content: 'Yes, it\'s great!',
                    time: new Date(Date.now() - 1000 * 60 * 150).toISOString()
                },
                {
                    id: 'msg_9',
                    sender: 'Bob',
                    content: 'Check this out! https://example.com',
                    time: new Date(Date.now() - 1000 * 60 * 120).toISOString()
                }
            ]
        };
        
        saveData();
    }
}

function renderChats() {
    const chatsList = document.getElementById('chatsList');
    chatsList.innerHTML = '';
    
    chats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${activeChat === chat.id ? 'active' : ''}`;
        chatItem.onclick = () => openChat(chat.id);
        
        const time = new Date(chat.lastMessageTime);
        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        chatItem.innerHTML = `
            <div class="avatar">
                <i class="fas ${chat.isGroup ? 'fa-users' : 'fa-user'}"></i>
            </div>
            <div class="chat-info">
                <div class="chat-name">${chat.name}</div>
                <div class="last-message">
                    ${chat.lastMessage || 'No messages yet'}
                    <span class="message-time">${timeStr}</span>
                </div>
            </div>
            ${chat.unread ? `<div class="unread-badge">${chat.unread}</div>` : ''}
        `;
        
        chatsList.appendChild(chatItem);
    });
}

function openChat(chatId) {
    activeChat = chatId;
    document.getElementById('currentChatName').textContent = 
        chats.find(c => c.id === chatId).name;
    renderMessages();
    renderChats();
    
    // Mark messages as read
    const chat = chats.find(c => c.id === chatId);
    if (chat) chat.unread = 0;
    saveData();
    
    // On mobile, hide sidebar after selecting chat
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    if (!activeChat || !messages[activeChat]) {
        container.innerHTML = '<div class="no-messages">Select a chat to start messaging</div>';
        return;
    }
    
    container.innerHTML = '';
    
    messages[activeChat].forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender === 'me' ? 'sent' : 'received'}`;
        
        const time = new Date(msg.time);
        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let statusHtml = '';
        if (msg.sender === 'me') {
            if (msg.status === 'read') {
                statusHtml = '<i class="fas fa-check-double" style="color: #667eea;"></i>';
            } else if (msg.status === 'delivered') {
                statusHtml = '<i class="fas fa-check-double"></i>';
            } else {
                statusHtml = '<i class="fas fa-check"></i>';
            }
        }
        
        // Check if message is pinned
        const isPinned = pinnedMessages[activeChat]?.includes(msg.id);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${msg.sender !== 'me' ? `<strong>${msg.sender}:</strong> ` : ''}
                ${msg.content}
                ${isPinned ? '<i class="fas fa-thumbtack" style="margin-left: 5px; font-size: 10px;"></i>' : ''}
            </div>
            <div class="message-time">
                ${timeStr}
                ${statusHtml ? `<span class="message-status">${statusHtml}</span>` : ''}
            </div>
        `;
        
        container.appendChild(messageDiv);
    });
    
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();
    
    if (!content || !activeChat) return;
    
    // Create new message
    const newMessage = {
        id: 'msg_' + Date.now(),
        sender: 'me',
        content: content,
        time: new Date().toISOString(),
        status: 'sent'
    };
    
    // Add to messages
    if (!messages[activeChat]) messages[activeChat] = [];
    messages[activeChat].push(newMessage);
    
    // Update chat last message
    const chat = chats.find(c => c.id === activeChat);
    if (chat) {
        chat.lastMessage = content;
        chat.lastMessageTime = new Date().toISOString();
    }
    
    // Clear input
    input.value = '';
    
    // Simulate reply after 2 seconds (demo only)
    setTimeout(simulateReply, 2000);
    
    renderMessages();
    renderChats();
    saveData();
}

function simulateReply() {
    if (!activeChat) return;
    
    const replies = [
        "That's interesting!",
        "Tell me more about it",
        "I see, cool!",
        "Thanks for sharing",
        "Let me think about that"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    const replyMessage = {
        id: 'msg_' + Date.now(),
        sender: chats.find(c => c.id === activeChat)?.name || 'Other',
        content: randomReply,
        time: new Date().toISOString()
    };
    
    messages[activeChat].push(replyMessage);
    
    // Update chat last message
    const chat = chats.find(c => c.id === activeChat);
    if (chat) {
        chat.lastMessage = randomReply;
        chat.lastMessageTime = new Date().toISOString();
        chat.unread = (chat.unread || 0) + 1;
    }
    
    renderMessages();
    renderChats();
    saveData();
    
    // Show notification
    showNotification(`New message from ${chat.name}`, 'info');
}

function handleMessageKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function checkTyping() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendButton');
    const micBtn = document.getElementById('micButton');
    
    if (input.value.trim()) {
        sendBtn.classList.remove('hidden');
        micBtn.classList.add('hidden');
        
        // Show typing indicator (demo)
        document.getElementById('typingStatus').textContent = 'typing...';
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            document.getElementById('typingStatus').textContent = '';
        }, 1000);
    } else {
        sendBtn.classList.add('hidden');
        micBtn.classList.remove('hidden');
    }
}

// ==================== UI FUNCTIONS ====================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function togglePremiumModal() {
    document.getElementById('premiumModal').classList.toggle('active');
}

function togglePremiumFeatures() {
    if (!isPremium) {
        togglePremiumModal();
        return;
    }
    document.getElementById('premiumPanel').classList.toggle('hidden');
}

function showAttachmentMenu() {
    document.getElementById('attachmentMenu').classList.toggle('hidden');
}

function showEmojiPicker() {
    // Simple emoji picker simulation
    const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '⭐'];
    const input = document.getElementById('messageInput');
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    input.value += randomEmoji;
    checkTyping();
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== PREMIUM FEATURES ====================
function showPinnedMessages() {
    if (!isPremium) {
        togglePremiumModal();
        return;
    }
    
    if (!activeChat || !pinnedMessages[activeChat]) {
        showNotification('No pinned messages in this chat', 'info');
        return;
    }
    
    // Show pinned messages
    const pinnedMsgList = pinnedMessages[activeChat]
        .map(msgId => {
            const msg = messages[activeChat]?.find(m => m.id === msgId);
            return msg ? msg.content : null;
        })
        .filter(m => m);
    
    alert('Pinned Messages:\n' + pinnedMsgList.join('\n'));
}

function showScheduledMessages() {
    if (!isPremium) {
        togglePremiumModal();
        return;
    }
    
    // Show scheduled messages modal
    showNotification('Schedule message feature coming soon!', 'info');
}

function startVoiceRecording() {
    if (!isPremium) {
        togglePremiumModal();
        return;
    }
    
    showNotification('Voice recording coming soon!', 'info');
}

function attachImage() {
    showNotification('Image attachment coming soon!', 'info');
    document.getElementById('attachmentMenu').classList.add('hidden');
}

function attachFile() {
    showNotification('File attachment coming soon!', 'info');
    document.getElementById('attachmentMenu').classList.add('hidden');
}

function attachLocation() {
    showNotification('Location sharing coming soon!', 'info');
    document.getElementById('attachmentMenu').classList.add('hidden');
}

function attachContact() {
    showNotification('Contact sharing coming soon!', 'info');
    document.getElementById('attachmentMenu').classList.add('hidden');
}

function showChatInfo() {
    if (!activeChat) return;
    
    const chat = chats.find(c => c.id === activeChat);
    alert(`Chat Info:\nName: ${chat.name}\nType: ${chat.isGroup ? 'Group' : 'Direct'}\nMembers: ${chat.isGroup ? '3' : '2'}`);
}

function searchChats(query) {
    // Simple search implementation
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        const name = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
        item.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

function subscribe(plan) {
    // Simulate subscription
    isPremium = true;
    saveData();
    togglePremiumModal();
    showNotification(`Subscribed to ${plan} plan! Thank you for going premium! 🎉`, 'success');
}

function upgradeToPremium() {
    togglePremiumModal();
}

// ==================== INITIALIZATION ====================
// Add notification styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .no-messages {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-style: italic;
    }
`;
document.head.appendChild(style);

// Load data on startup
loadData();

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
});

// Click outside to close menus
document.addEventListener('click', (e) => {
    const premiumPanel = document.getElementById('premiumPanel');
    const premiumBtn = document.querySelector('.premium-features-btn');
    const attachmentMenu = document.getElementById('attachmentMenu');
    const attachBtn = document.querySelector('.attach-btn');
    
    if (premiumPanel && !premiumPanel.contains(e.target) && !premiumBtn?.contains(e.target)) {
        premiumPanel.classList.add('hidden');
    }
    
    if (attachmentMenu && !attachmentMenu.contains(e.target) && !attachBtn?.contains(e.target)) {
        attachmentMenu.classList.add('hidden');
    }
});

console.log('Intellect Messenger is ready! 🚀');
