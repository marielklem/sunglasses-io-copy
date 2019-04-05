let chai = require('chai')
let { expect } = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

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
    })
  })
})

