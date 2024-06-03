/**
 * Mescola un array n volte utilizzando il metodo di Fisher Yates
 * @param {Int} n default 1
 */
Array.prototype.shuffle = function (n = 1) {
    if (n < 1) throw new Error('Non puoi mescolare l\'array ' + n + ' volte');
    for (let i = this.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let k = this[i];
        this[i] = this[j];
        this[j] = k;
    }
}
