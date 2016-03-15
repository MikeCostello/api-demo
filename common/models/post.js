var assign = require('lodash/assign');

module.exports = function(Post) {

  // Hide remote methods
  Post.disableRemoteMethod('upsert', true);
  Post.disableRemoteMethod('updateAttributes', false); 
  Post.disableRemoteMethod('__get__client', false);
  Post.disableRemoteMethod('__delete__comments', false);
  Post.disableRemoteMethod('__updateById__comments', false);

  // Sanitize new posts
  Post.beforeRemote('create', function(ctx, post, next) {
    var req = ctx.req;

    // Remove atempts to manually set id
    delete ctx.args.data.id;

    // Set new post's owner to current user
    req.body.owner = req.accessToken.userId;
    next();
  });

  // Sanitize new comments
  Post.beforeRemote('prototype.__create__comments', function(ctx, comment, next) {
    var req = ctx.req;

    // Remove atempts to manually set id
    ctx.args.data.unsetAttribute('id');

    // Set new comment's owner to current user
    ctx.args.data.owner = req.accessToken.userId;

    next();
  });

  // Prevent ownership changes
  Post.observe('before save', function filterProperties(ctx, next) {
    if (!ctx.isNewInstance && ctx.data.owner) {
       delete ctx.data.owner;
    }

    next();
  });

  // Only allow comment owners to destroy
  Post.beforeRemote('prototype.__destroyById__comments', function(ctx, comment, next) {
    var app = Post.app;
    var req = ctx.req;
    var clientId = req.accessToken.userId;
    var commentId = ctx.args.fk;

    var Comment = app.models.Comment;
    Comment.findOne({
        where: { id: commentId }
      }, function(err, comment) {
        if (err) return next(err);

        // No comment found
        if (!comment) {
          var err = new Error('Comment not found: ' + commentId);
          err.statusCode = 404;

          return next(err);
        }

        //  Not the comment's owner
        if (comment.$owner !== clientId) {
          var err = new Error('Authorization Required');
          err.statusCode = 401;
          err.code = 'AUTHORIZATION_REQUIRED';

          return next(err);
        }

        next();
    });
  });

  // Filter posts to own and following
  Post.beforeRemote('find', function(ctx, post, next) {
    var app = Post.app;
    var req = ctx.req;
    var clientId = req.accessToken.userId;

    var Follow = app.models.Follow;
    Follow.find({
      where: { followerId: clientId },
      fields: 'followeeId'
    }, function(err, following) {
      if (err || !following) throw err;

      var ownerIds = [clientId];
      following.forEach(function(model) {
        ownerIds.push(model.followeeId);
      });

      var filter = {};
      if (ctx.args.filter) {
        try { filter = JSON.parse(ctx.args.filter); }
        catch (e) {}
      }

      if (!filter.where || filter.where.owner !== clientId) {
        filter = assign(filter, { where: { owner: { inq: ownerIds }}});
      }

      ctx.args.filter = JSON.stringify(filter);

      next();
    });
  });

  Post.afterRemote('deleteById', function(ctx, result, next) {
    var app = Post.app;
    var postId = ctx.args.id;

    if (result.count > 0) {
      var Comment = app.models.Comment;
      Comment.destroyAll({ postId: postId }, function(err, result) {
        if (err) return next(err);

        next();
      });
    } else {
      next();
    }
  });

};
