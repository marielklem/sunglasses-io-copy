var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var url = require('url')
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

myRouter.get('/api/products', function (request, response) {
  const myUrl = request.url
  const query = url.parse(myUrl).query
  const myQuery = queryString.parse(query)
  //convert query result to all lowercase
  const lowQuery = myQuery.query.toLowerCase()
  console.log(lowQuery)
  //if no search parameters, return an error
  if (lowQuery === "") {
    response.writeHead(400, "Please enter a valid search criteria");
    response.end();
  } else {
   
    //search products for query that matches name of product
    const searchResults =  products.filter(product => {
      //convert product name to lowercase
      const name = product.name.toLowerCase()
      if (name.includes(lowQuery)) {
        return product
      }
    })
    //if no results are found, send string back with message
    if (searchResults.length === 0) {
      response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
      response.end(JSON.stringify("Sorry, no glasses match that search request"))
    } else {
      response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
      response.end(JSON.stringify(searchResults))
    }
  }
})

module.exports = server