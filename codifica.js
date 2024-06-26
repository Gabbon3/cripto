class Codifica {
    constructor(data) {
        this.data = data;
    }

    utf8_(data) {
        data = data || this.data;
        this.data = unescape(encodeURIComponent(data.toString()));
        return this;
    }

    base64_(data) {
        data = data || this.data;
        this.data = btoa(data.toString());
        return this;
    }

    hex_(data) {
        data = data || this.data;
        if (typeof data === 'number') {
            data = data.toString(16);
        } else {
            data = Array.from(data, (char) => char.charCodeAt(0).toString(16)).join('');
        }
        this.data = data;
        return this;
    }

    binario_(data) {
        data = data || this.data;
        if (typeof data === 'number') {
            data = data.toString(2);
        } else {
            data = Array.from(data, (char) => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
        }
        this.data = data;
        return this;
    }
    /**
     * ----------------------------------------------------------------
     */
    _utf8(data) {
        data = data || this.data;
        this.data = decodeURIComponent(escape(data.toString()));
        return this;
    }

    _base64(data) {
        data = data || this.data;
        this.data = atob(data.toString());
        return this;
    }

    _hex(data) {
        data = data || this.data;
        this.data = data.match(/.{1,2}/g).map((byte) => String.fromCharCode(parseInt(byte, 16))).join('');
        return this;
    }

    _binario(data) {
        data = data || this.data;
        this.data = data.match(/.{8}/g).map((byte) => String.fromCharCode(parseInt(byte, 2))).join('');
        return this;
    }

    string() {
        return this.data;
    }

    /**
     * -------------------------
     * Specifici
     * -------------------------
     */
    
    array_buffer_to_base64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    base64_to_array_buffer(base64) {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
};

const buffer = {
    bytes_() {
        
    }
}