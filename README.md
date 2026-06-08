# Insurance Boss Chatbot

A premium, modern, and fully interactive embeddable chat widget for **The Insurance Boss** (`theinsuranceboss.com`).

This chatbot features:
- **Speech Synthesis (TTS) & Recognition (STT)**: Speaks with customized American voices and listens to voice inputs.
- **Vite & Tailwind-like CSS**: Sleek glassmorphic UI, rich color transitions, premium typography (Outfit font), and active status indicators.
- **Zapier Interfaces Integration**: Embedded forms for lead generation.
- **Slack Lead Notifications**: Real-time Slack notifications for new leads and conversation summaries.
- **Gemini API Integration**: Intelligent customer support powered by Google's Gemini models.

---

## 🚀 Easy Integration (Embed in other projects)

You can embed this chatbot widget into **any website or project** by simply pasting a single script tag into your HTML. The script handles injecting the stylesheet, fonts, Zapier components, and chatbot logic automatically.

Add this single script tag right before the closing `</body>` tag on any page:

```html
<script src="https://cdn.jsdelivr.net/gh/theinsuranceboss/insurancebosschatbot@main/embed.js"></script>
```

That's it! The chatbot will render as a floating button in the bottom-right corner of the page.

---

## 🛠️ Local Development & Setup

To run or customize the chatbot locally:

### 1. Clone the Repository
```bash
git clone https://github.com/theinsuranceboss/insurancebosschatbot.git
cd insurancebosschatbot
```

### 2. Install Dependencies
This project uses [Vite](https://vite.dev) for local development and previewing:
```bash
npm install
```

### 3. Run the Dev Server
```bash
npm run dev
```
Open the local URL (usually `http://localhost:5173`) in your browser to view the widget.

---

## ⚙️ Configuration & Customization

The main settings are configured in [main.js](file:///d:/Antigravity%20APPS/Insurance%20Boss%20Chatbot/main.js):

- **API Keys & Webhooks**: Located in the `CONFIG` object. For public security on GitHub, these secrets are Base64 encoded in the source code and decoded at runtime.
- **Knowledge Base**: Adjust the answers and business info in [knowledge_base.json](file:///d:/Antigravity%20APPS/Insurance%20Boss%20Chatbot/knowledge_base.json).
- **Avatar & Logo**: Replace `avatar.png` with your preferred logo image.
- **Styles**: Custom CSS styles, color variables (gold accent, primary navy background, etc.), and animations are in [style.css](file:///d:/Antigravity%20APPS/Insurance%20Boss%20Chatbot/style.css).
- **Hosting URL**: If you deploy to a different hosting provider (other than Netlify), update the `baseUrl` variable inside [embed.js](file:///d:/Antigravity%20APPS/Insurance%20Boss%20Chatbot/embed.js) to point to your new domain.

---

## 🌐 Netlify Deployment

This repository is optimized for deployment on Netlify. 
- The `netlify.toml` is configured to serve static assets from the root.
- The `_headers` file ensures proper CORS headers are set so the assets can be loaded securely from other domains when the script is embedded.
