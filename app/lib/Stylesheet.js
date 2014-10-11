///<reference path='./../lib/def/defLoader.d.ts'/>
var block = require('./Block');

var Stylesheet = (function () {
    function Stylesheet() {
        /**
        * Contains the a block of html strings.
        * @type {Block}
        */
        this.block = new block.Block();
    }
    /**
    * A convenience function for `block('stylesheets', '<link rel="stylesheet" href="href.css" />')` with optional media type.
    * When called anywhere inside a template, adds a link tag for the stylesheet with the given href/media to the stylesheets block.
    * In the layout you can then do `<%-stylesheets%> to output the links from all the child templates.
    * This function in bound to the stylesheets Block from the `renderFile` function.
    *
    * @param path
    * @param media
    * @return {stylesheet}
    */
    Stylesheet.prototype.stylesheet = function (path, media) {
        if (typeof media === "undefined") { media = ''; }
        if (path) {
            this.block.append('<link rel="stylesheet" href="' + path + '"' + media + ' />');
        }
        return this;
    };
    return Stylesheet;
})();
exports.Stylesheet = Stylesheet;
