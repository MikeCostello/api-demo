var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;
var token, uid, fpid;

// Tests
describe('/Posts', function() {
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

  // Get all visible posts
  it('success posts owner and followed', function(done) {
    api.get('/Posts/')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var posts = res.body;

      posts.should.be.an('array').with.length(4);

      posts.forEach(function(post) {
        post.should.have.property('message');
        post.should.have.property('owner');
        post.should.have.property('id');
        post.should.have.property('createdAt');

        if (post.owner != uid) {
          fpid = post.id;
        }
      });

      done();
    });
  });

  context('Create & Delete posts', function() {
    var postData = { message: 'testing...' };

    it('success create post', function(done) {
      api.post('/Posts')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(postData)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var post = res.body;

        post.should.be.an('object');
        post.should.have.property('message').and.is.equal(postData.message);
        post.should.have.property('owner').and.is.equal(uid);
        post.should.have.property('id');

        postData.id = post.id;

        done();
      });
    });

    // Get specific post
    it('success get specific post', function(done) {
      api.get('/Posts/' + postData.id)
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var post = res.body;

        post.should.be.an('object');
        post.should.have.property('message').and.is.equal(postData.message);
        post.should.have.property('owner').and.is.equal(uid);
        post.should.have.property('id').and.is.equal(postData.id);

        done();
      });
    });

    // Delete specific post
    it('success removes specific post', function(done) {
      api.delete('/Posts/' + postData.id)
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send()
      .expect('Content-Type', /json/)
      .expect(200, { count: 1 }, done);
    });
  });

  // Delete unowned post
  it('error removes unowned post', function(done) {
    api.delete('/Posts/' + fpid)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(401, done);
  });


});