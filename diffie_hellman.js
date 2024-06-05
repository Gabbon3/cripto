class DiffieHellman {
    constructor(p = 0n, g = 0n, a = 0n) {
        this.p = BigInt(p);
        this.g = BigInt(g);
        this.a = BigInt(a);
        this.A = 0n;
        this.K = 0n;
    }
    public(p = this.p, g = this.g, a = this.a) {
        this.A = g ** a % p;
        return this.A;
    }
    key(B, p = this.p, a = this.a) {
        this.K = B ** a % p;
        return this.K;
    }
    genera_p_g(limite = 100) {
        const primi = math.genera_lista_numeri_primi(limite);
        this.p = BigInt(primi[random.min_max(4, primi.length - 1)]);
        this.g = this.genera_e(this.p);
        return [this.p, this.g];
    }
    /**
     * 
     */
    genera_e(phi) {
        const arr = [];
        const max_try = 1615;
        let e = 3n;
        // ---
        for (let i = 0; i < max_try; i++) { // e deve essere dispari
            if (math.mcd(e, phi) === 1n) {
                arr.push(e);
                i++;
            }
            e += 2n;
            if (e >= phi) break;
        }
        return arr.length > 0 ? arr[random.min_max(0, arr.length)] : false;
    }
}

class RSA {
    constructor(p = 0, q = 0) {
        this.p = p;
        this.q = q;
        // ---
        this.n = 0;
        this.phi = 0;
        // ---
        this.e = 0;
        this.d = 0;
        // ---
        this.public = [];
        this.private = [];
    }
    /**
     * genera due numeri primi
     */
    genera_p_q(limite) {
        const n_primi = math.genera_lista_numeri_primi(limite);
        n_primi.shuffle();
        this.p = BigInt(n_primi[0]);
        this.q = BigInt(n_primi[n_primi.length - 1]);
        // ---
        return {
            p: this.p,
            q: this.q
        }
    }
    /**
     * 
     */
    genera_e(phi = this.phi) {
        const arr = [];
        const max_try = 1615;
        let e = 3n;
        // ---
        for (let i = 0; i < max_try; i++) { // e deve essere dispari
            if (math.mcd(e, phi) === 1n) {
                arr.push(e);
                i++;
            }
            e += 2n;
            if (e >= phi) break;
        }
        return arr.length > 0 ? arr[random.min_max(0, arr.length - 1)] : false;
    }
    /**
     * 
     */
    genera_d() {
        return math.euclide_esteso(this.e, this.phi).d;
    }
    /**
     * 
     */
    genera_coppia() {
        // ---
        this.p = BigInt(this.p);
        this.q = BigInt(this.q);
        this.n = this.p * this.q;
        // ---
        this.phi = (this.p - 1n) * (this.q - 1n);
        // ---
        this.e = this.genera_e();
        // ---
        this.d = this.genera_d();
        // ---
        if (!this.e || !this.d) {
            return false;
        } else {
            this.public = [this.e, this.n];
            this.private = [this.d, this.n];
            return {
                public: this.public,
                private: this.private
            }
        }
    }
    /**
     * 0 <= M < n
     */
    cifra(M, K = this.public) {
        // -- BigInt
        M = BigInt(M);
        const e = BigInt(K[0]);
        const n = BigInt(K[1]);
        // ---
        const C = M ** e % n;
        return C;
    }
    /**
     * 
     */
    decifra(C, K = this.private) {
        // -- BigInt
        C = BigInt(C);
        const d = BigInt(K[0]);
        const n = BigInt(K[1]);
        // ---
        const M = C ** d % n;
        return M;
    }
}

const rsa = new RSA();

rsa.genera_p_q(500);

console.log('Esempio RSA');

console.log(rsa.genera_coppia());

const N = random.min_max(2, Number(rsa.n) - 1);


const cifrato = rsa.cifra(N);
const decifrato = rsa.decifra(cifrato);

console.log('N° da cifrare = ' + N);
console.log(' => ');
console.log('Cifrato: ' + cifrato);
console.log(' <= ');
console.log('Decifrato: ' + decifrato);

console.log('\n---\n\n');
console.log('Esempio Diffie Hellman');

const dh = new DiffieHellman();

const [p, g] = dh.genera_p_g(10000);

console.log('p = ' + p);
console.log('g = ' + g);

const [a, b] = [random.min_max(1, Number(p - 1n)), random.min_max(1, Number(p - 1n))]

console.log(' --- ');

console.log('numero casuale di alice: a = ' + a);
console.log('numero casuale di bob: b = ' + b);

console.log(' -- K:');

const alice = new DiffieHellman(p, g, a);
const bob = new DiffieHellman(p, g, b);

alice.public();
bob.public();

alice.key(bob.A);
bob.key(alice.A);

console.log('K generata da alice: ' + alice.K);
console.log('K generata da bob: ' + bob.K);