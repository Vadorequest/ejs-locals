# ejs-locals

## Table of contents
- [Status](#status): What the current status of the library is?
- [About](#about): What the library is made for?
- [Features summary](#summary-of-the-features-added-to-the-original-ejs-locals): What features are available that aren't in the original `ejs-locals`?
- [Installation](#installation): How to install the library?
- [Proper setup](#proper-setup): How to properly setup absolute path finding?
- [Usage](#usage): How to use the lib? With examples.
- [Features](#features): Deep explanation of the features.
    - [layout](#layoutview)
    - [partial](#partialname-optionsorcollection)
    - [block](#blockname-html)
    - [script](#scriptsrc-parameters)
    - [stylesheet](#stylesheethref-parameters)
- [Debug](#debug-support): Tips and explanation about how to debug.
- [Specific attributes](#specific-attributes): Specific attributes used by the library that you should be aware about.
- [Template support](#template-support): Node.js template engine supported.
- [Tests](#running-tests): How to run the tests?
- [Backwards compatibility](#backwards-compatibility): A small talk about backward compatibility.
- [`Include` or `partial`?](#using-include-over-partial): Why using `include` is **bad** and will give you headaches.
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Credits](#credits)
- [License](#license)


## Status
This is my own library that replaces `ejs-locals` from https://github.com/RandomEtc/ejs-locals.
The original lib is unmaintained so I have made some improvements, mostly based on what I need since I don't understand exactly how everything works there.

Anyway, if you want small edit/features I should be able to do it, just open an issue.

Or better: **Make a PR**. (see **Contributing.md**)


## About
Express 3.x `layout`, `partial` and `block` template functions for the **EJS template engine**.

Previously also offered `include` but you should use EJS 0.8.x's own method for that now. **And you shouldn't the use of `include` and `partial` because of bugs, just use `partial`, read more at [`Include` or `partial`?](#contributing)**

**Note:** This library is backward compatible with the original `ejs-locals`. You can just change it in your program and everything should work just fine.


## Summary of the features added to the original *ejs-locals*
- Absolute paths based on *Express views* or *custom* configuration.
- When a `partial` call fails, show the stacks of tried paths so you can figure out what's wrong.
- When a `partial` call success, show the loaded partial and every single tried paths so you can makes sure it loads the right one. *(not possible to disable this yet)*
- Optional argument for `script` and `stylesheet` helpers to generate html properties with default values.

*Features are explained [below](#features), if you believe it lacks of documentation please open an issue.*


## Installation
`$ npm install ejs-locals-vadorequest --save`

*(`--save` automatically writes to your `package.json` file, tell your friends)*

### Proper setup
If you want to use a smart and reusable `absolute path`, here is how **it should be done**.

#### Using Express.js
**This is the smarter solution.** Just set the following when setting your `express` application: `app.set('views', __dirname + '/views')` even if I guess that's already done!

Every use of absolute path (I.e: `partial('/partials/absolute')` will take the `views` folder as root.

#### Without Express.js
If you're not using Express, then you could set when you're rendering a view the following: `res.render('index', { _basePath: __dirname });`,
it would be shared across every partial loaded by the view and you would not need to precise the `_basePath` while calling `partial()`.

Of course this can be a *pain in the ass* if you need to change every call to `res.render`, I myself don't,
I prefer to use the **Express** configuration and when I can't I have a bunch of default values bound in every view dynamically, so I don't even have to think about it.


## Usage
Run `node app.js` from `examples` folder and open `localhost:3000` to see a working example.

Given a template, `views/index.ejs`:

```js

    <% layout('layouts/boilerplate') -%>
    <% script('/foo.js') -%>
    <% stylesheet('/foo.css') -%>

    <h1>Partials, include and local variables</h1>

    <b>I am the <%= what %> template</b>

    <!-- Using include will make any use of the partial function bug using relative paths. Much better to use partial actually. -->
    <% include partials/included %>

    <%- partial('partials/relative', {text: "Loaded using: <code>partial('partials/relative.ejs')</code>"}) %>
    <%- partial('/partials/absolute.ejs', {text: "Loaded using: <code>partial('/partials/absolute.ejs')</code>. Used <b>Express</b> configuration to find the view."}) %>
    <%- partial('/partials/absolute', {text: "Loaded using: <code>partial('/partials/absolute')</code>. Used <b>Express</b> configuration to find the view."}) %>
    <%- partial('/views/partials/absolute.ejs', {text: "Loaded using: <code>partial('/views/partials/absolute.ejs', {_basePath: base})</code>. Used <b><code>_basePath</code></b> value to find the view.", _basePath: base}) %>

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

```js

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
      // The fact that we send _basePath from here, it will be bound automatically to each call to `partial`, not useful to specify it again. But possible to override it to set a custom _basePath for a specific call.
      res.render('index', { what: 'best', who: 'me', muppets: [ 'Kermit', 'Fozzie', 'Gonzo' ], base: __dirname });
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

You get the following result: (See [Picture](rendered.png))


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

##### Resolve *absolute* file order
There is a specific order while trying to resolve a path using the `partial` function. Here is the description taking as example the following `partial('/partials/absolute')` from the file `c:\wamp\www\ejs-locals\example\index.ejs`:

1. `c:\wamp\www\ejs-locals\example\partials\absolute.ejs` (not tested) (would be tested only if `_basePath` is **bind** to the view (in `locals._basePath`), or when calling the `partial` function like: `partial('/partials/absolute', {_basePath: your_base_path)`)
2. `c:\wamp\www\ejs-locals\example\views\partials\absolute.ejs` (succeed)
3. `c:\partials\_absolute.ejs` (not tested) fallback relative
4. `c:\partials\absolute.ejs` (not tested) fallback relative
5. `c:\partials\absolute\index.ejs` (not tested) fallback relative

As you can see, the **fallback** here isn't really useful. I actually don't know if I should improve it or not, and I don't know how to. It's kinda hard to fallback from absolute to relative and I'm afraid the program would be wrong most of the time actually.

So, probably better this way, or completely remove fallback from absolute to relative paths. *Feel free to guide me here.*


#### Load partial with relative path
Nothing complicated here, just to `<%- partial('partials/relative') %>`

##### Resolve *relative* file order
There is a specific order while trying to resolve a path using the `partial` function. Here is the description taking as example the following `partial('partials/relative')` from the file `c:\wamp\www\ejs-locals\example\index.ejs`:

1. `c:\wamp\www\ejs-locals\example\views\partials\_relative.ejs` (failed)
2. `c:\wamp\www\ejs-locals\example\views\partials\relative.ejs` (succeed)
3. `c:\wamp\www\ejs-locals\example\views\partials\relative/index.ejs` (not tested) (a file was found already)


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


## Debug support
In order to help developers using this library I have made a couple of changes:

- Every successful partial found is written in the server console as `log`. If I can understand that it could be boring due to a lot of views loaded,
I prefer doing so for the moment so we are able to see if the file loaded is the one we want to, especially now that I don't trust the lookup system 100%.
Feel free to make a PR with some kind of settings to disable it, I didn't get any idea other than checking the `environment` but I would like to have log in production too,
I don't think that's the best way. We need something independent, not related to the env.
- When a file to load fails to be found, all paths tested are now displayed in the server console as `error`.


## Specific attributes
*This list is probably not complete, I didn't run into every case but I will detail here all the specific attributes that you **should not use***.

1. While rendering a view:
    - locals._layoutFile: Used to set the layout to use. Set to false to disable.
    - locals.body: Contains the content of a view when used in a layout. If you override this, you're gonna regret it. https://github.com/RandomEtc/ejs-locals/issues/22
2. While loading a partial `partial(view, options)`
    - options.cache: I'm not sure what it is, seems that we can enable/disable the cache on a specific partial.
    I read somewhere that it was enabled in production. Anyway, I would recommend to avoid using this key, excepted if you understand what it does.


## Template Support
  - `ejs` (actually hard coded right now, but feel free to __fork and help!__)


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


## Using `include` over `partial`?
Previous versions of this library had an `include` function. This is now supported directly by EJS, albeit with a different syntax. For `ejs-locals` 1.0+ simply do:

`<% include path/view %>`

When called anywhere inside a template, this adds the given view to that template using the current options and locals. This is built-in to [EJS](https://github.com/visionmedia/ejs) 0.8+.

**I warn you here, know that every file loaded through `include` will not be able to load files using the `partial()` function with relative path,
it is just broken *(path resolve fails)*. Since `include` belongs to EJS and `partials` belongs to `ejs-locals` they are NOT friendly.
If you want to test it, there are tests in my `example`, just read them and figure it out by yourself.
Anyway `include` isn't as useful as `partial` so I won't bother anymore.**


## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).


## Roadmap
See [ROADMAP.md](ROADMAP.md).


## Credits
This library is a fork from [ejs-locals](https://github.com/RandomEtc/ejs-locals) which is unmaintained.


## License
See [LICENSE.md](LICENSE.md).