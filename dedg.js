class DEDG {
    /**
     * 
     * @param {Int} n_round numero di round da eseguire dopo la prima schermatura
     * @param {Int} block_size grandezza dei blocchi in bit
     */
    constructor(n_round = 8) {
        this.encode = new Codifica();
        this.n_round = n_round;
        // ---
        this.recent_key = '';
        this.recent_iv = '';
        this.footprint_K = [new Uint8Array(8), new Uint8Array(8)];
        // ---
        this.block_size = 16; // in byte
        this.iv_size = 8; // in byte
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
        M = encoder.base64.bytes_(this.encode.utf8_(M).base64_().string());
        K = encoder.base64.bytes_(K);
        let IV = this.get_random_bytes(this.iv_size, false);
        let [K1, K2] = [K.slice(0, 8), K.slice(8, 16)];

        // --- calcolo quali s_box e permutazioni utilizzare
        this.calculate_indexs(K);

        // --- suddivido in blocchi
        const blocks = this.split_and_pad_UInt8Array(M);

        // --- ottengo le chiavi e i vettori
        const keys = this.calculate_keys(K1, K2);

        // --- eseguo la prima schermatura
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.permute_index].p_);
            blocks[i] = this.xor(blocks[i], this.footprint_K);
            blocks[i] = [blocks[i].slice(0, 8), blocks[i].slice(8, 16)];
        }

        // --- eseguo i round
        for (let r = 0; r < this.n_round; r++) {
            for (let i = 0; i < blocks.length; i++) {
                [blocks[i], IV] = this.round(blocks[i], keys[r], IV, i);
            }
        }

        // --- eseguo la schermatura finale
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.merge_UInt8Array(blocks[i]);
            blocks[i] = this.xor(blocks[i], this.footprint_K);
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.inverse_permute_index].p_);
        }

        // ---
        return {
            M: encoder.base64._bytes(this.merge_UInt8Array(blocks)),
            IV: encoder.base64._bytes(IV)
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
        M = encoder.base64.bytes_(M);
        K = encoder.base64.bytes_(K);
        IV = encoder.base64.bytes_(IV);
        let [K1, K2] = [K.slice(0, 8), K.slice(8, 16)];

        // --- calcolo quali s_box e permutazioni utilizzare
        this.calculate_indexs(K);

        // --- suddivido in blocchi
        const blocks = this.split_and_pad_UInt8Array(M);

        // --- Ottengo le chiavi
        const keys = this.calculate_keys(K1, K2);

        // --- eseguo la schermatura finale
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.inverse_permute_index]._p);
            blocks[i] = this.xor(blocks[i], this.footprint_K);
            blocks[i] = [blocks[i].slice(0, 8), blocks[i].slice(8, 16)];
        }

        // --- eseguo i round
        for (let r = this.n_round - 1; r >= 0; r--) {
            for (let i = blocks.length - 1; i >= 0; i--) {
                [blocks[i], IV] = this.reverse_round(blocks[i], keys[r], IV, i);
            }
        }

        // --- Eseguo la permutazione inversa
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.merge_UInt8Array(blocks[i]);
            blocks[i] = this.xor(blocks[i], this.footprint_K);
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.permute_index]._p);
        }
        // rimuovo caratteri nulli
        return new TextDecoder().decode(this.merge_UInt8Array(blocks)).replaceAll('\x00', '');
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
        const keys = new Array(this.n_round);
        keys[0] = [K1, K2];
        this.footprint_K = [K1, K2];
        this.recent_key = new Uint8Array([85, 85, 85, 85, 85, 85, 85, 85]);
        // --- keys
        for (let i = 1; i < this.n_round; i++) {
            K1 = this.round_K(K1, i);
            K2 = this.round_K(K2, i);
            // ---
            this.footprint_K[0] = this.xor(this.footprint_K[0], K1);
            this.footprint_K[1] = this.xor(this.footprint_K[1], K2);
            // ---
            keys[i] = [K1, K2];
        }
        this.footprint_K = this.merge_UInt8Array(this.footprint_K);
        return keys;
    }
    /**
     * 
     */
    calculate_indexs(K) {
        // ---
        let m_K = new Uint8Array([K[0], K[15], K[7], K[8]]);
        // ---
        const mod = (m_K[0] ^ m_K[1] ^ m_K[2] ^ m_K[3]) % 8;
        this.s_box_index = mod;
        this.permute_index = mod;
        this.inverse_permute_index = 7 - mod;
    }
    /**
     * suddivide in blocchi da 128 bit aggiungendo un pad finale
     */
    split_and_pad_UInt8Array(array) {
        const block_count = Math.ceil(array.length / this.block_size);
        const padded_array = new Uint8Array(block_count * this.block_size);
        // --- copio i dati dell'originale in quello nuovo con padding
        padded_array.set(array);
        // --- creazione dei blocchi
        const blocks = [];
        for (let i = 0; i < block_count; i++) {
            blocks.push(padded_array.slice(i * this.block_size, (i + 1) * this.block_size));
        }
        // ---
        return blocks;
    }
    /**
     * unisco n array UInt8Array
     */
    merge_UInt8Array(arrays) {
        // --- len totale
        let total_length = arrays.reduce((acc, curr) => acc + curr.length, 0);
        // --- nuovo array di lunghezza tot_len
        let merged = new Uint8Array(total_length);
        // --- per ogni array, copio tutti i dati
        let offset = 0;
        for (let arr of arrays) {
            merged.set(arr, offset);
            offset += arr.length;
        }
        return merged;
    }
    /**
     * block => left - right
     * left  : permute > shift > xor(K2) > xor(IV) > s_box
     * right : s_box > xor(left) > xor(K1) > shift > permute
     */
    round(block, K, IV) {
        const [K1, K2] = K;
        let [left, right] = block;
        // ---
        left = this.permute(left, Permutazioni[8][this.inverse_permute_index].p_);
        left = this.shift(left);
        // ---
        right = this.s_box(right, false);
        // ---
        right = this.xor(left, right);
        left = this.xor(left, K2);
        right = this.xor(right, K1);
        // ---
        left = this.xor(left, IV);
        // ---
        left = this.s_box(left, false);
        // ---
        right = this.shift(right);
        right = this.permute(right, Permutazioni[8][this.permute_index].p_);
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
        right = this.permute(right, Permutazioni[8][this.permute_index]._p);
        right = this.unshift(right);
        // ---
        left = this.s_box(left, true);
        // ---
        left = this.xor(left, IV);
        // ---
        right = this.xor(right, K1);
        left = this.xor(left, K2);
        right = this.xor(left, right);
        // ---
        right = this.s_box(right, true);
        // ---
        left = this.unshift(left);
        left = this.permute(left, Permutazioni[8][this.inverse_permute_index]._p);
        // ---
        return [[left, right], IV];
    }
    /**
     * 
     */
    get_random_bytes(bytes = 2, to_base64 = true) {
        let random_bytes = new Uint8Array(bytes);
        window.crypto.getRandomValues(random_bytes);
        return to_base64 ? encoder.base64._bytes(random_bytes) : random_bytes;
    }
    /**
     * 
     */
    round_K(K, i) {
        // ---
        const p = i % 2 == 0 ? this.permute_index : this.inverse_permute_index;
        K = this.permute(K, Permutazioni[K.length][p].p_);
        K = this.unshift(K);
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
    permute(array, perm_table) {
        let result = new Uint8Array(perm_table.length);
        // ---
        for (let i = 0; i < perm_table.length; i++) {
            result[i] = array[perm_table[i]];
        }
        // ---
        return result;
    }
    /**
     * 
     */
    s_box(block, reverse) {
        for (let i = 0; i < block.length; i++) {
            block[i] = reverse ?
                S_BOX_8[this.s_box_index]._s[block[i]] :
                S_BOX_8[this.s_box_index].s_[block[i]];
        }
        return block;
    }
    /**
     * 
     */
    xor(arr_1, arr_2) {
        if (arr_1.length !== arr_2.length) {
            throw new Error('Gli array devono avere la stessa dimensione');
        }
        // ---
        let result = new Uint8Array(arr_1.length);
        // ---
        for (let i = 0; i < arr_1.length; i++) {
            result[i] = arr_1[i] ^ arr_2[i];
        }
        // ---
        return result;
    }
    /**
     * 
     */
    shift(block) {
        // ---
        const first = block[0];
        const shifted = new Uint8Array(block.length);
        // ---
        shifted.set(block.slice(1), 0);
        // ---
        shifted[shifted.length - 1] = first;
        return shifted;
    }
    /**
     * 
     */
    unshift(block) {
        // ---
        const last = block[block.length - 1];
        const unshifted = new Uint8Array(block.length);
        // ---
        unshifted.set(block.slice(0, block.length - 1), 1);
        // ---
        unshifted[0] = last;
        return unshifted;
    }
    /**
     * 
     */
    footprint(blocks_array) {
        let footprint = new Uint8Array(blocks_array[0]);
        for (let i = 0; i < blocks_array.length - 1; i++) {
            footprint = this.xor(footprint, blocks_array[i + 1]);
        }
        return footprint;
    }
}

const des = new DEDG(8);
const en = new Codifica();

// const M = `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`; // 256 bit
const M = 'Ciao, stasera sushi? 🍣🍣'
const K = 'SEZgf1Q6KmFdrt38F9tkqg=='; // des.get_random_bytes(16, true)

const start_time = performance.now();
const encrypt = des.encrypt(M, K);
const end_time = performance.now();
const tempo_trascorso = end_time - start_time;

// const decrypt = des.decrypt(encrypt.M, 'SEZgf1Q6KmFdrt38F9tkqw==', encrypt.IV);
const decrypt = des.decrypt(encrypt.M, K, encrypt.IV);

console.log(encrypt);
console.log(tempo_trascorso.toFixed(2) + ' ms');
console.log(decrypt);