var express = require('express')
  , ejsLocals = require('../')
  , app = express()
  , path = require('path');

// use ejs-locals for all ejs templates:
app.engine('ejs', ejsLocals);

app.set('views',__dirname + '/views');
app.set('view engine', 'ejs'); // so you can render('index')

// render 'index' into 'boilerplate':
app.get('/',function(req, res, next){
  res.render('index', { what: 'best', who: 'me', muppets: [ 'Kermit', 'Fozzie', 'Gonzo' ] });
});

/**
 * Make the /example/public folder public from the browser.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Start the application on a specific port.
 */
app.listen(3000);
