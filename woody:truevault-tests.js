// Write your tests here!
// Here is an example.
Tinytest.add('example', function (test) {
  test.equal(true, true);
});

Tinytest.add('encode.decode', function (test) {
  var start = {some: "thing"};
  var encoded = TrueVault.encode(start);
  var decoded = TrueVault.decode(encoded);
  test.equal(start, decoded);
});
