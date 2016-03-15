
var async = require('async');
var keyBy = require('lodash/keyBy');

module.exports = function(app) {
  var now = new Date();
  var day = 1000 * 60 * 60 * 24;

  // Create users first
  async.parallel({
    clients: async.apply(createClients)
  }, function(err, results) {
    if (err) throw err;
    console.log('> clients created successfully');

    // Re-key by username for easier selection
    var clients = keyBy(results.clients, 'username');

    async.waterfall([
      async.apply(createPosts, clients),
      createComments
    ], function(err, results) {
      if (err) throw err;
    });

    // Create follow relationships
    createFollows(clients, function(err) {
      if (err) throw err;
      console.log('> follows created successfully');
    });
  });

  function createClients(cb) {
    app.dataSources.db.automigrate('Client', function(err) {
      if (err) return cb(err);

      app.models.Client.create([
        { username: "demo",  password: '1234' },
        { username: "Chris O'Toodles", password: '1234' },
        { username: "Jason Shamrock", password: '1234' },
        { username: "Matt MacKnuckles", password: '1234' },
        { username: "Mike McMuffin", password: '1234' },
      ], cb);
    });
  }

  function createPosts(clients, cb) {
    app.dataSources.db.automigrate('Post', function(err) {
      if (err) return cb(err);

      app.models.Post.create([
        { owner: clients['demo'].id, createdAt: now, message: "Looking for a lass who likes long walks under the rainbow" },
        { owner: clients["Chris O'Toodles"].id, createdAt: now - day, message: "Irish I was a wee bit taller" },
        { owner: clients['Jason Shamrock'].id, createdAt: now - 2*day, message: "Is it ok to wear green after St. Patrick's Day?" },
        { owner: clients["Matt MacKnuckles"].id, createdAt: now - 3*day, message: "Rock on Leprechaun" },
      ], function(err, posts) {
        if (err) throw err;
        console.log('> posts created successfully');
        cb(null, clients, posts);
      });
    });
  }

  function createComments(clients, posts, cb) {
    app.dataSources.db.automigrate('Comment', function(err) {
      if (err) return cb(err);

      app.models.Comment.create([
        { owner: clients["Chris O'Toodles"].id, postId: posts[0].id, message: "My cousin is a bridge troll" },
        { owner: clients["demo"].id,  postId: posts[0].id, message: "...never again" },

        { owner: clients["Matt MacKnuckles"].id, postId: posts[1].id, message: "I wish I was a baller" },
        { owner: clients["demo"].id, postId: posts[1].id, message: "I wish I had a girl who looked good, I would call her" },

        { owner: clients["Chris O'Toodles"].id, postId: posts[2].id, message: "I hope so... everything I own is green" },
        { owner: clients["Jason Shamrock"].id, postId: posts[2].id, message: "(ツ)" },

        { owner: clients["demo"].id, postId: posts[3].id, message: "Bengal Pot O'Gold playing tonight?" },
        { owner: clients["Matt MacKnuckles"].id, postId: posts[3].id, message: "No costumes this time, I promise" },

      ], function(err, comments) {
        if (err) return cb(err);

        console.log('> comments created successfully');
        cb();
      });
    });
  }

  function createFollows(clients, cb) {
    app.dataSources.db.automigrate('Follow', function(err) {
      if (err) return cb(err);

      app.models.Follow.create([
        { followerId: clients["demo"].id, followeeId: clients["Chris O'Toodles"].id },
        { followerId: clients["demo"].id, followeeId: clients["Jason Shamrock"].id },
        { followerId: clients["demo"].id, followeeId: clients["Matt MacKnuckles"].id },
        { followerId: clients["Mike McMuffin"].id, followeeId: clients["demo"].id },
      ], cb);
    });
  }

};
