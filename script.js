// Chat widget logic (front-end only for now; backend comes later)
const launcher = document.getElementById('chat-launcher');
const widget = document.getElementById('chat-widget');
const closeBtn = document.getElementById('chat-close-btn');
const messagesDiv = document.getElementById('chat-messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');

function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = 'chat-bubble ' + (sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user');
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function openChat() {
    widget.classList.add('open');
}

function closeChat() {
    widget.classList.remove('open');
}

launcher.addEventListener('click', openChat);
closeBtn.addEventListener('click', closeChat);

// Auto-open after a few seconds on load
window.addEventListener('load', () => {
    setTimeout(() => {
        openChat();
        appendMessage(
            'ai',
            "Hey, I’m AI Tyler. Ask me about my experience, skills, or any gaps on my resume."
        );
    }, 3200);
});

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';

    // Placeholder until we wire up your backend
    setTimeout(() => {
        appendMessage(
            'ai',
            "Right now I'm just a front-end stub. Soon I'll be wired to an AI backend that knows my full resume."
        );
    }, 500);
});
