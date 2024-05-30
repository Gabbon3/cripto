class Cesare {
    constructor() {
        this.alfabeto = [...'abcdefghijklmnopqrstuvwxyz'];
    }
    cifra(testo, key) {
        testo = testo.toLowerCase();
        let testo_cifrato = "";
        for (let i = 0; i < testo.length; i++) {
            const l = this.alfabeto.indexOf(testo[i]); // lettera testo
            if (l == -1) {
                testo_cifrato += testo[i];
                continue;
            }
            let lc = (l + key) % this.alfabeto.length;
            testo_cifrato += this.alfabeto[lc];
        }
        return testo_cifrato;
    }
    decifra(testo_cifrato, key) {
        let testo = "";
        for (let i = 0; i < testo_cifrato.length; i++) {
            const l = this.alfabeto.indexOf(testo_cifrato[i]); // lettera testo
            if (l == -1) {
                testo += testo_cifrato[i];
                continue;
            }
            let lc = (l - key + this.alfabeto.length) % this.alfabeto.length;
            testo += this.alfabeto[lc];
        }
        return testo;
    }
}

const cesare = new Cesare();

class Cesare2 {
    constructor() {
        this.alfabeto = [...'abcdefghijklmnopqrstuvwxyz'];
    }
    cifra(testo, key) {
        testo = testo.toLowerCase();
        let testo_cifrato = "";
        let p = 0; // lettera precedente
        for (let i = 0; i < testo.length; i++) {
            const l = this.alfabeto.indexOf(testo[i]); // lettera testo
            if (l == -1) {
                testo_cifrato += testo[i];
                continue;
            }
            let lc = (l + key + p) % this.alfabeto.length;
            p = lc;
            testo_cifrato += this.alfabeto[lc];
        }
        return testo_cifrato;
    }
    decifra(testo_cifrato, key) {
        let testo = "";
        let p = 0;
        for (let i = 0; i < testo_cifrato.length; i++) {
            const l = this.alfabeto.indexOf(testo_cifrato[i]); // lettera testo
            if (l == -1) {
                testo += testo_cifrato[i];
                continue;
            }
            let lc = (l - key - p);
            while (lc < 0) {
                lc += this.alfabeto.length;
            }
            p = l;
            testo += this.alfabeto[lc];
        }
        return testo;
    }
}

const cesare2 = new Cesare2();

function get_chiave(n = 16) {
    const simboli = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?';
    let chiave = '';
    for (let i = 0; i < n; i++) {
        chiave += simboli[Math.floor(Math.random() * simboli.length)];
    }
    return chiave;
}
/*
const testo = 'cazzo culo palle sesso peloso';
const key = 5;
const testo_cifrato = cesare2.cifra(testo, key);
console.log(testo_cifrato);
const testo_decifrato = cesare2.decifra(testo_cifrato, key);
console.log(testo_decifrato);
*/