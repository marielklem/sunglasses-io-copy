var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
//State holding variables
let brands = [];
let products = [];
let users = [];

// Setup state



//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

//Create a server
//Create a server
const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if(error) {
    throw error
  }
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"))

  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8"))
});

//Get all the brands
myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
})

myRouter.get('/api/brands/:id/products', function (request, response) {
  //verify that a brand exists with that ID
  let brandId = brands.find((brand) => {
    return brand.id == request.params.id
  })
  if (!brandId) {
    //if there is no brand with that ID, return a 404
    response.writeHead(404, "That brand cannot be found");
    response.end();
    return;
  } else {
    const brandProduct =  products.filter(product => {
      if (brandId.id == product.brandId) {
        return product
      }
    })
    response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
    response.end(JSON.stringify(brandProduct))
  }
})


module.exports = server