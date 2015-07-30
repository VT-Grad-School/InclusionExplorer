var express = require('express');
var app = express();
var http = require('http').Server(app);

// var router = express.Router();

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/Political Influence Data Visualization D3.js_files'));

var PORT = 3300;
http.listen(PORT, function() {
  console.log('listening on *:', PORT);
});