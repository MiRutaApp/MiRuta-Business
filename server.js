var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.set('views', path.join(__dirname, "/views/"));
app.set('view engine', 'ejs');
app.use("/", express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/*', function (req, res) {
    res.render("index");
});

app.listen(80, function () {
    console.log("corriendo el server");
});