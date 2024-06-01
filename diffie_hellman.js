class DiffieHellman {
    constructor(p, g, a) {
        this.p = p;
        this.g = g;
        this.a = a;
        this.A = 0;
        this.K = 0;
    }
    public(p = this.p, g = this.g, a = this.a) {
        this.A = (g ** a) % p;
        return this.A;
    }
    key(B, p = this.p, a = this.a) {
        this.K = (B ** a) % p;
        return this.K;
    }
}

// const p = 23;
// const g = 5;

// const alice = new DiffieHellman(p, g, 4);
// const bob = new DiffieHellman(p, g, 16);

// alice.public();
// bob.public();

// alice.key(bob.A);
// bob.key(alice.A);

// console.log(alice.K);
// console.log(bob.K);