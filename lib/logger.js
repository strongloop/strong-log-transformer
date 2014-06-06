'use strict';

var stream = require('stream');
var util = require('util');
var fs = require('fs');

var byline = require('byline');
var through = require('through');
var moment = require('moment');

module.exports = Logger;

var formatters = {
  text: textFormatter,
  json: jsonFormatter,
}

function Logger(options) {
  var defaults = {
    destination: process.stdout,
    format: 'text',
    mergeMultiline: false,
  };
  options = util._extend(defaults, options || {});
  var catcher = new byline.LineStream;
  var pipeline = catcher;
  var transforms = [
    objectifier(),
  ];

  if (options.mergeMultiline) {
    transforms.push(lineMerger());
  }

  // TODO
  // if (options.pidStamp) {
  //   transforms.push(pidStamper(options.pid));
  // }

  // TODO
  // if (options.workerStamp) {
  //   transforms.push(workerStamper(options.worker));
  // }

  transforms.push(formatters[options.format](options));

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

function objectifier() {
  return through(objectify);

  function objectify(line) {
    this.emit('data', {
      msg: line,
      time: Date.now(),
    });
  }
}

function textFormatter(options) {
  return through(textify);

  function textify(logEvent) {
    var line = logEvent.msg.toString();
    if (options.timeStamp) {
      line = util.format('%s %s', moment(logEvent.time).toISOString(), line);
    }
    this.emit('data', line.replace(/\n/g, '\\n'));
  }
}

function jsonFormatter(options) {
  return through(jsonify);

  function jsonify(logEvent) {
    if (options.timeStamp) {
      logEvent.time = moment(logEvent.time).toISOString();
    } else {
      delete logEvent.time;
    }
    logEvent.msg = logEvent.msg.toString();
    this.emit('data', JSON.stringify(logEvent));
  }
}

function lineMerger(host) {
  var previousLine = null;
  var flushTimer = null;
  var stream = through(lineMergerWrite, lineMergerEnd);
  var flush = _flush.bind(stream);

  return stream;

  function lineMergerWrite(line) {
    if (/^\s+/.test(line.msg)) {
      if (previousLine) {
        previousLine.msg += '\n' + line.msg;
      } else {
        previousLine = line;
      }
    } else {
      flush();
      previousLine = line;
    }
    // rolling timeout
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush.bind(this), 10);
  }

  function _flush() {
    if (previousLine) {
      this.emit('data', previousLine);
      previousLine = null;
    }
  }

  function lineMergerEnd() {
    flush.call(this);
    this.emit('end');
  }
}
