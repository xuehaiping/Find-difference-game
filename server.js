var express = require('express');
var app = express();

app.use(express.static('public'));
app.listen(8083, function() {
	console.log('listening on port 8083');
});
