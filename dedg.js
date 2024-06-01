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
        M = buffer.from_64_to_bytes(this.encode.utf8_(M).base64_().string());
        K = buffer.from_64_to_bytes(K);
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
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.inverse_permute_index].p_);
        }

        // ---
        return {
            M: buffer.from_bytes_to_64(this.merge_UInt8Array(blocks)),
            IV: buffer.from_bytes_to_64(IV)
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
        M = buffer.from_64_to_bytes(M);
        K = buffer.from_64_to_bytes(K);
        IV = buffer.from_64_to_bytes(IV);
        let [K1, K2] = [K.slice(0, 8), K.slice(8, 16)];

        // --- calcolo quali s_box e permutazioni utilizzare
        this.calculate_indexs(K);

        // --- suddivido in blocchi
        const blocks = this.split_and_pad_UInt8Array(M);

        // --- Ottengo le chiavi
        const keys = this.calculate_keys(K1, K2);

        // --- eseguo la permutazione finale
        for (let i = 0; i < blocks.length; i++) {
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.inverse_permute_index]._p);
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
            blocks[i] = this.permute(blocks[i], Permutazioni[16][this.permute_index]._p);
        }
        // rimuovo caratteri nulli
        let decrypted_M = buffer.from_bytes_to_64(this.merge_UInt8Array(blocks));
        try {
            decrypted_M = this.encode._base64(decrypted_M)._utf8().string();
            decrypted_M = decrypted_M.replaceAll('\x00', '');
        } catch (error) {
            decrypted_M = ':(';
        }
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
        this.recent_key = new Uint8Array([85, 85, 85, 85, 85, 85, 85, 85]);
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
        let minimized_K = new Uint8Array([K.slice(0, 1), K.slice(15, 16)]);
        // ---
        const mod = (minimized_K[0] ^ minimized_K[1]) % 4;
        this.s_box_index = mod;
        this.permute_index = mod;
        this.inverse_permute_index = 3 - mod;
    }
    /**
     * suddivide in blocchi da 128 bit aggiungendo un pad finale
     */
    split_and_pad_UInt8Array(array) {
        const block_size = this.block_size / 8;
        const block_count = Math.ceil(array.length / block_size);
        const padded_array = new Uint8Array(block_count * block_size);
        // --- copio i dati dell'originale in quello nuovo con padding
        padded_array.set(array);
        // --- creazione dei blocchi
        const blocks = [];
        for (let i = 0; i < block_count; i++) {
            blocks.push(padded_array.slice(i * block_size, (i + 1) * block_size));
        }
        // ---
        return blocks;
    }
    /**
     * unisco n array UInt8Array
     */
    merge_UInt8Array(arrays) {
        // Calcola la lunghezza totale del nuovo array
        let total_length = arrays.reduce((acc, curr) => acc + curr.length, 0);
        // Crea un nuovo Uint8Array della lunghezza totale
        let merged = new Uint8Array(total_length);
        // Copia i dati di ciascun Uint8Array nel nuovo array
        let offset = 0;
        for (let arr of arrays) {
            merged.set(arr, offset);
            offset += arr.length;
        }
        return merged;
    }
    /**
     * block => left - right
     * left  : permute > xor(K2) > xor(IV) > s_box
     * right : s_box > xor(left) > xor(K1) > permute
     */
    round(block, K, IV) {
        const [K1, K2] = K;
        let [left, right] = block;
        // ---
        left = this.permute(left, Permutazioni[8][this.inverse_permute_index].p_);
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
        return to_base64 ? buffer.from_bytes_to_64(random_bytes) : random_bytes;
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
        K = this.permute(K, Permutazioni[K.length][this.permute_index].p_);
        K = this.s_box(K, false);
        K = this.xor(K, this.recent_key);
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

const M = `Ciao come stai? 👾`;
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