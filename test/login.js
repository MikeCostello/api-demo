var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;

var loginFailedRes = {
  error: {
    name: 'Error',
    status: 401,
    message: 'login failed',
    statusCode: 401,
    code: 'LOGIN_FAILED'
  }
};

var usernameReqRes = {
  error: {
    name: 'Error',
    status: 400,
    message: 'username or email is required',
    statusCode: 400,
    code: 'USERNAME_EMAIL_REQUIRED'
  }
}

// Tests
describe('/Clients/login', function() {

  it('success if api-token', function(done) {
    api.post('/Clients/login')
    .set('Accept', 'application/json')
    .send(creds)
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);

      res.body.should.have.property('id').with.length(64);

      done();
    });
  });

  it('errors if invalid credentials', function(done) {
    var _creds = Object.assign({}, creds, { password: 'invalid' });

    api.post('/Clients/login')
    .set('Accept', 'application/json')
    .send(_creds)
    .expect(401)
    .expect('Content-Type', /json/)
    .expect(loginFailedRes, done);
  });

  it('errors if username missing', function(done) {
    var _creds = Object.assign({}, creds);
    delete _creds.username;

    api.post('/Clients/login')
    .set('Accept', 'application/json')
    .send(_creds)
    .expect(400)
    .expect('Content-Type', /json/)
    .expect(usernameReqRes, done);
  });

});


