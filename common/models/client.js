module.exports = function(Client) {

  // Disable remote methods
  var isStatic = true;

  Client.disableRemoteMethod('confirm', isStatic);
  Client.disableRemoteMethod('count', isStatic);
  Client.disableRemoteMethod('createChangeStream', isStatic);
  Client.disableRemoteMethod('exists', isStatic);
  Client.disableRemoteMethod('findOne', isStatic);
  Client.disableRemoteMethod('resetPassword', isStatic);
  Client.disableRemoteMethod('updateAll', isStatic);
  Client.disableRemoteMethod('upsert', isStatic);

  isStatic = false;
  Client.disableRemoteMethod('__count__accessTokens', isStatic);
  Client.disableRemoteMethod('__create__accessTokens', isStatic);
  Client.disableRemoteMethod('__delete__accessTokens', isStatic);
  Client.disableRemoteMethod('__destroyById__accessTokens', isStatic);
  Client.disableRemoteMethod('__findById__accessTokens', isStatic);
  Client.disableRemoteMethod('__get__accessTokens', isStatic);
  Client.disableRemoteMethod('__updateById__accessTokens', isStatic);

  Client.disableRemoteMethod('__count__posts', isStatic);
  Client.disableRemoteMethod('__create__posts', isStatic);
  Client.disableRemoteMethod('__delete__posts', isStatic);
  Client.disableRemoteMethod('__destroyById__posts', isStatic);
  Client.disableRemoteMethod('__findById__posts', isStatic);
  Client.disableRemoteMethod('__get__posts', isStatic);
  Client.disableRemoteMethod('__updateById__posts', isStatic);

  Client.disableRemoteMethod('__count__followers', isStatic);
  Client.disableRemoteMethod('__create__followers', isStatic);
  Client.disableRemoteMethod('__delete__followers', isStatic);
  Client.disableRemoteMethod('__destroyById__followers', isStatic);
  Client.disableRemoteMethod('__exists__followers', isStatic);
  Client.disableRemoteMethod('__findById__followers', isStatic);
  Client.disableRemoteMethod('__link__followers', isStatic);
  Client.disableRemoteMethod('__unlink__followers', isStatic);
  Client.disableRemoteMethod('__updateById__followers', isStatic);

  Client.disableRemoteMethod('__count__following', isStatic);
  Client.disableRemoteMethod('__create__following', isStatic);
  Client.disableRemoteMethod('__delete__following', isStatic);
  Client.disableRemoteMethod('__destroyById__following', isStatic);
  Client.disableRemoteMethod('__exists__following', isStatic);
  Client.disableRemoteMethod('__findById__following', isStatic);
  Client.disableRemoteMethod('__updateById__following', isStatic);

  // Remove User class validation on Email
  delete Client.validations.email;

  // Force case insensitivity on username property
  // Client.setter.username = function(value) {
  //   this.$username = value.toLowerCase();
  // };

  // Client.observe('access', function normalizeUsernameCase(ctx, next) {
  //   if (ctx.query.where && ctx.query.where.username) {
  //     ctx.query.where.username = ctx.query.where.username.toLowerCase();
  //   }
  //   next();
  // });

  // Remove includes filter
  Client.beforeRemote('find', function(ctx, client, next) {
    if (ctx.args.filter) {
      var filter = {};
      try { filter = JSON.parse(ctx.args.filter); }
      catch(e) {}

      delete filter.include;

      ctx.args.filter = JSON.stringify(filter);
    }

    next();
  });

  // Validate followee exists on PUT /Clients/{id}/following/rel/{fk}
  Client.beforeRemote('prototype.__link__following', function(ctx, client, next) {
    var followeeId = ctx.args.fk;
    var followerId = ctx.ctorArgs.id;

    // You can't follow yourself
    if (followeeId === followerId) {
      var err = new Error('Invalid id and fk parameters are the same');
      err.statusCode = 400;
      err.code = 'USER_IS_SELF';

      return next(err);
    }

    // Make sure user exists
    Client.exists(followeeId, function(err, exists) {
      if (err) return next(err);

      if (!exists) {
        var err = new Error('User not found: ' + followeeId);
        err.statusCode = 404;
        err.code = 'USER_NOT_FOUND';

        return next(err);
      }

      next();
    });
  });

  // Overload User.login() so Swagger has demo credentials
  Client.remoteMethod(
    'login',
    {
      description: 'Login a user with username/email and password.',
      accepts: [
        {arg: 'credentials', type: 'object', required: true, http: {source: 'body'}, default: JSON.stringify({ username: 'demo', password: '1234' }) },
        {arg: 'include', type: ['string'], http: {source: 'query' },
          description: 'Related objects to include in the response. ' +
          'See the description of return value for more details.'}
      ],
      returns: {
        arg: 'accessToken', type: 'object', root: true,
        description:
          'The response body contains properties of the AccessToken created on login.\n' +
          'Depending on the value of `include` parameter, the body may contain ' +
          'additional properties:\n\n' +
          '  - `user` - `{User}` - Data of the currently logged in user. (`include=user`)\n\n'
      },
      http: {verb: 'post'}
    }
  );

};
