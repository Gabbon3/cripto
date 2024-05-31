class DEDG {
    /**
     * 
     * @param {Int} n_round numero di round da eseguire dopo la prima schermatura
     * @param {Int} block_size grandezza dei blocchi in bit
     */
    constructor(n_round = 8, block_size = 64) {
        this.encode = new Codifica();
        this.n_round = n_round;
        // ---
        this.recent_key = '';
        this.recent_iv = '';
        // ---
        this.block_size = block_size; // in bit
        this.block_size_mid = block_size / 2;
        this.iv_size = (block_size / 2) / 8;
        // ---
        this.s_box_index = 0;
        this.permute_index = 0;
        this.inverse_permute_index = 0;
    }
    /**
     * cifratura del messaggio
     * @param {string} M messaggio (testo)
     * @param {string} K chiave (base64) 64 bit
     * @returns {string} messaggio cifrato
     */
    encrypt(M = null, K = null) {
        // !--
        if (!K || !M) {
            throw new Error('Dati non conformi, inserire correttamente M, K');
        }
        // --!

        // inizializzazione
        M = this.encode.utf8_(M).binario_().string();
        K = this.encode._base64(K).binario_().string();
        let IV = this.get_random_bytes(this.iv_size, false);
        let [K1, K2] = K.match(new RegExp(`.{1,${this.block_size_mid}}`, 'g'));

        // --- calcolo quali s_box e permutazioni utilizzare
        this.calculate_indexs(K);

        // --- suddivido in blocchi
        const blocks = M.match(new RegExp(`.{1,${this.block_size}}`, 'g'));
        blocks[blocks.length - 1] += '0'.repeat(this.block_size - blocks[[blocks.length - 1]].length);

        // --- ottengo le chiavi e i vettori
        const keys = this.calculate_keys(K1, K2);

        // --- eseguo la prima schermatura
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.permute(blocks[i], Permutazioni[this.block_size][this.permute_index].p_);
            blocks[i] = blocks[i].match(new RegExp(`.{1,${this.block_size_mid}}`, 'g'));
        }

        // --- eseguo i round
        for (let r = 0; r < this.n_round; r++) {
            for (let i = 0; i < blocks.length; i++) {
                [blocks[i], IV] = this.round(blocks[i], keys[r], IV, i);
            }
        }

        // --- eseguo la schermatura finale
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = blocks[i].join('');
            blocks[i] = this.permute(blocks[i], Permutazioni[this.block_size][this.inverse_permute_index].p_);
        }
        return {
            M: this.encode._binario(blocks.join('')).base64_().string(),
            IV: this.encode._binario(IV).base64_().string()
        };
    }
    /**
     * decifratura del messaggio
     * @param {string} M messaggio (testo)
     * @param {string} K chiave (base64)
     * @param {string} IV vettore iniziale (base64)
     * @returns {string} messaggio decifrato
     */
    decrypt(M = null, K = null, IV = null) {
        // !--
        if (!K || !M || !IV) {
            throw new Error('Dati non conformi, inserire correttamente M, K e IV');
        }
        // --!

        // --- inizializzo
        M = this.encode._base64(M).binario_().string();
        K = this.encode._base64(K).binario_().string();
        IV = this.encode._base64(IV).binario_().string();
        let [K1, K2] = K.match(new RegExp(`.{1,${this.block_size_mid}}`, 'g'));

        // --- calcolo quali s_box e permutazioni utilizzare
        this.calculate_indexs(K);

        // ---
        const blocks = M.match(new RegExp(`.{1,${this.block_size}}`, 'g'));

        // --- Ottengo le chiavi
        const keys = this.calculate_keys(K1, K2);

        // --- eseguo la permutazione finale
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.permute(blocks[i], Permutazioni[this.block_size][this.inverse_permute_index]._p);
            blocks[i] = blocks[i].match(new RegExp(`.{1,${this.block_size_mid}}`, 'g'));
        }

        // --- eseguo i round
        for (let r = this.n_round - 1; r >= 0; r--) {
            for (let i = blocks.length - 1; i >= 0; i--) {
                [blocks[i], IV] = this.reverse_round(blocks[i], keys[r], IV, i);
            }
        }

        // --- Eseguo la permutazione inversa
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = blocks[i].join('');
            blocks[i] = this.permute(blocks[i], Permutazioni[this.block_size][this.permute_index]._p);
        }
        // rimuovo caratteri nulli
        let decrypted_M = this.encode._binario(blocks.join(''))._utf8().string();
        decrypted_M = decrypted_M.replaceAll('\x00', '');
        return decrypted_M;
    }
    /**
     * 
     * @param {*} K1 
     * @param {*} K2 
     * @param {*} IV 
     * @param {*} L numero di blocchi
     * @returns 
     */
    calculate_keys(K1, K2) {
        const keys = [[K1, K2]];
        this.recent_key = '0'.repeat(K1.length);
        // --- keys
        for (let i = 0; i < this.n_round; i++) {
            K1 = this.round_K(K1);
            K2 = this.round_K(K2);
            keys.push([K1, K2]);
        }
        return keys;
    }
    /**
     * 
     */
    calculate_indexs(K) {
        // ---
        let minimized_K = K.match(/.{1,4}/g);
        minimized_K = minimized_K[0] + minimized_K[minimized_K.length - 1];
        // ---
        const mod = parseInt(minimized_K, 2) % 4;
        this.s_box_index = mod;
        this.permute_index = mod;
        this.inverse_permute_index = 3 - mod;
    }
    /**
     * 
     */
    round(block, K, IV) {
        const [K1, K2] = K;
        let [left, right] = block;
        // ---
        left = this.permute(left, Permutazioni[this.block_size_mid][this.inverse_permute_index].p_);
        // ---
        left = this.pop(left);
        right = this.s_box(right, false);
        // ---
        right = this.xor(left, right);
        left = this.xor(left, K2);
        right = this.xor(right, K1);
        // ---
        left = this.xor(left, IV);
        // ---
        left = this.s_box(left, false);
        right = this.pop(right);
        // ---
        right = this.permute(right, Permutazioni[this.block_size_mid][this.permute_index].p_);
        // ---
        IV = this.s_box(IV, false);
        IV = this.xor(IV, this.xor(K1, K2));
        // ---
        return [[right, left], IV];
    }
    /**
     * 
     */
    reverse_round(block, K, IV) {
        const [K1, K2] = K;
        let [right, left] = block;
        // ---
        IV = this.xor(IV, this.xor(K1, K2));
        IV = this.s_box(IV, true);
        // ---
        right = this.permute(right, Permutazioni[this.block_size_mid][this.permute_index]._p);
        // ---
        right = this.shift(right);
        left = this.s_box(left, true);
        // ---
        left = this.xor(left, IV);
        // ---
        right = this.xor(right, K1);
        left = this.xor(left, K2);
        right = this.xor(left, right);
        // ---
        right = this.s_box(right, true);
        left = this.shift(left);
        // ---
        left = this.permute(left, Permutazioni[this.block_size_mid][this.inverse_permute_index]._p);
        // ---
        return [[left, right], IV];
    }
    /**
     * 
     */
    get_random_bytes(bytes = 2, to_base64 = true) {
        let random_bytes = new Uint8Array(bytes);
        window.crypto.getRandomValues(random_bytes);
        let binary_string = Array.from(random_bytes).map(byte => {
            // Converti il byte in una stringa binaria con padding a 8 bit
            return byte.toString(2).padStart(8, '0');
        }).join('');
        return to_base64 ? this.encode._binario(binary_string).base64_().string() : binary_string;
    }
    /**
     * 
     */
    shift_string(S) {
        S = S.split('');
        return S.pop() + S.join('');
    }
    /**
     * 
     */
    round_K(K) {
        // ---
        K = this.permute(K, Permutazioni[this.block_size][this.permute_index].p_);
        K = this.s_box(K, false);
        K = this.xor(K, this.recent_key);
        K = this.shift(K);
        // ---
        this.recent_key = K;
        // ---
        return K;
    }
    /**
     * 
     */
    permute(block, permutation) {
        let permute = "";
        for (let i = 0; i < permutation.length; i++) {
            permute += block[permutation[i]];
        }
        return permute;
    }
    /**
     * 
     */
    s_box(block, reverse) {
        block = block.match(/.{1,8}/g);
        for (let i = 0; i < block.length; i++) {
            const p = parseInt(block[i], 2);
            block[i] = reverse ? S_BOX_8[this.s_box_index]._s[p] : S_BOX_8[this.s_box_index].s_[p];
        }
        return block.join('');
    }
    /**
     * 
     */
    xor(block, K) {
        let xor_string = "";
        for (let i = 0; i < block.length; i++) {
            xor_string += block[i] ^ K[i];
        }
        return xor_string;
    }
    /**
     * 
     */
    not(block) {
        return block.split('').map(bit => bit === '0' ? '1' : '0').join('');
    }
    /**
     * 
     */
    shift(block) {
        block = block.match(/.{1,8}/g);
        return block.pop() + block.join('');
    }
    /**
     * 
     */
    pop(block) {
        block = block.match(/.{1,8}/g);
        const b = block.shift();
        return block.join('') + b;
    }
}

const des_64 = new DEDG(8, 64);
const des_128 = new DEDG(8, 128);

const en = new Codifica();

const M = `Ciao come stai? 👾👾`;
const K = '8BUtZwsCwVF9/xV2aUlZ8Q=='; // des.get_random_bytes(16, true)

const start_time = performance.now();
const encrypt = des_128.encrypt(M, K);
const end_time = performance.now();
const tempo_trascorso = end_time - start_time;

// const decrypt = des_128.decrypt(encrypt.M, 'sBUtZwsCwVF9/xV2aUlZ8Q==', encrypt.IV);
// const decrypt = des_128.decrypt(encrypt.M, '8BUtZwsCwVF9/xV2aUlZ8Q==', encrypt.IV);
const decrypt = des_128.decrypt(encrypt.M, K, encrypt.IV);

console.log(encrypt);
console.log(tempo_trascorso.toFixed(2) + ' ms');
console.log(decrypt);