var express = require('express');
var path = require('path');
var app = express();
var ejs = require('ejs');

//require contoller for game
app.use('/game', require('./public/controllers/game'));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(8083, function() {
	console.log('listening on port 8083');
});
