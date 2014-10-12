///<reference path='./../lib/def/defLoader.d.ts'/>

declare var layout;

/**
 * Apply the given `view` as the layout for the current template,
 * using the current options/locals. The current template will be
 * supplied to the given `view` as `body`, along with any `blocks`
 * added by child templates.
 *
 * `options` are bound  to `this` in renderFile, you just call
 * `layout('myview')`
 *
 * @param  {String} view
 * @api private
 */
layout = function(view){
    this.locals._layoutFile = view;
};