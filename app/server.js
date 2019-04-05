var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
//set holding variables
var brands = [],
var products = [],
var users = []

//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//Create a server
http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  fs.readFile("/initial-data/brands.json", "utf8", (err, data) => {
    brands = JSON.parse(data)
  });

  fs.readFile("/initial-data/products", "utf8", (err, data) => {
    products = JSON.parse(data)
  });

  fs.readFile("/initial-data/users", "utf8", (err, data) => {
    users = JSON.parse(data)
  })
});