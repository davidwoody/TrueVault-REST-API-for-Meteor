TrueVault = {};

TrueVault.settings = {
  "API_ENDPOINT": "https://api.truevault.com/v1",
};

TrueVault.config = function (configObject) {
  TrueVault.settings = _.extend(TrueVault.settings, configObject);
};

TrueVault.urlVault = function(){
  var settings = TrueVault.settings;
  if(!settings["VAULT_ID"]){
    throw new Meteor.Error(500, "VAULT_ID is not configured.");
  } else {
    return settings["API_ENDPOINT"] + '/vaults/' + settings["VAULT_ID"] + '/documents';
  }
};

TrueVault.encode = function(obj){
  var objString = JSON.stringify(obj);
  var base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(objString));
  return base64;
};

TrueVault.decode = function(base64){
  var baseParse = CryptoJS.enc.Base64.parse(base64);
  var baseParse2 = CryptoJS.enc.Utf8.stringify(baseParse);
  return JSON.parse(baseParse2);
};

Meteor.methods({
  insertTrueVault: function(doc){
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
      Vault.insert({
        userId: this.userId,
        document_id: result.data.document_id
      });
    } else {
      throw new Meteor.Error(result.statusCode, result.content);
    }
  }, //postTrueVault

  findOneTrueVault: function(docId){
    var url = TrueVault.urlVault() + "/" + docId;
    var options = {
      auth: TrueVault.settings["API_KEY"] + ":" + "",
    };

    var result = HTTP.call("GET", url, options);
    // console.log(result);
    
    if(result.statusCode === 200){
      var decoded = TrueVault.decode(result.content);
      console.log(decoded);
      return decoded;
    } else {
      throw new Meteor.Error(result.statusCode, result.error.messsage);
    }
  }, //getTrueVault

  updateTrueVault: function(docId, doc){
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
  }, //updateTrueVault

  removeTrueVault: function(docId){
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
  }, //removeTrueVault

  fetchTrueVault: function(arrayOfDocIds){
    var message = "fetchTrueVault is not currently implemented";
    console.log(message);
    return message;
  },
});


// PUBLISH THE VAULT INFORMATION FOR THE SIGNED IN USER
Meteor.publish(null, function(){
  if(this.userId){
    return Vault.find({userId: this.userId});
  } else {
    this.ready();
  }
});