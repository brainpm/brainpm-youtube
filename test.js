var assert = require('assert');
var fs = require('fs');
var tr = require('./index.js');
var concat = require('concat-stream');

var cs = concat(function(data) {
    var expected = fs.readFileSync('./output.html', 'utf8');
    assert.equal(data, expected);
});
var input = fs.createReadStream('./input.html');
input.pipe(tr()).pipe(cs);
