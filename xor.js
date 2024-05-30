class XOR {
    constructor() {}
    /**
     * XOR tra due testi
     * @param {string} text - Il testo da cifrare
     * @param {string} key - La chiave di cifratura
     * @returns {string} - Il testo cifrato
     */
    xor(text1, text2) {
        let c = 0;
        let t = "";
        // ---
        const text = text1.length > text2.length ? text1 : text2;
        const key = text1.length > text2.length ? text2 : text1;
        // ---
        for (let i = 0; i < text.length; i++) {
            const ascii_text = text[i].charCodeAt(0);
            const ascii_key = key[c].charCodeAt(0);
            t += String.fromCharCode(ascii_text ^ ascii_key);
            c = (c + 1) % key.length;
        }
        // ---
        return t;
    }
    /**
     * Cifra il testo utilizzando la chiave
     * @param {string} text - Il testo da cifrare
     * @param {string} key - La chiave di cifratura
     * @returns {string} - Il testo cifrato
     */
    cifra(text, key) {
        const t = this.xor(text, key);
        return btoa(t);
    }
    /**
     * Decifra il testo utilizzando la chiave
     * @param {string} text - Il testo cifrato
     * @param {string} key - La chiave di decifratura
     * @returns {string} - Il testo decifrato
     */
    decifra(text, key) {
        text = atob(text);
        const t = this.xor(text, key);
        return t;
    }
}

class XOR2 {
    constructor() {}
    /**
     * 
     */
    cifra() {

    }
    /**
     * 
     */
    decifra() {

    }
}

const xor = new XOR();
const xor2 = new XOR2();

const text = "Ei ciao, questo sarà un testo cifrato";

const key = "codiceblocco";

const encrypted = xor.cifra(text, key);

console.log(encrypted);
console.log('----');

const decrypted = xor.decifra(encrypted, key);

console.log(decrypted);