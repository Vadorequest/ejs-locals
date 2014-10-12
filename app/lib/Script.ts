///<reference path='./../lib/def/defLoader.d.ts'/>

import block = require('./Block');

export class Script {

    /**
     * Contains the a block of html strings.
     * @type {Block}
     */
    public block = new block.Block();

    /**
     * A convenience function for `block('scripts', '<script src="src.js"></script>')` with optional type.
     * When called anywhere inside a template, adds a script tag with the given src/type to the scripts block.
     * In the layout you can then do `<%-scripts%> to output the scripts from all the child templates.
     * This function in bound to the scripts Block from the `renderFile` function.
     *
     * @param path          Path of the file.
     * @param attributes    If string, must contains the type, if object then wrap all attributes. [text/javascript]
     * @return {Script}
     */
    public script(path, attributes: any = 'text/javascript') {
        if (path) {
            var text = '<script src="'+path+'"';
            if (typeof attributes == 'string' && attributes !== '') {
                text += ' type="'+attributes+'"';
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