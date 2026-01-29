const status = document.getElementById('status-msg');
const buffer = (str) => Uint8Array.from(str, c => c.charCodeAt(0));
const cleanDomain = window.location.hostname;

// 1. REGISTRATION
document.getElementById('btn-register').addEventListener('click', async () => {
    const email = document.getElementById('user-email').value || "dev@example.com";
    status.innerText = "Initializing secure session...";

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const createOptions = {
        publicKey: {
            challenge: challenge,
            rp: { name: "PassPort Demo", id: cleanDomain },
            user: {
                id: buffer("user_" + Date.now()),
                name: email,
                displayName: email.split('@')[0]
            },
            pubKeyCredParams: [
                { alg: -7, type: "public-key" },
                { alg: -257, type: "public-key" }
            ],
            authenticatorSelection: {
                userVerification: "preferred",
                residentKey: "required"
            },
            timeout: 60000
        }
    };

    try {
        const credential = await navigator.credentials.create(createOptions);
        console.log("Registered:", credential);
        status.innerHTML = "✅ <span style='color:#22d3ee'>Passkey Created!</span>";
    } catch (err) {
        if (err.name === 'NotAllowedError') {
            status.innerHTML = "📲 <b>Scan the QR Code</b> on your phone to continue.";
        } else {
            status.innerText = "Error: " + err.message;
        }
    }
});

// 2. LOGIN
document.getElementById('btn-login').addEventListener('click', async () => {
    status.innerText = "Verifying...";
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    try {
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: challenge,
                timeout: 60000,
                userVerification: "required"
            }
        });
        status.innerHTML = "🚀 <span style='color:#22d3ee'>Welcome back!</span>";
    } catch (err) {
        status.innerText = "Login failed: " + err.name;
    }
});