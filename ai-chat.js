/* PassPort AI Chatbot Logic 
   Powered by Google Gemini
*/

const API_KEY = "API_KEY"; // 🔴 PASTE YOUR KEY HERE
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// 1. THE KNOWLEDGE BASE (Training Data)
// We feed this to the AI so it knows how your SDK works.
const SYSTEM_PROMPT = `
You are the official Developer Support AI for "PassPort", a biometric authentication SDK.
Your goal is to help developers implement the SDK.
Always format code using Markdown blocks.
Be concise, helpful, and technical.

HERE IS THE OFFICIAL DOCUMENTATION:
1. Installation: <script src="https://passportbycw.netlify.app/sdk.js"></script>
2. Registration Method:
   await passport.register(userEmail);
   - Returns: A Promise resolving to a Credential object (id, rawId, type).
   - Error Handling: Throws 'NotAllowedError' if user cancels.
   - Requirement: Must be triggered by a user click (button).
3. Login Method:
   await passport.login();
   - Returns: A Promise resolving to an Assertion object.
   - Note: No arguments required.
4. Security: 
   - Works ONLY on HTTPS or localhost.
   - Uses FIDO2/WebAuthn standards.
5. Common Errors:
   - "NotAllowedError": User cancelled or timed out.
   - "SecurityError": Not using HTTPS.
`;

// 2. UI Logic
const chatWindow = document.getElementById('ai-window');
const messagesContainer = document.getElementById('ai-messages');
const inputField = document.getElementById('ai-input');

function toggleChat() {
    chatWindow.classList.toggle('hidden');
    if (!chatWindow.classList.contains('hidden')) {
        inputField.focus();
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

// 3. Messaging Logic
async function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    inputField.value = '';
    
    // Show "Typing..."
    const loadingId = addMessage('Thinking...', 'bot', true);

    try {
        const response = await fetchGemini(text);
        
        // Remove loading message and add real response
        document.getElementById(loadingId).remove();
        addMessage(response, 'bot');
    } catch (err) {
        document.getElementById(loadingId).innerText = "Error: Could not connect to AI.";
        console.error(err);
    }
}

// 4. API Call to Google Gemini
async function fetchGemini(userQuery) {
    const payload = {
        contents: [{
            parts: [
                { text: SYSTEM_PROMPT }, // Context
                { text: `User Question: ${userQuery}` } // Input
            ]
        }]
    };

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

// 5. Render Messages (with Markdown support)
function addMessage(text, sender, isLoading = false) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    if (isLoading) div.id = "loading-" + Date.now();
    
    // Use 'marked' library to parse Code Blocks/Bold/Italics
    div.innerHTML = sender === 'bot' && !isLoading ? marked.parse(text) : text;
    
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return div.id;
}
