class RSA {
    constructor() {
        this.keys = null;
    }
    /**
     * 
     */
    async genera_coppia_chiavi() {
        const coppia = await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            true,
            ["encrypt", "decrypt"]
        );
        this.keys = coppia;
        return coppia;
    }
    /**
     * 
     * @param {*} key 
     * @returns 
     */
    async export_key(key) {
        const exported = await window.crypto.subtle.exportKey(
            "jwk", 
            key
        );
        return exported;
    }
    /**
     * 
     * @param {*} text 
     * @param {*} public_key 
     * @returns 
     */
    async cifra(text, public_key = this.keys.publicKey) {
        const encoded_text = new TextEncoder().encode(text);
        const encrypted_text = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP"
            },
            public_key,
            encoded_text
        );
        return encrypted_text;
    }
    /**
     * 
     * @param {*} encrypted_text 
     * @param {*} private_key 
     */
    async decifra(encrypted_text, private_key = this.keys.privateKey) {
        const decrypted_text = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            private_key,
            encrypted_text
        );
        return new TextDecoder().decode(decrypted_text);
    }
}

async function rsa_test() {
    const rsa = new RSA();
    const codifica = new Codifica();

    await rsa.genera_coppia_chiavi();
    
    const public = rsa.keys.publicKey;
    const private = rsa.keys.privateKey;

    const encrypt = await rsa.cifra('Ciao');
    
    console.log(codifica.array_buffer_to_base64(encrypt));

    const decrypt = await rsa.decifra(encrypt);

    console.log(decrypt);
}

rsa_test();