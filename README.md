TrueVault-REST-API-for-Meteor
=============================

Use the TrueVault REST API easily with Meteor.

### Setup
1. Sign up for TrueVault and create a Vault and a User. **Tip:** Follow these instruction - https://www.truevault.com/documentation/quick-start.html
2. Add the package to your app `meteor add woody:truevault`
3. On the **server**, include the following: 
```
Meteor.startup(function(){
    TrueVault.config({
      "API_KEY": "PASTE_YOUR_KEY",
      "VAULT_ID": "PASTE_YOUR_VAULT_ID"
    });
});
```

### Overview

This package does not list any `accounts` packages as dependencies, however **an accounts system is required**. The patter used is one TrueVault document per Meteor user. On the client and the server, there is a `Collection` called `Vault`, which contains the TrueVault mapping for the Meteor user. The `Vault` collection on the client will only contain the record for the currently logged in user. 

### Methods

#### insertTrueVault

The insertTrueVault method takes an object as an argument. The object is then transformed into a JSON string, encoded in Base64, sent to TrueVault, and then a document is inserted into the `Vault` collection. This should only be called to create the initial document for a new user to store in TrueVault, subsequently the **updateTrueVault** method should be used. If you are using Meteor `Accounts`, consider including this call within a `Accounts.onCreateUser` call on the server to intialize the user with a document in TrueVault.
```
Meteor.call('insertTrueVault', {thing: 'value of thing'});
```
#### findOneTrueVault

The findOneTrueVault method takes a TrueVault document id as an argument. If a document is found within TrueVault, the method decodes and returns the original object that was passed with the insert or update method. Include a callback function to do something with the result on the client. 
```
Meteor.call('findOneTrueVault', Vault.findOne().document_id, function(error, result){
  // do something with result
});
```
#### updateTrueVault

The updateTrueVault method takes a document id as its first argument and an object as its second argument. **Note:** The entire updated object should be passed, as it will override the entire document on TrueVault. 
```
Meteor.call('updateTrueVault', Vault.findOne().document_id, {thing: 'new value of thing'});
```

#### removeTrueVault

The removeTrueVault method takes a document id as its only argument. It will delete the document on TrueVault and remove the associated record in the `Vault` collection. 
```
Meteor.call('removeTrueVault', Vault.findOne().document_id);
```
#### TODO: fetchTrueVault

Will fetch multiple documents from TrueVault with one call.

### Roadmap

1. ~~Simple way to store and retreive user records in TrueVault.~~
2. Make compatable with `audit-arguments-check` package.
3. Integrate TrueVault Blob API.

### License

MIT - http://opensource.org/licenses/MIT
