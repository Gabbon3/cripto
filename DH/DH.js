class DH {
    static P = 0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;
    static G = 2n;
    // ---
    constructor() {
        this.p = DH.P;
        this.g = DH.G;
        this.PRK = this.genera_chiave_privata(); // Genera chiave privata casuale
        this.PBK = this.calcola_chiave_pubblica(); // Calcola la chiave pubblica
    }
    /**
     * Genera casualmente una chiave privata a 256 bit
     * @returns {BigInt} 
     */
    genera_chiave_privata() {
        const array = new Uint8Array(32);  // 256 bit = 32 byte
        window.crypto.getRandomValues(array); // Usa la crittografia sicura del browser per generare una chiave casuale
        return BigInt('0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join(''));
    }
    /**
     * Calcola la chiave pubblica PB = (g ^ PR) % p
     * @returns {BigInt}
     */
    calcola_chiave_pubblica() {
        return this.potenza_modulo(this.g, this.PRK, this.p);
    }
    /**
     * Calcola chiave simmetrica condivisa
     * @param {*} PBK 
     * @returns {Uint8Array} chiave simmetrica
     */
    calcola_chiave_simmetrica(PBK) {
        const shared_key = this.potenza_modulo(PBK, this.PRK, this.p);
        // -- hash chiave condivisa in 256 bit
        return window.crypto.subtle.digest('SHA-256', Buffer.bigint.bytes_(shared_key));
    }
    /**
     * Esegue in maniera efficente una potenza modulo
     * @param {BigInt} B base
     * @param {BigInt} E esponente
     * @param {BigInt} M modulo
     * @returns 
     */
    potenza_modulo(B, E, M) {
        let result = 1n;
        B = B % M;
        while (E > 0n) {
            if (E % 2n === 1n) {
                result = (result * B) % M;
            }
            E = E >> 1n;
            B = (B * B) % M;
        }
        return result;
    }
}

window.onload = async () => {
    // Esempio di utilizzo
    const alice = new DH();
    const bob = new DH();

    alice.calcola_chiave_simmetrica(bob.PBK).then(sharedKeyAlice => {
        console.log("Chiave condivisa di Alice:", Buffer.base64._bytes(new Uint8Array(sharedKeyAlice)));
    });

    bob.calcola_chiave_simmetrica(alice.PBK).then(sharedKeyBob => {
        console.log("Chiave condivisa di  Bob :", Buffer.base64._bytes(new Uint8Array(sharedKeyBob)));
    });
}