// Setup a dependency to track when TrueVault (client only collection) has been updated
// to trigger the TrueVault.update call to insure the data is stored in TrueVault
// var TrueVaultDep = new Tracker.Dependency();

// Contains a "replica" of real TrueVault document owned by logged in user
TrueVault = new Mongo.Collection(null);

var isReative = true;

if( Meteor &&
    Meteor.settings &&
    Meteor.settings.public &&
    Meteor.settings.public.TrueVault &&
    Meteor.settings.public.TrueVault.reative
  ){
  isReative = Meteor.settings.public.TrueVault.reative;
}

var trueVaultReactive = function () {

  // When changes are made to TrueVault collection
  // update real TrueVault to insure changes are saved
  Tracker.autorun(function () {
    var vault = Vault.findOne({userId: Meteor.userId()});
    var trueVault = TrueVault.findOne({userId: Meteor.userId()});
    if(vault && trueVault){
      console.log("Tracker1 called updateTrueVault");
      Meteor.call('updateTrueVault', trueVault, function(err, result){
        if(err){
          console.log(err);
        }
      });
    } else {
      console.log("Tracker1 did not call updateTrueVault");
    }
  }); //Tracker.autrun

  // If no TrueVault collection record, but has Vault record, 
  // fetch document from real TrueVault and insert into 
  // TrueVault collection
  // If no Vault record and still has TrueVault collection record
  // destroy the client only collection
  Tracker.autorun(function () {
    var vault = Vault.findOne({userId: Meteor.userId()});
    var trueVault = TrueVault.findOne();
    var docId = null;

    if(vault && !trueVault){
      Meteor.call('findOneTrueVault', function(err, result){
        if(err){
          console.warn(err);
        } else {
          console.log("Tracker2 got result from findOneTrueVault");
          TrueVault.insert(result);
        }
      });
    } else if(!vault && trueVault){
      console.log("Tracker2 killed client only collection");
      // KILL the client only collection if Vault count is not 1 for any reason
      TrueVault.remove({});
    } else {
      console.log("Tracker2 did nothing");
    }
  }); //Tracker.autorun
}; //trueVaultReactive


var trueVaultNotReactive = function () {
  console.warn("TrueVault.reative must be true for now...");
};

if(isReative){
  trueVaultReactive();
} else {
  trueVaultNotReactive();
}




















// TODO: INCORPORATE INTO TRUEVAULT CONFIG
// var VaultStructure = {
//   responses: [],
//   weight: null,
//   height: null,
//   tobaccoUser: null,
//   tobaccoDaily: null,
//   tobaccoYears: null,
//   modActivity: null,
//   vigActivity: null,
//   strengthWeekly: null,
//   dietScore: {
//     fiveServings: null,
//     typicalMeal: null,
//     milk: null,
//     grains: null
//   },
//   tobacco: {
//     qScore: null,
//     confidence: null,
//     importance: null
//   },
//   diet: {
//     qScore: null,
//     confidence: null,
//     importance: null
//   },
//   exercise: {
//     qScore: null,
//     confidence: null,
//     importance: null
//   },
//   goal: {
//     name: null,
//     confidence: null,
//     importance: null
//   }
// };


// VaultInitializor = function(){
//   this.userId = Meteor.userId();
//   _.extend(this, VaultStructure);
// };