///<reference path='./../lib/def/defLoader.d.ts'/>

import block = require('./Block');

export class Stylesheet {

    /**
     * Contains the a block of html strings.
     * @type {Block}
     */
    public block = new block.Block();

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
    public stylesheet(path, media = '') {
        if (path) {
            this.block.append('<link rel="stylesheet" href="' + path + '"' + media + ' />');
        }
        return this;
    }
}