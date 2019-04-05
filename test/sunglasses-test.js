let chai = require('chai')
let { expect } = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);

describe('The API', () => {
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


