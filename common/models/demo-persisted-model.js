module.exports = function(DemoPersisted) {

  DemoPersisted.setup = function() {
    DemoPersisted.base.setup.call(this);
    var DemoPersistedModel = this;

    // Hide remote methods
    var isStatic = true;

    DemoPersistedModel.disableRemoteMethod('confirm', isStatic);
    DemoPersistedModel.disableRemoteMethod('count', isStatic);
    DemoPersistedModel.disableRemoteMethod('createChangeStream', isStatic);
    DemoPersistedModel.disableRemoteMethod('exists', isStatic);
    DemoPersistedModel.disableRemoteMethod('findOne', isStatic);
    DemoPersistedModel.disableRemoteMethod('resetPassword', isStatic);
    DemoPersistedModel.disableRemoteMethod('updateAll', isStatic);
    DemoPersistedModel.disableRemoteMethod('upsert', isStatic);
  }
};
