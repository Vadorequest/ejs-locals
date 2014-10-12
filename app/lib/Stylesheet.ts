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
     * @param path          Path of the file.
     * @param attributes    If string, must contains the media, if object then wrap all attributes. [text/javascript]
     * @return {stylesheet}
     */
    public stylesheet(path, attributes: any = '') {
        if (path) {
            var text = '<link rel="stylesheet" href="'+path+'"';
            if (typeof attributes == 'string' && attributes !== '') {
                text += ' media="'+attributes+'"';
            } else if (typeof attributes == 'object'){
                for (var attr in attributes) {
                    text += ' ' + attr + '="' + attributes[attr] + '"';
                }
            }
            text += '></script>';
            this.block.append(text);
        }
        return this;
    }
}