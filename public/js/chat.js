
// chat.js - Enhanced UI logic

// Elements
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const chatArea = document.getElementById('chat-area');
const themeToggle = document.getElementById('theme-toggle');
const newChatBtn = document.getElementById('new-chat-btn');
const conversationList = document.getElementById('conversation-list');
const welcomeScreen = document.getElementById('welcome-screen');
// Load or create a persistent conversation ID
let conversationId = localStorage.getItem('conversationId') || crypto.randomUUID();
localStorage.setItem('conversationId', conversationId);
let usageCount = 0; // will be updated from server

// Initialize theme based on saved preference or system preference
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved ? saved : (prefersDark ? 'dark' : 'light');
    document.body.dataset.theme = theme;
    themeToggle.textContent = theme === 'dark' ? '🌞' : '🌙';
}
function toggleTheme() {
    const isDark = document.body.dataset.theme === 'dark';
    document.body.dataset.theme = isDark ? 'light' : 'dark';
    themeToggle.textContent = isDark ? '🌙' : '🌞';
}

// Load usage counter from server
async function loadUsage() {
    try {
        const res = await fetch('/usage');
        const data = await res.json();
        usageCount = data.count || 0;
        updateHeaderUsage();
    } catch (e) { console.error('Failed to load usage', e); }
}

function updateHeaderUsage() {
    const header = document.querySelector('.header');
    let usageSpan = header.querySelector('.usage-count');
    if (!usageSpan) {
        usageSpan = document.createElement('span');
        usageSpan.className = 'usage-count';
        usageSpan.style.marginLeft = 'auto';
        usageSpan.style.fontSize = '0.9rem';
        header.appendChild(usageSpan);
    }
    usageSpan.textContent = `API calls: ${usageCount}`;
}

// Render a message (user or assistant) using markdown
function renderMessage(content, isUser) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${isUser ? 'user' : 'assistant'}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    // Use marked + DOMPurify for safe HTML
    const rawHtml = marked.parse(content);
    bubble.innerHTML = DOMPurify.sanitize(rawHtml);
    // Add copy button to code blocks
    bubble.querySelectorAll('pre > code').forEach(codeEl => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeEl.textContent).catch(() => { });
        });
        codeEl.parentNode.appendChild(btn);
        // Highlight.js
        hljs.highlightElement(codeEl);
    });
    wrapper.appendChild(bubble);
    chatArea.appendChild(wrapper);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Show loading spinner
function showSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = 'loading-spinner';
    chatArea.appendChild(spinner);
}
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
}

// Send message to backend
async function sendMessage() {
    const msg = messageInput.value.trim();
    if (!msg) return;
    // Hide welcome on first message
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    renderMessage(msg, true);
    messageInput.value = '';
    showSpinner();
    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, conversationId })
        });
        const data = await res.json();
        hideSpinner();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        renderMessage(data.reply, false);
        // Increment usage counter locally and refresh display
        usageCount++;
        updateHeaderUsage();
    } catch (e) {
        hideSpinner();
        renderMessage(`Error: ${e.message}`, false);
    }
}

// Load conversation history (if any)
async function loadHistory() {
    try {
        const res = await fetch(`/chat/history?cid=${conversationId}`);
        const data = await res.json();
        const history = data.history || [];
        if (history.length) {
            welcomeScreen.style.display = 'none';
            history.forEach(step => {
                if (step.type === 'assistant') {
                    renderMessage(step.content[0].text, false);
                } else if (step.type === 'user_input') {
                    renderMessage(step.content[0].text, true);
                }
            });
        }
    } catch (e) { console.error('Failed to load history', e); }
}

// New chat handler
function startNewChat() {
    // Clear stored conversation ID for a fresh chat
    localStorage.removeItem('conversationId');
    conversationId = crypto.randomUUID();
    localStorage.setItem('conversationId', conversationId);
    chatArea.innerHTML = '';
    welcomeScreen.style.display = 'block';
    // Optionally clear conversation list selection
    const active = conversationList.querySelector('.active');
    if (active) active.classList.remove('active');
}

// Initialize prompt chips (replaces old suggestion cards)
// initPromptChips removed – prompts are now static text


// Event listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
themeToggle.addEventListener('click', toggleTheme);
newChatBtn.addEventListener('click', startNewChat);

// Init
initTheme();
loadUsage();
loadHistory();

