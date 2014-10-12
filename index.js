var ejs = require('ejs')
  , fs = require('fs')
  , path = require('path')
  , exists = fs.existsSync || path.existsSync
  , resolve = path.resolve
  , extname = path.extname
  , dirname = path.dirname
  , join = path.join
  , basename = path.basename
  , Block = require('./app/lib/Block').Block
  , Stylesheet = require('./app/lib/Stylesheet').Stylesheet
  , stylesheet = new Stylesheet().stylesheet
  , Script = require('./app/lib/Script').Script
  , script = new Script().script;

/**
 * Load helpers.
 */
require('./app/helpers/block');
require('./app/helpers/layout');

/**
 * Express 3.x Layout & Partial support for EJS.
 *
 * The `partial` feature from Express 2.x is back as a template engine,
 * along with support for `layout` and `block/script/stylesheet`.
 *
 *
 * Example index.ejs:
 *
 *   <% layout('boilerplate') %>
 *   <h1>I am the <%=what%> template</h1>
 *   <% script('foo.js') %>
 *
 *
 * Example boilerplate.ejs:
 *
 *   <html>
 *     <head>
 *       <title>It's <%=who%></title>
 *       <%-scripts%>
 *     </head>
 *     <body><%-body%></body>
 *   </html>
 *
 *
 * Sample app:
 *
 *    var express = require('express')
 *      , app = express();
 *
 *    // use ejs-locals for all ejs templates:
 *    app.engine('ejs', require('ejs-locals'));
 *
 *    // render 'index' into 'boilerplate':
 *    app.get('/',function(req,res,next){
 *      res.render('index', { what: 'best', who: 'me' });
 *    });
 *
 *    app.listen(3000);
 *
 * Example output for GET /:
 *
 *   <html>
 *     <head>
 *       <title>It's me</title>
 *       <script src="foo.js"></script>
 *     </head>
 *     <body><h1>I am the best template</h1></body>
 *   </html>
 *
 */
var renderFile = module.exports = function(file, options, fn){

  // Express used to set options.locals for us, but now we do it ourselves
  // (EJS does some __proto__ magic to expose these funcs/values in the template)
  if (!options.locals) {
    options.locals = {};
  }

  if (!options.locals.blocks) {
    // one set of blocks no matter how often we recurse
    var blocks = { scripts: new Script(), stylesheets: new Stylesheet() };
    options.locals.blocks = blocks;
    options.locals.scripts = blocks.scripts.block;
    options.locals.stylesheets = blocks.stylesheets.block;
    options.locals.block = block.bind(blocks);
    options.locals.stylesheet = stylesheet.bind(blocks.stylesheets);
    options.locals.script = script.bind(blocks.scripts);
    options.locals._settings = options.settings;
  }

  // override locals for layout/partial bound to current options
  options.locals.layout  = layout.bind(options);
  options.locals.partial = partial.bind(options);

  ejs.renderFile(file, options, function(err, html) {

    if (err) {
      // TODO Improve exceptions?
      return fn(err,html);
    }

    var layout = options.locals._layoutFile;

    // for backward-compatibility, allow options to
    // set a default layout file for the view or the app
    // (NB:- not called `layout` any more so it doesn't
    // conflict with the layout() function)
    if (layout === undefined) {
      layout = options._layoutFile;
    }

    if (layout) {

      if(!options || !options.settings){
        options.settings = {};
      }

      // use default extension
      var engine = options.settings['view engine'] ? options.settings['view engine'] : 'ejs',
        desiredExt = '.'+engine;

      // apply default layout if only "true" was set
      if (layout === true) {
        layout = path.sep + 'layout' + desiredExt;
      }
      if (extname(layout) !== desiredExt) {
        layout += desiredExt;
      }

      // clear to make sure we don't recurse forever (layouts can be nested)
      delete options.locals._layoutFile;
      delete options._layoutFile;

      // make sure caching works inside ejs.renderFile/render
      delete options.filename;

      if (layout.length > 0 && layout[0] === path.sep) {
        // if layout is an absolute path, find it relative to view options:
        layout = join(_getDefaultLoadPath(options), layout.slice(1));
      } else {
        // otherwise, find layout path relative to current template:
        layout = resolve(dirname(file), layout);
      }

      // now recurse and use the current result as `body` in the layout:
      options.locals.body = html;
      renderFile(layout, options, fn);
    } else {
      // no layout, just do the default:
      fn(null, html);
    }
  });

};

/**
 * Memory cache for resolved object names.
 */
var cache = {};

/**
 * Resolve partial object name from the view path.
 *
 * Examples:
 *
 *   "user.ejs" becomes "user"
 *   "forum thread.ejs" becomes "forumThread"
 *   "forum/thread/post.ejs" becomes "post"
 *   "blog-post.ejs" becomes "blogPost"
 *
 * @return {String}
 * @api private
 */
function resolveObjectName(view){
  return cache[view] || (cache[view] = view
    .split('/')
    .slice(-1)[0]
    .split('.')[0]
    .replace(/^_/, '')
    .replace(/[^a-zA-Z0-9 ]+/g, ' ')
    .split(/ +/).map(function(word, i){
      return i ? word[0].toUpperCase() + word.substr(1) : word;
    }).join(''));
}

/**
 * Lookup partial path from base path of current template:
 *
 *   - partial `_<name>`
 *   - any `<name>/index`
 *   - non-layout `../<name>/index`
 *   - any `<root>/<name>`
 *   - partial `<root>/_<name>`
 *
 * Options:
 *
 *   - `cache` store the resolved path for the view, to avoid disk I/O
 *
 * @param {String} root       full base path of calling template
 * @param {String} partial    name of the partial to lookup (can be a relative path)
 * @param {Object} options    for `options.cache` behavior
 * @return {String}
 * @api private
 */
function lookup(root, partial, options){
  var engine = options.settings['view engine'] || 'ejs'
    , desiredExt = '.' + engine
    , ext = extname(partial) || desiredExt
    , key = [ root, options._basePath ? options._basePath : '', partial, ext ].join('-');

  if (options.cache && cache[key]) return cache[key];

  // Make sure we use dirname in case of relative partials
  // ex: for partial('../user') look for /path/to/root/../user.ejs
  var dir = dirname(partial)
    , base = basename(partial, ext);

  // Clean the dir if it's not a real dir, it messes up the path.resolve.
  if(dir == '/'){
    dir = '';
  }

  // Delete any eventual extension equal to the view engine extension to makes sure that even a file loaded using "partial('foo.ejs')" works.
  partial = (path.dirname(partial) !== '/' ? path.dirname(partial) + '/' : '/') + path.basename(partial, ext);

  /**
   * Try to resolve different kind of paths.
   * Try absolute if partial name starts with "/" then fallback to different relative ways.
   */

  // If the first char of the partial path is a slash (/) then try to load the file using the absolute mode.
  if(partial.substr(0, 1) == '/'){
    // Delete the first character, it is required just to know if we should load an absolute path but would mess up the fall back with relative path if we don't remove it..
    partial = partial.substr(1);

    var file;

    // Try to resolve using options._basePath, if set. Allows to override any kind of config, in case the path lookup wouldn't take the expected one.
    if(options._basePath){
      if(_fileExists(partial, file = resolve(options._basePath, partial + ext), 'absolute(_basePath)')){
        return options.cache ? cache[key] = file : file
      }
    }

    // Try to resolve using default config.
    if(_fileExists(partial, file = resolve(_getDefaultLoadPath(options), partial + ext), 'absolute(default)')){
      return options.cache ? cache[key] = file : file
    }
  }

  // filename is set by ejs engine
  var relativeRoot = dirname(options.filename);

  // Try relative partial with "_". Takes precedence over the direct path
  // ex: for partial('user') look for /root/user.ejs
  if(_fileExists(partial, file = resolve(relativeRoot, dir, '_' + base + ext), 'relative(_)')) {
    return options.cache ? cache[key] = file : file
  }

  // Try relative
  // ex: for partial('user') look for /root/user.ejs
  if(_fileExists(partial, file = resolve(relativeRoot, dir, base + ext), 'relative(default)')) {
    return options.cache ? cache[key] = file : file
  }

  // Try relative index
  // ex: for partial('user') look for /root/user/index.ejs, but only if there is not /root/user.ejs
  if(_fileExists(partial, file = resolve(relativeRoot, dir, base, 'index' + ext), 'relative(index)')) {
    return options.cache ? cache[key] = file : file
  }

  // FIXME:
  // * there are other path types that Express 2.0 used to support but
  //   the structure of the lookup involved View class methods that we
  //   don't have access to any more
  // * we probaly need to pass the Express app's views folder path into
  //   this function if we want to support finding partials relative to
  //   it as well as relative to the current view
  // * we have no tests for finding partials that aren't relative to
  //   the calling view

  return null;
}

/**
 * Used to store and display paths that have been tried while lookup for a file.
 */
var partialUnresolvedPaths = new Array();

/**
 * Render `view` partial with the given `options`. Optionally a
 * callback `fn(err, str)` may be passed instead of writing to
 * the socket.
 *
 * Options:
 *
 *   - `object` Single object with name derived from the view (unless `as` is present)
 *
 *   - `as` Variable name for each `collection` value, defaults to the view name.
 *     * as: 'something' will add the `something` local variable
 *     * as: this will use the collection value as the template context
 *     * as: global will merge the collection value's properties with `locals`
 *
 *   - `collection` Array of objects, the name is derived from the view name itself.
 *     For example _video.html_ will have a object _video_ available to it.
 *
 * @param  {String} view
 * @param  {Object|Array} options   collection or object
 * @return {String}
 * @api private
 */
function partial(view, options){
  var collection
    , object
    , locals
    , name;

  // Reset the partialUnresolvedPaths array.
  partialUnresolvedPaths = new Array();

  // parse options
  if( options ){
    // collection
    if( options.collection ){
      collection = options.collection;
      delete options.collection;

    } else if( 'length' in options ){
      collection = options;
      options = {};
    }

    // locals
    if( options.locals ){
      locals = options.locals;
      delete options.locals;
    }

    // object
    if( 'Object' != options.constructor.name ){
      object = options;
      options = {};

    } else if( options.object !== undefined ){
      object = options.object;
      delete options.object;
    }
  } else {
    options = {};
  }

  if(!options.settings){
    options.settings = {};
  }

  // merge locals into options
  if( locals )
    options.__proto__ = locals;

  // merge app locals into options
  for(var k in this)
    options[k] = options[k] || this[k];

  // extract object name from view
  name = options.as || resolveObjectName(view);

  // find view, relative to this filename
  var root = _getDefaultLoadPath(options)
    , file = lookup(root, view, options)
    , key = file + ':string';

  // File not found. Display debug help.
  if( !file ){
    /**
     * Display all paths that have been tried.
     */

    console.error('Could not find partial"' + view + '"\nSearched for the following paths:');

    for(var i in partialUnresolvedPaths){
      console.error('------>"' + partialUnresolvedPaths[i].file + '" [' + partialUnresolvedPaths[i].type + ']');
    }

    // Terminate process.
    throw new Error('Could not find partial"' + view + '"');
  }else{
    for(var i in partialUnresolvedPaths){
      console.log('------>"' + partialUnresolvedPaths[i].file + '" [' + partialUnresolvedPaths[i].type + '] was tried but not found.');
    }
  }

  // read view
  var source = options.cache
    ? cache[key] || (cache[key] = fs.readFileSync(file, 'utf8'))
    : fs.readFileSync(file, 'utf8');

  options.filename = file;

  // re-bind partial for relative partial paths
  options.partial = partial.bind(options);

  // render partial
  function render(){
    if (object) {
      if ('string' == typeof name) {
        options[name] = object;
      } else if (name === global) {
        // wtf?
        // merge(options, object);
      }
    }
    // TODO Support other templates (but it's sync now...)
    var html = ejs.render(source, options);
    return html;
  }

  // Collection support
  if (collection) {
    var len = collection.length
      , buf = ''
      , keys
      , prop
      , val
      , i;

    if ('number' == typeof len || Array.isArray(collection)) {
      options.collectionLength = len;
      for (i = 0; i < len; ++i) {
        val = collection[i];
        options.firstInCollection = i === 0;
        options.indexInCollection = i;
        options.lastInCollection = i === len - 1;
        object = val;
        buf += render();
      }
    } else {
      keys = Object.keys(collection);
      len = keys.length;
      options.collectionLength = len;
      options.collectionKeys = keys;

      for (i = 0; i < len; ++i) {
        prop = keys[i];
        val = collection[prop];
        options.keyInCollection = prop;
        options.firstInCollection = i === 0;
        options.indexInCollection = i;
        options.lastInCollection = i === len - 1;
        object = val;
        buf += render();
      }
    }

    return buf;
  } else {
    return render();
  }
}

/**
 * Retrieve the default path used by the application views.
 * Either the app.set('views', __dirname + '/views'); hs been set, or we fallback using our own:"process.cwd() + '/views'".
 *
 * @param options
 * @return {*|string}
 * @private
 */
function _getDefaultLoadPath(options){
  return options._settings.views || process.cwd() + '/views';
}

/**
 * Check if the file exists. If it does, log it. If it doesn't add the path to the array of unresolved paths.
 *
 * @param partial   Partial path sent.
 * @param file      Partial path tested.
 * @param type      Type of the test. (absolute, relative, ...)
 * @return {*}
 * @private
 */
function _fileExists(partial, file, type){
  if (exists(file)){
    console.log('"'+partial+'" found at "'+file+'" ['+type+']');
    return true;
  }

  partialUnresolvedPaths.push({
    type: type,
    file: file
  });

  return false;
}