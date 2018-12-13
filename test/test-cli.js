// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: strong-log-transformer
// This file is licensed under the Apache License 2.0.
// License text available at https://opensource.org/licenses/Apache-2.0

var common = require('./common');
var fs = require('fs');
var tap = require('tap');

// These tests were ported from the original shell script based tests. The
// intention was to fully exercise the module while also fully exercising the
// CLI wrapper in order to achieve 100% coverage of both the API and CLI.

tap.test('version', function(t) {
  common.sltCLI(['--version'], null, function(_err, output) {
    output = output.toString('utf8');
    t.match(output, /^strong-log-transformer v[0-9]+\.[0-9]+\.[0-9]+/, '--version output looks right');
    t.end();
  });
});

tap.test('help', function(t) {
  common.sltCLI(['--help'], null, function(_err, output) {
    output = output.toString('utf8');
    t.has(output, 'Usage', 'has Usage banner');
    t.has(output, 'timeStamp', 'has timeStamp option');
    t.has(output, 'mergeMultiline', 'has mergeMultiline option');
    t.has(output, 'tag TAG', 'has tag option');
    t.has(output, 'format FORMAT', 'has format option');
    t.end();
  });
});

tap.test('text (default)', function(t) {
  var input = fs.readFileSync('test/fixtures/basic.in');
  var expected = fs.readFileSync('test/fixtures/basic.out');
  common.sltCLI([], input, function(err, output) {
    t.ifErr(err);
    t.same(output, expected);
    t.end();
  });
});

tap.test('text: lineMerge', function(t) {
  var input = fs.readFileSync('test/fixtures/lineMerge.in');
  var expected = fs.readFileSync('test/fixtures/lineMerge.out');
  common.sltCLI(['--mergeMultiline'], input, function(err, output) {
    t.ifErr(err);
    t.same(output, expected);
    t.end();
  });
});

tap.test('text: string tagged', function(t) {
  var input = fs.readFileSync('test/fixtures/basic.in');
  var expected = fs.readFileSync('test/fixtures/tagged.out');
  common.sltCLI(['--tag', 'SOMETHING_AWESOME'], input, function(err, output) {
    t.ifErr(err);
    t.same(output, expected);
    t.end();
  });
});

tap.test('text: object tagged', function(t) {
  var input = fs.readFileSync('test/fixtures/basic.in');
  var expected = fs.readFileSync('test/fixtures/text-object-tagged.out');
  common.sltCLI(['--tag.one', '1', '--tag.two', '2'], input, function(err, output) {
    t.ifErr(err);
    t.same(output, expected);
    t.end();
  });
});

tap.test('text: timestamps', function(t) {
  var input = fs.readFileSync('test/fixtures/basic.in');
  var expected = fs.readFileSync('test/fixtures/text-timestamp.grep');
  var expectedLines = expected.toString('utf8').split('\n');
  var expectedPatterns = expectedLines.map(function(line) { return new RegExp(line); });
  common.sltCLI(['--timeStamp'], input, function(err, output) {
    var outputLines = output.toString('utf8').split('\n');
    t.ifErr(err);
    t.same(outputLines.length, expectedPatterns.length, 'correct number of lines');
    for (var l = 0; l < expectedLines.length; l++) {
      t.match(outputLines[l], expectedPatterns[l]);
    }
    t.end();
  });
});

tap.test('json', function(t) {
  var input = fs.readFileSync('test/fixtures/basic.in');
  var expected = fs.readFileSync('test/fixtures/basic.json');
  common.sltCLI(['--format=json'], input, function(err, output) {
    t.ifErr(err);
    t.same(output, expected);
    t.end();
  });
});

tap.test('json: timestamps', function(t) {
  var input = fs.readFileSync('test/fixtures/basic.in');
  var expected = fs.readFileSync('test/fixtures/json-timestamp.grep');
  var expectedLines = expected.toString('utf8').split('\n');
  var expectedPatterns = expectedLines.map(function(line) { return new RegExp(line); });
  common.sltCLI(['--timeStamp', '--format=json'], input, function(err, output) {
    var outputLines = output.toString('utf8').split('\n');
    t.ifErr(err);
    t.same(outputLines.length, expectedPatterns.length, 'correct number of lines');
    for (var l = 0; l < expectedLines.length; l++) {
      t.match(outputLines[l], expectedPatterns[l]);
    }
    t.end();
  });
});
