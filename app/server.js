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
let accessTokens = [];

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

  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf8"))
});

//Get all the brands
myRouter.get('/api/brands', function (request, response) {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
})

//All products for each brand
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

//Search products call
myRouter.get('/api/products', function (request, response) {
  const myUrl = request.url
  const query = url.parse(myUrl).query
  const myQuery = queryString.parse(query)
  //convert query result to all lowercase
  const lowQuery = myQuery.query.toLowerCase()

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

//Login Call
myRouter.post('/api/login', function (request, response) {
  if (request.body.username && request.body.password) {
    let user = users.find((user)=>{
        return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful
      response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
        // Create a new token with the user value and a token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
    } else {
      // Incorrect username or password
      response.writeHead(403, "Invalid username or password");
      response.end();
      }
    } else {
    // Error for login failure
    response.writeHead(403, "Please login to view your cart");
    response.end();
    }
});

// Helper method to process access token
var getValidTokenFromRequest = function(request) {

  if (request.headers.xauth) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == request.headers.xauth;
    });
    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

//Access user's cart
myRouter.get('/api/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    //Prompt user to log in
    response.writeHead(403, "Please login to view your cart");
    response.end();
  } else {
    // Grab the cart of the logged in user
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
        response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
        response.end(JSON.stringify(user.cart));
    }
});

//Add item to users cart
myRouter.post('/api/me/cart/:productId', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    //Prompt user to log in
    response.writeHead(403, "Please login to add to your cart");
    response.end();
  } else {
    // Find the coorisponding user and product based on username and id
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    let product = products.find((product) => {
      return product.id == request.body.productId;
    });
    if (!product) {
      response.writeHead(404, Object.assign({ 'Content-Type': 'application/json' }))
      response.end(JSON.stringify("Sorry, we can't find those glasses!"))
    }


    }
  
});

module.exports = server