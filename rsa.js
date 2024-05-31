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

/*

Algoritmo RSA

si scelgonon due numeri primi (grandi e distinti)
p e q

calcolo il prodotto

n = p * q

calcolo la funzione di Eulero ⱷ(n) = (p - 1) * (q - 1)

si calcola il numero d (esponente privato) tale che il suo prodotto con 'e'
sia congruo a 1 modulo ⱷ(n)

scelgo p e q

p = 3 ; q = 11

calcolo n cioe il prodotto tra p e q

n = p * q = 33
ϕ(n) = (p - 1) * (q - 1) = 20

ora scelgo il numero 'e' (cioè l'esponente pubblico) tale che 1 < e < ϕ(n) e che sia coprimo con ϕ(n).
cioe che il MCD (massimo comun divisore) tra 'e' ed ϕ(n) deve essere 1
MCD(e, ϕ(n)) = 1

ora calcolo d (cioè l'esponente privato) come l'inverso moltiplicativo di 'e' modulo ϕ(n)
tale che d * e = 1 MOD(ϕ(n))

le chiavi saranno quindi:
 - pubblica, composta da (e, n)
 - privata, composta da (d, n) 

CALCOLO DEL MESSAGGIO CIFRATO

messaggio M (dove M è un intero e 0 <= M < n)

utilizzando la chiave pubblica (e, n) si calcola il testo cifrato C
C = M^e mod n

CALCOLO DEL MESSAGGIO DECIFRATO

Per decrittografare C usando la chiave privata (d, n) si calcola il messaggio M
M = C^d mod n

ESEMPIO:

p = 3
q = 11

n = 3 * 11 = 33

ϕ(n) = (p - 1) * (q - 1) = 2 * 10 = 20
ϕ(n) = 20

e = un numero tale che 1 < e < ϕ(n) e che sia coprimo con ϕ(n) (cioè che MCD(e, ϕ(n)) = 1)

e = 3 va bene per il nostro scopo

d = 7
perche 7 * 3 = 21

21 mod 20 = 1

in poche parole (d * e) MOD(20) = 1

d * 3 MOD(20) = 1

il 7 va bene

ora ho le mie chiavi:
pubb = (3, 33)
priv = (7, 33)

ESEMPIO MESSAGGIO

pubb = (3, 33)
priv = (7, 33)

M = 5

C = M^e mod n = 5^3 mod 33 = 26

M = C^d mod n = 26^7 mod 33 = 5

*/