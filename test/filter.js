var should = require('chai').should();
var supertest = require('supertest');
var config = require('../server/config.local.js');

var api = supertest(config.url);

var creds = config.demoCredentials;
var token, uid;

var filters = {
  limit: {
    limit: 1
  },
  offset: {
    offset: 1
  },
  order: {
    order: 'id DESC'
  },
  where: {
    where: {
      id: uid
    }
  },
  include: {
    include: 'posts'
  },
  fields: {
    fields: 'username'
  }
}

// Tests
describe('?filters=', function() {
  // Set auth token
  before(function(done) {
    api.post('/Clients/login')
      .set('Accept', 'application/json')
      .send(creds)
      .end(function(err, res) {
        token = res.body.id;
        uid = res.body.userId;
        filters.where.where.id = uid;

        done();
      });
  });

  // Get single client
  it('success single client', function(done) {
    api.get('/Clients?filter=' + JSON.stringify(filters.limit))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var clients = res.body;

      clients.should.be.an('array').with.length(1);

      done();
    });
  });

  // Get 2nd client
  it('success single 2nd client', function(done) {
    api.get('/Clients?filter=' + JSON.stringify(filters.offset))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var clients = res.body;

      clients.should.be.an('array');
      clients[0].id.should.equal(2);

      done();
    });
  });

  // Get sort clients
  it('success sorted clients', function(done) {
    api.get('/Clients?filter=' + JSON.stringify(filters.order))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var clients = res.body;

      clients.should.be.an('array');
      clients.reduce(function(preClient, client) {
        if (preClient) {
          client.id.should.be.at.most(preClient.id);
        }

        return client;
      });

      done();
    });
  });

  // Get queried clients
  it('success queried client', function(done) {
    api.get('/Clients?filter=' + JSON.stringify(filters.where))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var clients = res.body;

      clients.should.be.an('array').with.length(1);
      clients[0].username.should.equal(creds.username);

      done();
    });
  });

  // Include following posts
  it('success include posts', function(done) {
    api.get('/Clients/' + uid + '/following?filter=' + JSON.stringify(filters.include))
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .send()
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function(err, res) {
      if (err) return done(err);

      var clients = res.body;

      clients.should.be.an('array');
      clients.forEach(function(client) {
        client.posts.should.be.an('array');
      });

      done();
    });
  });

  // Include following posts
  it('success limit fields', function(done) {
    api.get('/Clients/' + uid + '?filter=' + JSON.stringify(filters.fields))
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
      client.should.not.have.property('id');

      done();
    });
  });


});