/**
 * PassPort SDK v1.0.0 | (c) 2026 PassPort Auth
 * Secure Biometric Authentication for Developers
 */
(function() {
    const PassPort = {
        _buffer: (str) => Uint8Array.from(str, c => c.charCodeAt(0)),

        async register(email) {
            if (!window.isSecureContext) throw new Error("PassPort requires HTTPS or Localhost.");
            
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options = {
                publicKey: {
                    challenge: challenge,
                    rp: { name: "PassPort Service", id: window.location.hostname },
                    user: {
                        id: this._buffer("user_" + Date.now()),
                        name: email,
                        displayName: email.split('@')[0]
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: "public-key" },  // ES256
                        { alg: -257, type: "public-key" } // RS256
                    ],
                    authenticatorSelection: { 
                        userVerification: "preferred", 
                        residentKey: "required" 
                    },
                    timeout: 60000
                }
            };

            const credential = await navigator.credentials.create(options);
            return credential;
        },

        async login() {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const assertion = await navigator.credentials.get({
                publicKey: { 
                    challenge: challenge, 
                    timeout: 60000, 
                    userVerification: "required" 
                }
            });
            return assertion;
        }
    };

    // Global Export
    window.passport = PassPort;
    console.log("%c🔑 PassPort SDK Loaded & Ready", "color: #22d3ee; font-weight: bold; font-size: 12px;");
})();
