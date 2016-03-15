var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;
var followeeId = 5;
var token, uid;

// Tests
describe('/Clients/{id}/folllow(ers|ing)', function() {
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

  // Get Followers
  it('success all followers are returned', function(done) {
    api.get('/Clients/' + uid + '/followers')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var cleints = res.body;

      cleints.should.be.an('array').with.length(1);
      cleints[0].should.have.property('username');
      cleints[0].should.have.property('id');
      cleints[0].should.not.have.property('password');

      done();
    });
  });

  // Get Following
  it('success all following are returned', function(done) {
    api.get('/Clients/' + uid + '/following')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var cleints = res.body;

      cleints.should.be.an('array').with.length(3);
      cleints[0].should.have.property('username');
      cleints[0].should.have.property('id');
      cleints[0].should.not.have.property('password');

      done();
    });
  });

  // Follow someone
  it('success is new follow someone', function(done) {
    api.put('/Clients/' + uid + '/following/rel/' + followeeId)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var follow = res.body;

      follow.should.be.an('object');
      follow.should.have.property('followerId').and.is.equal(uid);
      follow.should.have.property('followeeId').and.is.equal(followeeId);

      done();
    });
  });

  // UNfollow someone
  it('success is unfollow someone', function(done) {
    api.delete('/Clients/' + uid + '/following/rel/' + followeeId)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(204, done);
  });

  // Follow non-existant user
  it('error is followee not found', function(done) {
    api.put('/Clients/' + uid + '/following/rel/' + followeeId + '00')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(404, done);
  });


  // Follow on behalf of
  it('error is cannot follow on behalf of', function(done) {
    api.put('/Clients/' + (uid + 1) + '/following/rel/' + followeeId)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

  // UNfollow on behalf of
  it('error is cannot unfollow on behalf of', function(done) {
    api.delete('/Clients/' + (uid + 1) + '/following/rel/' + followeeId)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

});