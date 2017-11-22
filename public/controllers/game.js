var express = require('express');
var router = express.Router();
var ejs = require('ejs');
//require for parsing json
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });

//handles post request for starting the game
router.post('/', urlencodedParser, function(req, res) {
	console.log(req.body);
  res.render('game', {image:"heart"});
});

module.exports = router;
