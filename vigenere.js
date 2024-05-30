class Vigenere {
    constructor() {
        this.table = false;
        this.alphabet = 'abcdefghijklmnopqrstuvwxyz';
    }
    /**
     * 
     */
    init() {
        this.table = [];
        // Create the Vigenère table
        for (let i = 0; i < 26; i++) {
            const row = [];
            for (let j = 0; j < 26; j++) {
                row.push(this.alphabet[(i + j) % 26]);
            }
            this.table.push(row);
        }
    }
    /**
     * Cifra il testo utilizzando la chiave
     * @param {string} text - Il testo da cifrare
     * @param {string} key - La chiave di cifratura
     * @returns {string} - Il testo cifrato
     */
    cifra(text, key) {
        text = text.toLowerCase();
        let c = 0;
        let t = '';
        for (let i = 0; i < text.length; i++) {
            const col = this.alphabet.indexOf(text[i]);
            if (col === -1) {
                t += text[i];
                continue;
            }
            t += this.table[col][this.alphabet.indexOf(key[c])];
            c = (c + 1) % key.length;
        }
        return t;
    }
    /**
     * Decifra il testo utilizzando la chiave
     * @param {string} text - Il testo cifrato
     * @param {string} key - La chiave di decifratura
     * @returns {string} - Il testo decifrato
     */
    decifra(text, key) {
        let c = 0;
        let t = '';
        for (let i = 0; i < text.length; i++) {
            const row = this.alphabet.indexOf(key[c]);
            const col = this.table[row].indexOf(text[i].toLowerCase());
            if (col === -1) {
                t += text[i];
                continue;
            }
            t += this.alphabet[col];
            c = (c + 1) % key.length;
        }
        return t;
    }
}
/*
const vigenere = new Vigenere();

vigenere.init();

const text = "ciao sono un testo di prova";

const key = "codiceblocco";

const encrypted = vigenere.cifra(text, key);

console.log(encrypted);
console.log('----');

const decrypted = vigenere.decifra(encrypted, key);

console.log(decrypted);
*/