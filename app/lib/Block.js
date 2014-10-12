///<reference path='./../lib/def/defLoader.d.ts'/>
var Block = (function () {
    function Block() {
        this.html = new Array();
    }
    /**
    * Convert HTML to string.
    * @return {string}
    */
    Block.prototype.toString = function () {
        return this.html.join('\n');
    };

    /**
    * Append a new HTML block.
    * @param more
    */
    Block.prototype.append = function (more) {
        this.html.push(more);
    };

    /**
    * Prepend an HTML block, so it's like append it but at the beginning of the array.
    * @param more
    */
    Block.prototype.prepend = function (more) {
        this.html.unshift(more);
    };

    /**
    * Replace the whole HTML block by a new array.
    * @param instead
    */
    Block.prototype.replace = function (instead) {
        this.html = [instead];
    };
    return Block;
})();
exports.Block = Block;
