'use strict';

var stream = require('stream');
var util = require('util');
var fs = require('fs');

var byline = require('byline');
var through = require('through');

module.exports = Logger;

function Logger(options) {
  var defaults = {
    destination: process.stdout,
  };
  options = util._extend(defaults, options || {});
  var catcher = new byline.LineStream;
  var pipeline = catcher;
  var transforms = [
  ]

  // TODO
  // if (options.pidStamp) {
  //   transforms.push(pidStamper(options.pid));
  // }

  // TODO
  // if (options.workerStamp) {
  //   transforms.push(workerStamper(options.worker));
  // }

  // restore line endings that were removed by byline
  transforms.push(reLiner());

  // last transform is the destination stream to pipe out to
  transforms.push(options.destination);

  for (var t in transforms) {
    pipeline = pipeline.pipe(transforms[t]);
  }

  return catcher;
}

function reLiner() {
  return through(appendNewline);

  function appendNewline(line) {
    this.emit('data', line + '\n');
  }
}
