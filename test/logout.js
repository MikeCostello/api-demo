var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;
var token;

var missingTokenRes = {
  "error": {
    "name": "Error",
    "status": 500,
    "message": "could not find accessToken"
  }
}

// Tests
describe('/Clients/logout', function() {

  it('error if missing api-token', function(done) {
    api.post('/Clients/logout')
    .set('Accept', 'application/json')
    .send()
    .expect(500)
    .expect('Content-Type', /json/)
    .expect(missingTokenRes, done);
  });

  context('/Clients/logout AUTH', function() {

    before(function(done) {
      api.post('/Clients/login')
        .set('Accept', 'application/json')
        .send(creds)
        .end(function(err, res) {
          token = res.body.id;

          done();
        });
    });

    it('success if logged out', function(done) {
      api.post('/Clients/logout')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send()
      .expect(204, done);
    });
  });

});
