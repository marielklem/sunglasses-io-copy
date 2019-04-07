let chai = require('chai')
let { expect } = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

chai.use(chaiHttp);



describe('The API', () => {
  let token = ''
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      //act
      chai
        .request(server)
        .get('/api/brands')
        // assert
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.lengthOf(5);
          done();
        });
    });
  });

  describe('/GET api/brands/:id/products', () => {
    it('it should send an error if no id was selected', done => {
      chai
        .request(server)
        .get('/api/brands/99/products')
        // assert
        .end((error, response) => {
          expect(response).to.have.status(404);
          done();
        });
    })
  it('it should GET all the products for a specific brand', done => {
    //act
    chai
      .request(server)
      .get('/api/brands/2/products')
      // assert
      .end((error, response) => {
        expect(response.body).to.be.an('array');
        expect(response.body).to.have.lengthOf(2);
        done();
      });
    })
  })
  describe('/GET products', () => {
    it('it should have a query parameter', done => {
      //act
      chai
        .request(server)
        .get('/api/products?query=')
        // assert
        .end((error, response) => {
          expect(response).to.have.status(400);
          done();
        });
    });
    it('it should return a product based on name', done => {
      //act
      chai
        .request(server)
        .get('/api/products?query=Sugar')
        // assert
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.an('array');
          expect(response.body).to.have.lengthOf(1);
          done();
        });
    });
    it('it should return a result regardless of case', done => {
      //act
      chai
        .request(server)
        .get('/api/products?query=SUGAR')
        // assert
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.lengthOf(1);
          done();
        });
    });
    it('if no results match, it should return a string', done => {
      //act
      chai
        .request(server)
        .get('/api/products?query=Avocado')
        // assert
        .end((error, response) => {
          expect(response.body).to.be.an('string');
          done();
        });
    });  
  });
  describe('/POST login', () => {
    it('it should have a username and password in the request', done => {
      //act
      chai
        .request(server)
        .post('/api/login')
        .send({username: '', password: ''})
        // assert
        .end((error, response) => {
          expect(response).to.have.status(403);
          done();
        });
    })
    it('it should return an error if incorrect user or incorrect password', done => {
      //act
      chai
        .request(server)
        .post('/api/login')
        .send({username: 'lazywolf342', password: 'sleepywolf'})
        // assert
        .end((error, response) => {
          expect(response).to.have.status(403);
          done();
        });
    })
    it('if a username and password match a current user it should assign an access token ', done => {
      //act
      chai
        .request(server)
        .post('/api/login')
        .send({username: 'lazywolf342', password: 'tucker'})
        // assert
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.have.lengthOf(16);
          accessToken = response.body
          done();
        });
    })
  });
  describe('GET Cart', () => {
    it('user should be logged in to view cart', done => {
        //act
      chai
        .request(server)
        .get('/api/me/cart')
        // assert
        .end((error, response) => {
          expect(response).to.have.status(403);
          done();
        });
    });
    it('should return all items in cart', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .set('xauth', accessToken)
        // assert
        .end((error, response) => {
          expect(response).to.have.status(200);
          done();
        });
      });
  })
  describe('Add product to cart', () => {
    it('user should be logged in to add to cart', done => {
      //act
    chai
      .request(server)
      .post('/api/me/cart/:productId')
      // assert
      .end((error, response) => {
        expect(response).to.have.status(403);
        done();
      });
    });
    it('should return error if no product exists', done => {
      //act
    chai
      .request(server)
      .post('/api/me/cart/99')
      .set('xauth', accessToken)
      // assert
      .end((error, response) => {
        expect(response).to.have.status(404);
        done();
      });
    });
    it('should update the cart with new product', done => {
      //act
    chai
      .request(server)
      .post('/api/me/cart/7')
      .set('xauth', accessToken)
      // assert
      .end((error, response) => {
        expect(response).to.have.status(200);
        expect(response.body.cart[0].name).to.contain('QDogs Glasses')
        done();
      });
    });
  })
})