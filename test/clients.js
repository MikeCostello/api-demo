var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;
var token, uid;

// Tests
describe('/Clients', function() {
  // Set auth token
  before(function(done) {
    api.post('/Clients/login')
      .set('Accept', 'application/json')
      .send(creds)
      .end(function(err, res) {
        token = res.body.id;
        uid = res.body.userId;

        done();
      });
  });

  // Get all clients
  it('success all clients are returned', function(done) {
    api.get('/Clients')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var cleints = res.body;

      cleints.should.be.an('array').with.length(5);
      cleints[0].should.have.property('username');
      cleints[0].should.have.property('id');
      cleints[0].should.not.have.property('password');

      done();
    });
  });

  // Get one client
  it('success single a cleint is returned', function(done) {
    api.get('/Clients/' + uid)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var client = res.body;

      client.should.be.an('object');
      client.should.have.property('username');
      client.should.have.property('id');
      client.should.not.have.property('password');

      done();
    });
  });

  // Get unauthorized client
  it('error if trying to get other client', function(done) {
    api.get('/Clients/' + (uid + 1))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

  // Update password
  it('success if same uid returned', function(done) {
    api.put('/Clients/' + uid)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send({ password: creds.password })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect({
      id: uid,
      username: creds.username
    }, done);
  });

  // Update someone else's password
  it('error if trying to set another password', function(done) {
    api.put('/Clients/' + (uid + 1))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send({ password: creds.password })
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

  context('create & delete client', function() {
    var uid2, token2;

    // Create client
    it('success new client is created', function(done) {
      api.post('/Clients')
      .set('Accept', 'application/json')
      .send({ username: creds.username + '2', password: creds.password })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var client = res.body;

        client.should.be.an('object');
        client.should.have.property('username');
        client.should.have.property('id');
        client.should.not.have.property('password');

        uid2 = client.id;

        done();
      });
    });

    context('', function() {
      // Get auth token2
      before(function(done) {
        api.post('/Clients/login')
          .set('Accept', 'application/json')
          .send({ username: creds.username + '2', password: creds.password })
          .end(function(err, res) {

            token2 = res.body.id;

            done();
          });
      });

      // Remove client
      it('success new client is removed', function(done) {
        api.delete('/Clients/' + uid2)
        .set('Accept', 'application/json')
        .set('Authorization', token2)
        .send()
        .expect('Content-Type', /json/)
        .expect(200, { count: 1 }, done);
      });
    });

    // Remove unowned client
    it('error if removing another client', function(done) {
      api.delete('/Clients/' + (uid + 1))
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send()
      .expect('Content-Type', /json/)
      .expect(401, done);
    });

  });

});
