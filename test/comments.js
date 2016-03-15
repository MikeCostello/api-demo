var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;
var pid = 1;
var token, uid, fcid;

// Tests
describe('/Posts/{id}/comments', function() {
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

  //Get post comments
  it('success get post comments', function(done) {
    api.get('/Posts/1/comments')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var comments = res.body;

      comments.should.be.an('array').with.length(2);

      comments.forEach(function(comment) {
        comment.should.have.property('message');
        comment.should.have.property('owner');
        comment.should.have.property('id');
        comment.should.have.property('postId');
        comment.should.have.property('createdAt');

        if (comment.owner !== uid) {
          fcid = comment.id;
        }

      });

      done();
    });
  });

  //Get post comments count
  it('success get post comments count', function(done) {
    api.get('/Posts/1/comments/count')
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200, { count: 2 }, done)
  });

  context('Create & Delete comments', function() {
    var commentData = { message: 'testing...' };

    it('success create comment', function(done) {
      api.post('/Posts/' + pid + '/comments')
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send(commentData)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var comment = res.body;

        comment.should.be.an('object');
        comment.should.have.property('message').and.is.equal(commentData.message);
        comment.should.have.property('owner').and.is.equal(uid);
        comment.should.have.property('postId').and.is.equal(pid);
        comment.should.have.property('id');

        commentData.id = comment.id;

        done();
      });
    });

    // Get specific comment

    it('success get specific comment', function(done) {
      api.get('/Posts/' + pid + '/comments/' + commentData.id)
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send()
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        var comment = res.body;

        comment.should.be.an('object');
        comment.should.have.property('message').and.is.equal(commentData.message);
        comment.should.have.property('owner').and.is.equal(uid);
        comment.should.have.property('postId').and.is.equal(pid);
        comment.should.have.property('id').and.is.equal(commentData.id);

        done();
      });
    });

    // Delete specific comment
    it('success removes specific comment', function(done) {
      api.delete('/Posts/' + pid + '/comments/' + commentData.id)
      .set('Accept', 'application/json')
      .set('Authorization', token)
      .send()
      .expect('Content-Type', /json/)
      .expect(204, done);
    });

  });

  // Delete unowned post
  it('error removes unowned post', function(done) {
    api.delete('/Posts/' + pid + '/comments/' + fcid)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(401, done);
  });

});