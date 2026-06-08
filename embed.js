(function() {
    // 1. Set the base URL where this script is hosted to correctly load assets
    const baseUrl = 'https://musical-pavlova-e6c896.netlify.app';

    // Set global base URL for main.js to access knowledge_base.json
    window.INSURANCE_BOSS_BASE_URL = baseUrl;

    // 2. Load Google Fonts
    const fontPreconnect1 = document.createElement('link');
    fontPreconnect1.rel = 'preconnect';
    fontPreconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(fontPreconnect1);

    const fontPreconnect2 = document.createElement('link');
    fontPreconnect2.rel = 'preconnect';
    fontPreconnect2.href = 'https://fonts.gstatic.com';
    fontPreconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(fontPreconnect2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap';
    document.head.appendChild(fontLink);

    // 3. Load Stylesheet
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = baseUrl ? baseUrl + '/style.css' : 'style.css';
    document.head.appendChild(styleLink);

    // 4. Load Zapier Web Components
    const zapierScript = document.createElement('script');
    zapierScript.type = 'module';
    zapierScript.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
    document.head.appendChild(zapierScript);

    // 5. Inject HTML structure into the host website
    const widgetHTML = `
        <div id="insurance-boss-widget">
            <!-- Floating Button -->
            <button id="chat-toggle" class="chat-toggle">
                <img src="${baseUrl}/avatar.png" alt="Insurance Boss" id="toggle-avatar">
                <span class="pulse"></span>
            </button>

            <!-- Chat Window -->
            <div id="chat-window" class="chat-window hidden">
                <div class="chat-header">
                    <div class="header-info">
                        <div class="avatar-container">
                            <img src="${baseUrl}/avatar.png" alt="Insurance Boss" id="window-avatar">
                            <span class="status-indicator"></span>
                        </div>
                        <div class="header-text">
                            <h3>Insurance Boss</h3>
                            <p>Always Online</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="mic-toggle" title="Talk to Insurance Boss">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path id="mic-icon" fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                                <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            </svg>
                        </button>
                        <button id="voice-settings-btn" title="Voice Settings">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                        </button>
                        <button id="mute-toggle" title="Mute/Unmute Bot">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path id="mute-icon" fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                        </button>
                        <button id="close-chat" title="Close Chat">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div id="chat-messages" class="chat-messages">
                    <div class="message bot-message">
                        <div class="message-content">
                            Hello! I'm the Insurance Boss. How can I help you protect what matters most today?
                        </div>
                    </div>
                </div>

                <div id="form-container" class="form-container hidden">
                    <div class="form-header">
                        <span id="form-title">Quote Form</span>
                        <button id="close-form">&times;</button>
                    </div>
                    <div id="zapier-form-embed"></div>
                </div>

                <div class="chat-input-area">
                    <form id="chat-form">
                        <input type="text" id="user-input" placeholder="Ask about insurance..." autocomplete="off">
                        <button type="submit" id="send-btn">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <div id="voice-settings-modal" class="modal hidden">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Voice Settings</h3>
                    <button id="close-voice-settings">&times;</button>
                </div>
                <div id="voice-list" class="voice-list"></div>
                <div class="modal-footer">
                    <p>Choose your preferred American voice.</p>
                </div>
            </div>
        </div>
    `;

    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = widgetHTML;
    document.body.appendChild(widgetContainer);

    // 6. Load main.js to initialize functionality
    const mainScript = document.createElement('script');
    mainScript.src = baseUrl ? baseUrl + '/main.js' : 'main.js';

    function initWidget() {
        document.body.appendChild(widgetContainer);
        document.body.appendChild(mainScript);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();
