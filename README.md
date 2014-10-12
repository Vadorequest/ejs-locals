# ejs-locals

## Status
This is my own library for `ejs-locals` from https://github.com/RandomEtc/ejs-locals.
The original lib is unmaintained so I have made some improvements, mostly based on what I need since I don't understand exactly how everything works there.

Anyway, if you want small edit/features I should be able to do it, just open an issue. Or better: **Make a PR**. (see **Contributing.md**)

## About
Express 3.x `layout`, `partial` and `block` template functions for the EJS template engine.

Previously also offered `include` but you should use EJS 0.8.x's own method for that now.

## Installation
`$ npm install ejs-locals --save`

*(`--save` automatically writes to your `package.json` file, tell your friends)*

## Usage
Run `node app.js` from `examples` and open `localhost:3000` to see a working example.

Given a template, `views/index.ejs`:

```

    <% layout('layouts/boilerplate') -%>
    <% script('/foo.js') -%>
    <% stylesheet('/foo.css') -%>

    <h1>Partials, include and local variables</h1>

    <b>I am the <%= what %> template</b>

    <!-- Using include will make any use of the partial function bug using relative paths. Much better to use partial actually. -->
    <% include partials/included %>

    <%- partial('partials/relative.ejs') %>
    <%- partial('/views/partials/absolute.ejs', {_basePath: _basePath}) %>

    <hr/>
    <h1>Partials with variables</h1>

    <p>Here are some muppets we know about:
        <ul>
            <%- partial('partials/muppet', muppets) %>
        </ul>
    </p>

    <%- partial('partials/extra') %>

    <hr/>
    <h1>Templates</h1>

    <%- partial('templates/box', {box_title: 'My box!', box_content: '<div><b>Box content!</b></div>'})%>

    <hr/>
    <h1>Blocks, JS and CSS</h1>

    <% block('header', "<p>I'm in the header.</p>") %>
    <% block('footer', "<p>I'm in the footer.</p>") %>

    <p class="better-than-dead">I'm red if foo.css was loaded.</p>
```

And a layout, `views/layouts/boilerplate.ejs`:

```html

    <!DOCTYPE html>
    <html>
      <head>
        <title>It's <%=who%></title>
        <%-scripts%>
        <%-stylesheets%>
      </head>
      <body>
        <header>
          <%-blocks.header%>
        </header>
        <section>
          <%-body -%>
        </section>
        <footer>
          <%-blocks.footer%>
        </footer>
      </body>
    </html>
```

When rendered by an Express 3.0 app, `app.js`:

```

    var express = require('express')
      , ejsLocals = require('../')
      , app = express()
      , path = require('path');

    // use ejs-locals for all ejs templates:
    app.engine('ejs', ejsLocals);

    // Path resolving will be using this setting to resolve paths during fallback.
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs'); // so you can render('index')

    // render 'index' into 'boilerplate':
    app.get('/',function(req, res, next){
      res.render('index', { what: 'best', who: 'me', muppets: [ 'Kermit', 'Fozzie', 'Gonzo' ], _basePath: __dirname });
    });

    /**
     * Make the /example/public folder public from the browser.
     */
    app.use(express.static(path.join(__dirname, 'public')));

    /**
     * Start the application on a specific port.
     */
    app.listen(3000);
```

You get the following result:

```html

    <!DOCTYPE html>
    <html><script type="text/javascript" src="chrome-extension://kajfghlhfkcocafkcjlajldicbikpgnp/catcher.js"><!-- script injected by Request Maker --></script><head>
        <title>It's me</title>
        <script src="/foo.js" type="text/javascript"></script><style type="text/css"></style><style type="text/css"></style>
        <link rel="stylesheet" href="/foo.css">
      </head>
      <body>
        <header>
          <p>I'm in the header.</p>
        </header>
        <section>

    <h1>Partials, include and local variables</h1>

    <b>I am the best template</b>

    <!-- Using include will make any use of the partial function bug using relative paths. Much better to use partial actually. -->
    <p>
        This content has been loaded using the <b>include</b> ejs operator. <i>Using <b>include</b> will make any use of the partial function bug using relative paths. Much better to use <b>partial()</b> actually.</i><br>

        <code>partial('partials2/absolute')</code> would fail because this file has been loaded by <b>include</b> operator.<br>
        <code>partial('/views/partials/partials2/absolute', {_basePath: _basePath})</code> works:

        </p><p style="margin-left: 20px">
        This content has been loaded from an <b>absolute</b> path, because it is not possible to load it from a relative path, gets fucked up by the use of <b>include</b>.
    </p>
    <p>
        This content has been loaded from an <b>relative</b> path.
        </p><p style="margin-left: 20px">
        This content has been loaded using the <b>include</b> ejs operator from a file loaded using the <b>partial()</b> function.
        It works fine, but we cannot load any file using <b>include</b> operator anymore using relative path, we need to use absolute to make it work.
    </p>
        <p style="margin-left: 20px">
        This content has been loaded from an <b>relative</b> path. Relative paths work fine when we don't use the <b>include</b> operator but the <b>partial()</b> function instead.
    </p>
    <p>
        This content has been loaded from an <b>absolute</b> path.
    </p>

    <hr>
    <h1>Partials with variables</h1>

        <p>Here are some muppets we know about:
            </p><ul>
                <li>Kermit</li><li>Fozzie</li><li>Gonzo</li>
            </ul>
        <p></p>

        <p>
            It's not often we iterate over the Muppets twice, but in this case it seems prudent to try from 'extras.ejs':

            </p>
                <ul>
                    <li>Kermit</li><li>Fozzie</li><li>Gonzo</li>
                </ul>
            <p>
        </p>

    <hr>
    <h1>Templates</h1>

        <div id="box_" class="box">

                <div class="header">
                        <span class="title">My box!</span>
                    <hr>
                </div>

            <div class="content">
                <div><b>Box content!</b></div>
            </div>
        </div>

    <hr>
    <h1>Blocks, JS and CSS</h1>

        <p class="better-than-dead">I'm red if foo.css was loaded.</p>    </section>
            <footer>
              <p>I'm in the footer.</p>
            </footer>

        <p>P.S. foo.js was successfully loaded</p></body></html>
```
Note, if you haven't seen it before, this example uses trailing dashes in the EJS includes to slurp trailing whitespace and generate cleaner HTML. It's not strictly necessary.


## Features

### `layout(view)`

When called anywhere inside a template, requests that the output of the current template be passed to the given view as the `body` local. Use this to specify layouts from within your template, which is recommended with Express 3.0, since the app-level layout functionality has been removed.

### `partial(name, optionsOrCollection)`

When called anywhere inside an EJS file, adds the given view to that template using the current given `optionsOrCollection`.
The usual way to use this is to pass an Array/Object as the collection argument.
The given view is then executed for each item in the Array. The item is passed into the view as a local with a name generated from the view's filename.

For example, if you do `<%-partial('thing', things)%>` then each item in the `things` Array is passed to `thing.ejs` with the name `thing`.
If you rename the template/partial, the local name of each item will correspond to the template name.

If you do `<%-partial('thing', {things: things, foo: {bar: 'bar')%>` then you will have access to `things` and `foo` from the template/partial, and `foo` would contain a `bar` key.
That's what is recommended to do most of the time, the first way is more a helper for loops.

**Note that you can precise the view engine at the end of the filename, or not, as you want. Both ways will work, unlike in the official lib. (i.e: `<%- partial('partials/relative.ejs') %>`)**

#### Load partial with absolute path
The path will be relative to your express app configuration: `app.set('views', __dirname + '/views');`, if it is not set then it will have for default:
`process.cwd() + '/views'`, so basically the folder `views` from where the application is started, better to use express!

To use the absolute way you will need to make it start by a dash (`/`).

In any case you can force the base path by doing the following: `partial('/partials/absolute', {_basePath: your_base_path})`.
Using the `_basePath` attribute you will force the base path, so if for some reason the lookup system that loads a view mess up you are able to force the path this way.
*(I don't trust it 100% yet, it works but if you got a lot of partials with the same name I would not bet that he would select the right one... Need to look into it deeply.)*.

#### Load partial with relative path
Nothing complicated here, just to `<%- partial('partials/relative') %>`

### `block(name, html)`
When called anywhere inside an EJS file, adds the given html to the named block. In the **layout** you can then do `<%-block('foo')%> to render all the html for that block.

Since this relies on javascript strings, and bypasses EJS's default escaping, **you should be very careful if you use this function with user-submitted data**.

### `script(src, parameters)`
A convenience function for `block('scripts', '<script src="src.js"></script>')` with optional type.
When called anywhere inside a template, adds a script tag with the given src/type to the scripts block.
In the layout you can then do `<%-scripts%> to output the scripts from all the child templates.

**The second parameters can also be an object.**

`<% script('/foo.js') -%>` will generate `<script src="/foo.js" type="text/javascript"></script>`
`<% script('/foo.js', {type: 'text/javascript', id: 'script-foo'}) -%>` will generate `<script src="/foo.js" type="text/javascript" id="script-foo"></script>`

### `stylesheet(href, parameters)`
A convenience function for `block('stylesheets', '<link rel="stylesheet" href="href.css" />')` with optional media type.
When called anywhere inside a template, adds a link tag for the stylesheet with the given href/media to the stylesheets block.
In the layout you can then do `<%-stylesheets%> to output the links from all the child templates.

**The second parameters can also be an object.**

`<% stylesheet('/foo.css') -%>` will generate `<link rel="stylesheet" href="/foo.css">`
`<% stylesheet('/foo.css', 'print') -%>` will generate `<link rel="stylesheet" href="/foo.css" media="print">`
`<% stylesheet('/foo.css', {type: 'text/css', id: 'stylesheet-foo'}) -%>` will generate `<link rel="stylesheet" href="/foo.css" type="text/css" id="stylesheet-foo">`

## Template Support
  - `ejs` (actually hard coded right now, but feel free to __fork and help!__)

## TODO
 **See TODO.md**

## Running Tests
To run the test suite first invoke the following command within the repo, installing the development dependencies:
`$ npm install -d`

then run the tests:
`$ npm test`

## Backwards Compatibility
Express 2.0 had similar functionality built in, using `{ layout: 'view' }` as an argument to  `res.render` but this has been removed in Express 3.0. If you want the old behavior you should do:

    app.locals({
      _layoutFile: true
    })

And/or pass `_layoutFile: true` in the options when you call `res.render(...)`.

## Whither Include? - *NOT RECOMMENDED*
Previous versions of this library had an `include` function. This is now supported directly by EJS, albeit with a different syntax. For `ejs-locals` 1.0+ simply do:

`<% include path/view %>`

When called anywhere inside a template, this adds the given view to that template using the current options and locals. This is built-in to [EJS](https://github.com/visionmedia/ejs) 0.8+.

**I warn you here, know that every file loaded through `include` will not be able to load files using the `partial()` function with relative path,
it is just broken. Since `include` belongs to EJS and `partials` belongs to `ejs-locals` they are NOT friendly.
If you want to test it, there are tests in my `example`, just read them and figure it out by yourself.
Anyway `include` isn't as useful as `partial` so I won't bother anymore.**

## Credits
This library is a fork from [ejs-locals](https://github.com/RandomEtc/ejs-locals) which is unmaintained.
