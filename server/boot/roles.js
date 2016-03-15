module.exports = function(app) {

  var Role = app.models.Role;
  Role.registerResolver('$follower', function(role, context, cb) {
    function reject(err) {
      if (err) return cb(err);

      cb(null, false);
    }

    // Target model is not Post or Client
    if (!/Post|Client/.test(context.modelName)) {
      return reject();
    }

    // Do not allow anonymous users
    var uid = context.accessToken.userId;
    if (!uid) {
      return reject();
    }

    // Check if user is a follower for the given post id
    context.model.findById(context.modelId, function(err, inst) {
      if (err || !inst) return reject(err);

      var Follow = app.models.Follow;
      Follow.count({
        followeeId: inst.owner || inst.id,
        followerId: uid
      }, function(err, count) {
        if (err) return reject(err);

        cb(null, count > 0);
      });
    });
  });
}