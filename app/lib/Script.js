///<reference path='./../lib/def/defLoader.d.ts'/>
var block = require('./Block');

var Script = (function () {
    function Script() {
        /**
        * Contains the a block of html strings.
        * @type {Block}
        */
        this.block = new block.Block();
    }
    /**
    * A convenience function for `block('scripts', '<script src="src.js"></script>')` with optional type.
    * When called anywhere inside a template, adds a script tag with the given src/type to the scripts block.
    * In the layout you can then do `<%-scripts%> to output the scripts from all the child templates.
    * This function in bound to the scripts Block from the `renderFile` function.
    *
    * @param path
    * @param type
    * @return {Script}
    */
    Script.prototype.script = function (path, type) {
        if (typeof type === "undefined") { type = 'text/javascript'; }
        if (path) {
            this.block.append('<script src="' + path + '"' + type + '></script>');
        }
        return this;
    };
    return Script;
})();
exports.Script = Script;
