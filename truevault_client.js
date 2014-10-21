// Contains a "replica" of real TrueVault document owned by logged in user
TrueVault = new Mongo.Collection(null);

var updating = function (bool) {
  console.log('Updating TrueVault: ' + bool);
  Session.set('isTrueVaultUpdating', bool);
};

// observe the TrueVault collection and send updates when things change
var trueVaultObserver = TrueVault.find().observe({
  added: function (document) {
    // console.log("TrueVault record added");
  },
  changed: function (newDocument, oldDocument) {
    // console.log("TrueVault record changed, call updateTrueVault");
    updating(true);
    Meteor.call('updateTrueVault', newDocument, function(err, result){
      updating(false);
      if(err){
        console.warn(err);
      }
    });
  },
  removed: function (oldDocument) {
    // console.log("TrueVault record removed");
  }
});

// load when a user first logs in
Tracker.autorun(function () {
  var user = Meteor.user();

  if(user){
    updating(true);
    // user logged in, load TrueVault records
    Meteor.call('findOneTrueVault', function (err, result) {
      updating(false);
      if(err && err.error !== 401) {
        console.warn(err);
      } else {
        TrueVault.remove({});
        TrueVault.insert(result);
      }
    });
  } else {
    // No user, so remove all TrueVault data
    TrueVault.remove({});
  }
});

// Whenever Vault version changes, update TrueVault collection
Tracker.autorun(function () {
  var vault = Vault.findOne();
  updating(true);
  Meteor.call('findOneTrueVault', function (err, result) {
    updating(false);
    if(err && err.error !== 401) {
      console.warn(err);
    } else {
      TrueVault.remove({});
      TrueVault.insert(result);
    }
  });
});

if(location.protocol !== "https:" & location.hostname !== "localhost"){
  console.warn("TrueVault package detected the protocol is not HTTPS");
}