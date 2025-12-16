// Chat widget logic
const launcher = document.getElementById('chat-launcher');
const widget = document.getElementById('chat-widget');
const closeBtn = document.getElementById('chat-close-btn');
const messagesDiv = document.getElementById('chat-messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');

// Keep the full conversation so the backend has context
let messages = [];

// Change this once your subdomain is working.
// For testing, you can use your Railway URL instead.
const API_URL = 'https://tylerdonohue-backend-production.up.railway.app/chat';

// Update this to your actual backend URL
const BACKEND_BASE = 'https://tylerdonohue-backend-production.up.railway.app';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('contact-submit');
    const spinnerEl = document.getElementById('contact-spinner');
    const statusTextEl = document.getElementById('contact-status-text');

    const setStatus = (text, { loading = false } = {}) => {
        if (spinnerEl) spinnerEl.classList.toggle('is-on', loading);
        if (statusTextEl) statusTextEl.textContent = text || '';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name')?.value?.trim() || '';
        const email = document.getElementById('contact-email')?.value?.trim() || '';
        const message = document.getElementById('contact-message')?.value?.trim() || '';

        if (!email || !message) {
            setStatus('Please include an email and a message.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }
        setStatus('Sending…', { loading: true });

        try {
            // Make sure BACKEND_BASE is defined in your script.js
            // e.g. const BACKEND_BASE = 'https://tylerdonohue-backend-production.up.railway.app';
            const resp = await fetch(`${BACKEND_BASE}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await resp.json().catch(() => ({}));

            if (resp.ok && data.ok) {
                form.reset();
                setStatus('Sent. Thanks — I’ll get back to you soon.');
            } else {
                console.error('Contact failed:', resp.status, data);
                setStatus('Could not send right now. Please email me directly.');
            }
        } catch (err) {
            console.error('Contact network error:', err);
            setStatus('Network error. Please try again or email me directly.');
        } finally {
            setStatus(statusTextEl?.textContent || '', { loading: false });

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        }
    });
});

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

// Auto-open after a few seconds on load with a greeting from AI Tyler
window.addEventListener('load', () => {
    setTimeout(() => {
        openChat();
        const greeting =
            "Hi, I’m AI Tyler. Ask me about my skills, experience, and work history";
        appendMessage('ai', greeting);
        // Seed the conversation so the backend sees the greeting as the first assistant message
        messages.push({ role: 'assistant', content: greeting });
    }, 3200);
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    // Show user message in UI
    appendMessage('user', text);
    input.value = '';

    // Add to conversation
    messages.push({ role: 'user', content: text });

    // Show "Thinking..." bubble
    appendMessage('ai', 'Thinking...');
    const thinkingBubble = messagesDiv.lastChild;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages }),
        });

        if (!res.ok) {
            console.error('Backend error status:', res.status);
            thinkingBubble.textContent = 'Hmm, something went wrong talking to the backend.';
            return;
        }

        const data = await res.json();

        // Remove "Thinking..." bubble
        thinkingBubble.remove();

        if (data.reply && data.reply.content) {
            // Add assistant reply to convo + UI
            messages.push(data.reply);
            appendMessage('ai', data.reply.content);
        } else {
            appendMessage('ai', 'I got an empty response from the AI backend.');
        }
    } catch (err) {
        console.error('Fetch error:', err);
        thinkingBubble.textContent = 'Network error talking to AI backend.';
    }
});
