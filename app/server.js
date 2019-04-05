var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
//State holding variables
let brands = [];
let products = [];
let users = [];

//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//Create a server
const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if(error) {
    throw error
  }
  fs.readFile("initial-data/brands.json", "utf8", (err, data) => {
    brands = JSON.parse(data)
  });
});

//Get all the brands
myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, Object.assign({'Content-Type': 'application/json'}))
  response.end(JSON.stringify(brands))
})


module.exports = server