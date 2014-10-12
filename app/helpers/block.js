///<reference path='./../lib/def/defLoader.d.ts'/>
var _block = require('./../lib/Block');

/**
* Return the block with the given name, create it if necessary.
* Optionally append the given html to the block.
*
* The returned Block can append, prepend or replace the block,
* as well as render it when included in a parent template.
*
* @param  {String} name
* @param  {String} html
* @return {Block}
* @api private
*/
block = function (name, html) {
    // bound to the blocks object in renderFile
    var blk = this[name];
    if (!blk) {
        // always create, so if we request a
        // non-existent block we'll get a new one
        blk = this[name] = new _block.Block();
    }
    if (html) {
        blk.append(html);
    }
    return blk;
};
