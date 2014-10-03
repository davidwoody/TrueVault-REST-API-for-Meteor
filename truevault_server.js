TrueVault = {};

TrueVault.settings = {
  "API_ENDPOINT": "https://api.truevault.com/v1",
};

TrueVault.config = function (configObject) {
  TrueVault.settings = _.extend(TrueVault.settings, configObject);
};

TrueVault.urlVault = function () {
  var settings = TrueVault.settings;
  if(!settings["VAULT_ID"]){
    throw new Meteor.Error(500, "VAULT_ID is not configured.");
  } else {
    return settings["API_ENDPOINT"] + '/vaults/' + settings["VAULT_ID"] + '/documents';
  }
};

TrueVault.encode = function (obj) {
  var objString = JSON.stringify(obj);
  var base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(objString));
  return base64;
};

TrueVault.decode = function (base64) {
  var baseParse = CryptoJS.enc.Base64.parse(base64);
  var baseParse2 = CryptoJS.enc.Utf8.stringify(baseParse);
  return JSON.parse(baseParse2);
};

TrueVault.insert = function (doc, userId) {
  if(!doc || typeof doc !== "object"){
    throw new Meteor.Error(400, "No updated object passed to TrueVault.update()");
  }

  var options = {
    auth: TrueVault.settings["API_KEY"] + ":" + "",
    data: {
      document: TrueVault.encode(doc)
    }
  };

  var result = HTTP.call("POST", TrueVault.urlVault(), options);
  // console.log(result);

  if(result.data.result === "success"){
    // insert into collection
    return Vault.insert({
      userId: userId,
      document_id: result.data.document_id
    });
  } else {
    throw new Meteor.Error(result.statusCode, result.content);
  }
};

TrueVault.findOne = function (docId) {
  if(!docId){
    throw new Meteor.Error(400, "No document_id passed to TrueVault.findOne()");
  }

  var url = TrueVault.urlVault() + "/" + docId;
  var options = {
    auth: TrueVault.settings["API_KEY"] + ":" + "",
  };

  var result = HTTP.call("GET", url, options);
  // console.log(result);
  
  if(result.statusCode === 200){
    var decoded = TrueVault.decode(result.content);
    // console.log(decoded);
    return decoded;
  } else {
    throw new Meteor.Error(result.statusCode, result.error.messsage);
  }
};

TrueVault.update = function (docId, doc) {
  if(!docId || typeof docId !== "string"){
    throw new Meteor.Error(400, "No document_id passed to TrueVault.update()");
  }

  if(!doc || typeof doc !== "object"){
    throw new Meteor.Error(400, "No updated object passed to TrueVault.update()");
  }

  var url = TrueVault.urlVault() + "/" + docId;
  var options = {
    auth: TrueVault.settings["API_KEY"] + ":" + "",
    data: {
      document: TrueVault.encode(doc)
    }
  };

  var result = HTTP.call("PUT", url, options);
  // console.log(result);
  return result.statusCode;
};

TrueVault.remove = function (docId) {
  if(!docId || typeof docId !== "string"){
    throw new Meteor.Error(400, "No document_id passed to TrueVault.remove()");
  }

  var url = TrueVault.urlVault() + "/" + docId;
  var options = {
    auth: TrueVault.settings["API_KEY"] + ":" + "",
  };

  var result = HTTP.call("DELETE", url, options);
  // console.log(result);
  
  // REMOVE DOCUMENT FROM DB ON SUCCESS
  if(result.statusCode === 200){
    Vault.remove({document_id: docId});
  } else {
    throw new Meteor.Error(result.statusCode, result.content);
  }
};

TrueVault.fetch = function (arrayOfDocIds) {
  console.log("TrueVault.fetch() is not currently implemented");
};

// 
// HELPER FUNCTIONS FOR METHODS
// 

// context is 'this' inside of the method
var checkForLoggedInUser = function (context) {
  if(!context.userId){
    throw new Meteor.Error(401, "There is not a logged in user.");
  }
};
// return the existing vault or throw error
var findExistingVault = function (userId) {
  var existingVault = Vault.findOne({userId: userId});

  if(existingVault){
    return existingVault;
  } else {
    throw new Meteor.Error(400, "This user does not have an existing record the Vault collection.");
  }
};


Meteor.methods({
  initializeTrueVault: function () {
    checkForLoggedInUser(this);

    var dataModel = TrueVault.settings["DATA_MODEL"];
    var existingVault = Vault.find({userId: this.userId});

    if(!dataModel){
      throw new Meteor.Error(400, "No DATA_MODEL set on server for initializeTrueVault method to use.");
    }

    if(existingVault){
      throw new Meteor.Error(400, "This user already has a record in the Vault collection.");
    }

    return TrueVault.insert(dataModel, this.userId);
  }, //initializeTrueVault

  // FIND LOGGED IN USERS TRUEVAULT RECORD
  findOneTrueVault: function () {
    checkForLoggedInUser(this);

    var vault = findExistingVault(this.userId);
    
    return TrueVault.findOne(vault.document_id);
  }, //getTrueVault

  // UPDATES THE LOGGED IN USERS TRUEVAULT RECORD WITH DOC THAT IS PASSED
  updateTrueVault: function (doc) {
    check(doc, Object);
    checkForLoggedInUser(this);

    if(!doc) {
      throw new Meteor.Error(400, "No document passed to updateTrueVault method");
    }

    var vault = findExistingVault(this.userId);

    return TrueVault.update(vault.document_id, doc);
  }, //updateTrueVault
});


// PUBLISH THE VAULT INFORMATION FOR THE SIGNED IN USER
Meteor.publish(null, function () {
  if(this.userId){
    return Vault.find({userId: this.userId});
  } else {
    this.ready();
  }
});