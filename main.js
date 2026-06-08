// Configuration
const CONFIG = {
    GEMINI_API_KEY: atob('QUl6YVN5Q3UyMFN3UHBfV0dvNVRaMDNKLUIxMWMzZE9saHFiczhN'),
    SLACK_WEBHOOK_URL: atob('aHR0cHM6Ly9ob29rcy5zbGFjay5jb20vc2VydmljZXMvVDA2NDBHMFNTR0svQjBCMFhCWVVGRUovVWJ1anBWUmJYY0xoNGZBZUFtQnpqM3VI'),
    SPEECH_ENABLED: true,
    IS_MUTED: false,
    VOICE_GENDER: 'female', 
    KNOWLEDGE_BASE_URL: 'knowledge_base.json'
};

// State Management
let chatOpen = false;
let knowledgeBase = null;
let synthesis = window.speechSynthesis;
let isSpeaking = false;
let onboardingStep = 'fullName'; // fullName, email, voice, ready
let userData = {
    fullName: '',
    email: ''
};
let messageHistory = [];
let utteranceVoice = null;

// DOM Elements
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const micToggle = document.getElementById('mic-toggle');
const micIcon = document.getElementById('mic-icon');
const voiceSettingsBtn = document.getElementById('voice-settings-btn');
const voiceSettingsModal = document.getElementById('voice-settings-modal');
const closeVoiceSettings = document.getElementById('close-voice-settings');
const voiceListContainer = document.getElementById('voice-list');
const muteToggle = document.getElementById('mute-toggle');
const muteIcon = document.getElementById('mute-icon');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatMessages = document.getElementById('chat-messages');
const windowAvatar = document.getElementById('window-avatar');
const formContainer = document.getElementById('form-container');
const closeFormBtn = document.getElementById('close-form');
const formEmbedArea = document.getElementById('zapier-form-embed');
const formTitleEl = document.getElementById('form-title');

// Speech Recognition
let recognition;
let isListening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        micToggle.classList.add('active');
        userInput.placeholder = "Listening...";
    };

    recognition.onend = () => {
        isListening = false;
        micToggle.classList.remove('active');
        userInput.placeholder = "Ask about insurance...";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        chatForm.dispatchEvent(new Event('submit'));
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        micToggle.classList.remove('active');
    };
}

// Initialize
async function init() {
    try {
        const kbUrl = window.INSURANCE_BOSS_BASE_URL 
            ? `${window.INSURANCE_BOSS_BASE_URL}/${CONFIG.KNOWLEDGE_BASE_URL}` 
            : CONFIG.KNOWLEDGE_BASE_URL;
        const response = await fetch(kbUrl);
        knowledgeBase = await response.json();
        console.log('Knowledge base loaded');
        
        // Start Onboarding
        startOnboarding();
        
        // Pre-load voices
        synthesis.getVoices();
    } catch (error) {
        console.error('Failed to load knowledge base:', error);
    }
}

function startOnboarding() {
    appendMessage('bot', "Welcome to The Insurance Boss! I'm here to help you get the best coverage. To get started, what is your <b>Full Name</b>?");
}

// UI Actions
chatToggle.addEventListener('click', () => {
    chatOpen = !chatOpen;
    chatWindow.classList.toggle('hidden');
    if (chatOpen) userInput.focus();
    
    if (chatOpen && onboardingStep === 'fullName') {
        notifySlack("Someone just opened the chatbot window!");
    }
});

closeChat.addEventListener('click', () => {
    chatOpen = false;
    chatWindow.classList.add('hidden');
    if (onboardingStep === 'ready') {
        sendConversationSummary();
    }
});

closeFormBtn.addEventListener('click', () => {
    formContainer.classList.add('hidden');
    formEmbedArea.innerHTML = '';
});

micToggle.addEventListener('click', () => {
    if (!recognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
});

voiceSettingsBtn.addEventListener('click', () => {
    loadVoiceList();
    voiceSettingsModal.classList.remove('hidden');
});

closeVoiceSettings.addEventListener('click', () => {
    voiceSettingsModal.classList.add('hidden');
});

function loadVoiceList() {
    const voices = synthesis.getVoices();
    voiceListContainer.innerHTML = '';
    
    // Filter strictly for US English voices
    const filteredVoices = voices.filter(v => v.lang.includes('en-US'));
    
    filteredVoices.forEach(voice => {
        const div = document.createElement('div');
        div.className = 'voice-item';
        if (utteranceVoice && utteranceVoice.name === voice.name) {
            div.classList.add('active');
        }
        
        div.innerHTML = `
            <div class="voice-info">
                <span class="voice-name">${voice.name}</span>
                <span class="voice-lang">${voice.lang}</span>
            </div>
            <div class="voice-actions">
                <button class="btn-preview">Preview</button>
                <button class="btn-select">Select</button>
            </div>
        `;
        
        div.querySelector('.btn-preview').onclick = (e) => {
            e.stopPropagation();
            previewVoice(voice);
        };
        
        div.querySelector('.btn-select').onclick = (e) => {
            e.stopPropagation();
            selectVoice(voice);
        };
        
        voiceListContainer.appendChild(div);
    });
}

function previewVoice(voice) {
    synthesis.cancel();
    const preview = new SpeechSynthesisUtterance("Hello, I am the Insurance Boss. This is a preview of my voice.");
    preview.voice = voice;
    synthesis.speak(preview);
}

function selectVoice(voice) {
    utteranceVoice = voice;
    voiceSettingsModal.classList.add('hidden');
    console.log(`Manually selected voice: ${voice.name}`);
}

muteToggle.addEventListener('click', () => {
    CONFIG.IS_MUTED = !CONFIG.IS_MUTED;
    if (CONFIG.IS_MUTED) {
        synthesis.cancel();
        muteIcon.setAttribute('d', 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z');
        muteToggle.style.color = '#ff4444';
    } else {
        muteIcon.setAttribute('d', 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z');
        muteToggle.style.color = 'white';
    }
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    userInput.value = '';
    
    if (onboardingStep !== 'ready') {
        handleOnboarding(text);
        return;
    }

    const typingId = appendTypingIndicator();
    const response = await getGeminiResponse(text);
    removeTypingIndicator(typingId);
    
    processBotResponse(response);
});

function handleOnboarding(text) {
    if (onboardingStep === 'fullName') {
        userData.fullName = text;
        onboardingStep = 'email';
        appendMessage('bot', `Great to meet you, ${userData.fullName}! And what is your <b>Email Address</b> so we can keep in touch?`);
    } else if (onboardingStep === 'email') {
        userData.email = text;
        onboardingStep = 'voice';
        appendMessage('bot', "Got it! Lastly, would you prefer a <b>Male</b> or <b>Female</b> <b>American Accent</b> voice for our conversation?");
        appendSuggestions([
            { text: "Female Voice (US)", action: "voice:female" },
            { text: "Male Voice (US)", action: "voice:male" }
        ]);
        
        notifySlack(`New Lead: *${userData.fullName}* (${userData.email}) has started a conversation.`);
    }
}

// Helper Functions
function formatBotText(text) {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    formatted = formatted.replace(/\*/g, '');
    const categories = ['Commercial', 'Life', 'Personal', 'Retirement', 'Auto', 'Home', 'Workers Comp'];
    categories.forEach(cat => {
        const regex = new RegExp(`\\b${cat}\\b`, 'gi');
        formatted = formatted.replace(regex, match => `<b>${match}</b>`);
    });
    return formatted;
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    
    const cleanText = sender === 'bot' ? formatBotText(text) : text;
    msgDiv.innerHTML = `<div class="message-content">${cleanText}</div>`;
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    messageHistory.push({ sender, text: cleanText.replace(/<[^>]*>/g, '') });
    
    if (sender === 'bot' && onboardingStep === 'ready') {
        if (CONFIG.SPEECH_ENABLED && !CONFIG.IS_MUTED) {
            const speechText = cleanText.replace(/<[^>]*>/g, '');
            speak(speechText);
        }
    }
}

function notifySlack(message) {
    if (!CONFIG.SLACK_WEBHOOK_URL || CONFIG.SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL') return;

    fetch(CONFIG.SLACK_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ payload: JSON.stringify({ text: message }) })
    }).then(() => console.log('Slack lead sent'))
      .catch(err => console.error('Slack Notify Error:', err));
}

async function sendConversationSummary() {
    if (messageHistory.length < 5) return;

    const summaryPrompt = `Provide a very brief 2-sentence summary of this conversation for a lead notification.
    Conversation: ${JSON.stringify(messageHistory.slice(-10))}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }]
            })
        });
        const data = await response.json();
        const summary = data.candidates[0].content.parts[0].text;
        
        notifySlack(`*Conversation Summary for ${userData.fullName}:*\n*Email:* ${userData.email}\n*Summary:* ${summary}`);
    } catch (err) {
        console.error('Summary Generation Error:', err);
    }
}

function appendSuggestions(suggestions) {
    const suggDiv = document.createElement('div');
    suggDiv.className = 'suggestions';
    
    suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.innerText = s.text;
        btn.onclick = () => handleSuggestion(s);
        suggDiv.appendChild(btn);
    });
    
    chatMessages.appendChild(suggDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleSuggestion(s) {
    if (s.action.startsWith('voice:')) {
        CONFIG.VOICE_GENDER = s.action.split(':')[1];
        onboardingStep = 'ready';
        const welcome = `Excellent choice! Hello ${userData.fullName.split(' ')[0]}, I'm the Insurance Boss. I'm here to help you navigate <b>Commercial</b>, <b>Life</b>, <b>Personal</b>, and <b>Retirement</b> insurance. How can I help you today?`;
        appendMessage('bot', welcome);
        appendSuggestions([
            { text: "Auto Quote", action: "form:auto_quote" },
            { text: "Home Quote", action: "form:home_insurance" },
            { text: "Life Insurance", action: "topic:life" },
            { text: "Business Insurance", action: "topic:commercial" }
        ]);
    } else if (s.action.startsWith('form:')) {
        const formKey = s.action.split(':')[1];
        openForm(formKey);
    } else if (s.action.startsWith('topic:')) {
        const topic = s.action.split(':')[1];
        userInput.value = `Tell me about ${topic} insurance`;
        chatForm.dispatchEvent(new Event('submit'));
    }
}

function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'typing';
    typingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <span style="margin-left: 8px">Insurance Boss is thinking...</span>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

async function getGeminiResponse(prompt) {
    const systemPrompt = `You are the "Insurance Boss", a professional, exceptionally kind, and expert insurance consultant.
    USER CONTEXT: Name: ${userData.fullName}, Email: ${userData.email}.
    Use this Knowledge Base: ${JSON.stringify(knowledgeBase)}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: "Understood. I am the Insurance Boss. I will use the customer's name, avoid asterisks, and only show forms when needed." }] },
                    { role: 'user', parts: [{ text: prompt }] }
                ]
            })
        });

        const data = await response.json();
        if (data.error) return `Error: ${data.error.message}`;
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "I'm having a little trouble connecting. Please try again or call us at 732-COVERED!";
    }
}

function processBotResponse(text) {
    const formMatch = text.match(/\[TRIGGER_FORM:(\w+)\]/);
    let cleanText = text.replace(/\[TRIGGER_FORM:\w+\]/g, '').trim();
    
    appendMessage('bot', cleanText);
    
    if (formMatch) {
        const formKey = formMatch[1];
        setTimeout(() => openForm(formKey), 1000);
    }
}

function openForm(formKey) {
    const formInfo = knowledgeBase.forms[formKey];
    if (!formInfo) return;
    
    formTitleEl.innerText = formInfo.name;
    formEmbedArea.innerHTML = `<zapier-interfaces-page-embed 
        page-id='${formInfo.embed_id}' 
        test-id='${formInfo.embed_id}-zapier-interfaces-page-embed-iframe'
        no-background='false' 
        style='width: 100%; height: 100%;'>
    </zapier-interfaces-page-embed>`;
    
    formContainer.classList.remove('hidden');
    notifySlack(`User *${userData.fullName}* opened the *${formInfo.name}* form.`);
}

function speak(text) {
    if (!synthesis || !CONFIG.SPEECH_ENABLED || CONFIG.IS_MUTED) return;
    synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthesis.getVoices();
    
    if (voices.length === 0) {
        setTimeout(() => speak(text), 100);
        return;
    }

    let selectedVoice = utteranceVoice; // Use manually selected voice if available
    
    if (!selectedVoice) {
        const usVoices = voices.filter(v => v.lang.includes('en-US'));
        if (CONFIG.VOICE_GENDER === 'female') {
            selectedVoice = usVoices.find(v => v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female') || v.name.includes('Google US English')) || usVoices.find(v => v.name.includes('Female')) || usVoices[0];
        } else {
            selectedVoice = usVoices.find(v => (v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Mark') || v.name.includes('Male')) && !v.name.includes('Female') && !v.name.includes('Zira') && !v.name.includes('Samantha')) || voices.find(v => v.name.includes('Male') && v.lang.includes('en')) || usVoices.find(v => !v.name.includes('Female') && !v.name.includes('Zira')) || usVoices[0];
        }
    }
    
    utterance.voice = selectedVoice || voices[0];
    utterance.onstart = () => windowAvatar.classList.add('speaking');
    utterance.onend = () => windowAvatar.classList.remove('speaking');
    synthesis.speak(utterance);
}

if (synthesis.onvoiceschanged !== undefined) {
    synthesis.onvoiceschanged = () => {
        console.log('System voices updated');
    };
}

init();
