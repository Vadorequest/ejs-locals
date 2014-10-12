///<reference path='./../lib/def/defLoader.d.ts'/>

export class Block {
    public html: any = new Array();

    /**
     * Convert HTML to string.
     * @return {string}
     */
    public toString() {
        return this.html.join('\n');
    }

    /**
     * Append a new HTML block.
     * @param more
     */
    public append(more) {
        this.html.push(more);
    }

    /**
     * Prepend an HTML block, so it's like append it but at the beginning of the array.
     * @param more
     */
    public prepend(more) {
        this.html.unshift(more);
    }

    /**
     * Replace the whole HTML block by a new array.
     * @param instead
     */
    public replace(instead) {
        this.html = [ instead ];
    }
}