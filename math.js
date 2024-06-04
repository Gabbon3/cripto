class MATH {
    /**
     * x : y = z : ?
     * @param {number} x parametro della proporzione
     * @param {number} y parametro della proporzione
     * @param {number} z parametro della proporzione
     * @returns {number} risultato della proporzione
     */
    proporzione(x, y, z) {
        return (y * z) / x;
    }
    /**
     * Approssima un numero utilizzando due cifre decimali dopo la virgola
     * @param {Number} num 
     * @returns 
     */
    approssima(num) {
        return Math.round(num * 100) / 100;
    }
    /**
     * genera la sequenza di fibonacci fino a: 'l'
     * partendo da [n, k] che sono due elementi della sequenza fibonacci
     * @returns {array} sequenza di fibonacci personalizzata
     */
    fibonacci(n, k, l) {
        let fibonacci = [n, k];
        for (let i = 1; i < l; i++) {
            fibonacci.push(fibonacci[i] + fibonacci[i - 1]);
        }
        return fibonacci;
    }
    /**
     * genera un array proporzionato ad un array passato in input
     * l'array finale è composto da percentuali
     * @param {array} array da proporzionare
     * @param {number} max elemento massimo dell'array
     * @param {number} l lunghezza array finale
     */
    proporzione_percentuali(array, max, l) {
        let array_proporzionato = [];
        for (let i = 0; i < l; i++) {
            // x : y = z : ?
            array_proporzionato.push(math.proporzione(max, array[i], 1));
        }
        return array_proporzionato;
    }
    /**
     * Crivello Eratostene per generare una lista di numeri primi
     */
    genera_lista_numeri_primi(n) {
        // Creare un array di booleani, inizialmente tutti true
        const is_prime = Array(n + 1).fill(true);
        is_prime[0] = is_prime[1] = false; // 0 e 1 non sono numeri primi
        // Ottimizzazione: iniziare dal primo numero primo (2) e saltare i multipli dei numeri primi
        for (let i = 2; i <= Math.sqrt(n); i++) {
            if (is_prime[i]) {
                // Marcare solo i multipli del numero primo corrente come non primi
                for (let j = i * i; j <= n; j += i) {
                    is_prime[j] = false;
                }
            }
        }
        // Creare una lista dei numeri primi
        const primes = [];
        for (let i = 2; i <= n; i++) {
            if (is_prime[i]) {
                primes.push(i);
            }
        }
        return primes;
    }
    /**
     * 
     */
    is_prime(n) {
        // -- Casi base
        if (n <= 1) return false;
        if (n === 2) return true;
        if (n % 2 === 0) return false;
        // -- Controllo i divisori fino alla radice quadrata di n
        let d = 3;
        const limit = n ** 0.5 + 1;
        // ---
        while (d <= limit) {
            if (n % d == 0) {
                return false;
            }
            d += 2; // evito i numeri pari
        }
        return true;
    }
    /**
     * Calcola il massimo comun divisore
     */
    mcd(a, b) {
        // ---
        a = BigInt(a);
        b = BigInt(b);
        // -- Euclide per MCD
        while (b !== 0n) {
            [a, b] = [b, a % b];
        }
        return a;
    }
    /**
     * Euclide esteso
     */
    euclide_esteso(e, phi) {
        phi = BigInt(phi);
        let old_r = BigInt(e);
        let r = BigInt(phi);
        // ---
        let old_s = 1n;
        let s = 0n;
        // ---
        let old_t = 0n;
        let t = 1n;
        // ---
        while (r !== 0n) {
            // -- quoziente
            let q = old_r / r;
            // -- resti
            const new_r = old_r - q * r;
            old_r = r;
            r = new_r;
            // -- coefficente s
            const new_s = old_s - q * s;
            old_s = s;
            s = new_s;
            // -- coefficente t
            const new_t = old_t - q * t;
            old_t = t;
            t = new_t;
        }
        // ---
        if (old_r === 1n) {
            return {
                mcd: old_r,
                d: (old_s + phi) % phi,
                s: old_s,
                t: old_t
            };
        } else {
            return false;
        }
    }
}

const math = new MATH();

class Random {
    /**
     * restituisce a caso un valore booleano
     */
    bool() {
        return this.min_max(0, 1) == 1;
    }
    /**
     * Restituisce un numero scegliendo un range
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    min_max(min, max) {
        return Math.round(Math.random() * (max - min)) + min;
    }
    /**
     * Restituisce un BigInt casuale
     * @param {Int} bits 
     * @returns 
     */
    big_int(bits) {
        let num = BigInt("1");
        for (let i = 0; i < bits - 2; i++) {
            num = (num << 1n) | BigInt(Math.floor(Math.random() * 2));
        }
        num = (num << 1n) | 1n; // Assicurati che sia dispari
        return num;
    }
    /**
     * genera un numero casuale sicuro
     * @param {int} min 
     * @param {int} max 
     * @returns {int} numero casuale sicuro
     */
    secure_min_max(min, max) {
        // Calcola la lunghezza del range
        const range = max - min;
        // Crea un array di bytes con la lunghezza del range
        const byteArray = new Uint8Array(1);
        // Genera un numero casuale all'interno del range utilizzando crypto.getRandomValues()
        // Byte casuale verrà mappato nel range specificato
        window.crypto.getRandomValues(byteArray);
        let randomNumber = byteArray[0] / 255;
        // Mappa il numero casuale all'interno del range specificato
        randomNumber = Math.floor(randomNumber * (range + 1));
        // Aggiungi il minimo per ottenere un numero all'interno del range desiderato
        return min + randomNumber;
    }
}

const random = new Random();