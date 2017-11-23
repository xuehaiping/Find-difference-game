var express = require('express');
var router = express.Router();
var ejs = require('ejs');
//require for parsing json
var bodyParser = require('body-parser');

router.use( bodyParser.json() );       // to support JSON-encoded bodies
router.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

router.use(express.json());       // to support JSON-encoded bodies
router.use(express.urlencoded({
  extended: true
})); // to support URL-encoded bodies

//handles post request for starting the game
router.post('/', function(req, res) {
	console.log(req.body.image);
  res.render('game', {image:req.body.image});
});

module.exports = router;
