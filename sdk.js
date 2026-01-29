/**
 * PassPort SDK v1.0.0
 * (c) 2026 PassPort Auth
 */
(function() {
    const PassPort = {
        _buffer: (str) => Uint8Array.from(str, c => c.charCodeAt(0)),

        async register(email) {
            if (!window.isSecureContext) throw new Error("PassPort requires HTTPS.");
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
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
                    authenticatorSelection: { userVerification: "preferred", residentKey: "required" },
                    timeout: 60000
                }
            };

            return await navigator.credentials.create(options);
        },

        async login() {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            return await navigator.credentials.get({
                publicKey: { challenge: challenge, timeout: 60000, userVerification: "required" }
            });
        }
    };

    // Attach to window object
    window.passport = PassPort;
    console.log("🔑 PassPort SDK Loaded & Ready");
})();
