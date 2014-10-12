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
