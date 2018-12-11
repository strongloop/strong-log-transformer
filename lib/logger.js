// Copyright IBM Corp. 2014,2018. All Rights Reserved.
// Node module: strong-log-transformer
// This file is licensed under the Apache License 2.0.
// License text available at https://opensource.org/licenses/Apache-2.0

'use strict';

var stream = require('stream');
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

module.exports = Logger;

Logger.DEFAULTS = {
  format: 'text',
  tag: '',
  mergeMultiline: false,
  timeStamp: false,
};

var formatters = {
  text: textFormatter,
  json: jsonFormatter,
}

function Logger(options) {
  var defaults = JSON.parse(JSON.stringify(Logger.DEFAULTS));
  options = util._extend(defaults, options || {});
  var catcher = deLiner();
  var emitter = catcher;
  var transforms = [
    objectifier(),
  ];

  if (options.tag) {
    transforms.push(staticTagger(options.tag));
  }

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

  // restore line endings that were removed by line splitting
  transforms.push(reLiner());

  for (var t in transforms) {
    emitter = emitter.pipe(transforms[t]);
  }

  return duplex(catcher, emitter);
}

function deLiner() {
  var decoder = new StringDecoder('utf8');
  var last = '';

  return new stream.Transform({
    transform: transform,
    flush: flush,
    readableObjectMode: true,
  });

  function transform (chunk, enc, cb) {
    last += decoder.write(chunk)
    var list = last.split(/\r\n|[\n\v\f\r\x85\u2028\u2029]/g);
    last = list.pop()
    for (var i = 0; i < list.length; i++) {
      // swallow empty lines
      if (list[i]) {
        this.push(list[i])
      }
    }
    cb()
  }

  function flush (callback) {
    // any incomplete UTF8 sequences will get dumped to the log as UTF8
    // replacement characters
    last += decoder.end();
    if (last) {
      this.push(last);
    }
    callback()
  }
}

function reLiner() {
  return new stream.Transform({
    transform: appendNewline
  });

  function appendNewline(line, _enc, callback) {
    this.push(line);
    callback(null, Buffer.from('\n'));
  }
}

function objectifier() {
  return new stream.Transform({
    readableObjectMode: true,
    transform: objectify,
  });

  function objectify(chunk, encoding, callback) {
    callback(null, {msg: chunk, time: Date.now()});
  }
}

function staticTagger(tag) {
  return new stream.Transform({
    objectMode: true,
    transform: tagger,
  });

  function tagger(logEvent, _enc, callback) {
    logEvent.tag = tag;
    callback(null, logEvent);
  }
}

function textFormatter(options) {
  return new stream.Transform({
    writableObjectMode: true,
    transform: textify,
  });

  function textify(logEvent, _enc, callback) {
    var line = util.format('%s%s', textifyTags(logEvent.tag),
                           logEvent.msg.toString());
    if (options.timeStamp) {
      line = util.format('%s %s', new Date(logEvent.time).toISOString(), line);
    }
    callback(null, line.replace(/\n/g, '\\n'));
  }

  function textifyTags(tags) {
    var str = '';
    if (typeof tags === 'string') {
      str = tags + ' ';
    } else if (typeof tags === 'object') {
      for (var t in tags) {
        str += t + ':' + tags[t] + ' ';
      }
    }
    return str;
  }
}

function jsonFormatter(options) {
  return new stream.Transform({
    writableObjectMode: true,
    transform: jsonify,
  });

  function jsonify(logEvent, _enc, callback) {
    if (options.timeStamp) {
      logEvent.time = new Date(logEvent.time).toISOString();
    } else {
      delete logEvent.time;
    }
    logEvent.msg = logEvent.msg.toString();
    callback(null, JSON.stringify(logEvent));
  }
}

function lineMerger(host) {
  var previousLine = null;
  var flushTimer = null;
  var merged = new stream.Transform({
    objectMode: true,
    transform: lineMergerWrite,
    flush: lineMergerEnd,
  });

  return merged;

  function lineMergerWrite(line, _enc, callback) {
    if (/^\s+/.test(line.msg)) {
      if (previousLine) {
        previousLine.msg += '\n' + line.msg;
      } else {
        previousLine = line;
      }
    } else {
      mergePrevious.call(this);
      previousLine = line;
    }
    // rolling timeout
    clearTimeout(flushTimer);
    flushTimer = setTimeout(mergePrevious.bind(this), 10);
    callback();
  }

  function mergePrevious() {
    if (previousLine) {
      this.push(previousLine)
      previousLine = null;
    }
  }

  function lineMergerEnd(callback) {
    mergePrevious.call(this);
    callback();
  }
}

function duplex(writable, readable) {
  var dup = new stream.Duplex({
    write: writable.write.bind(writable),
    read: readFromReadable,
  });
  dup.on('finish', onFinish);
  readable.on('end', onEnd);

  return dup;

  function readFromReadable(size) {
    var dup = this;
    readable.once('readable', function() {
      var buf;
      while ((buf = readable.read()) !== null) {
        dup.push(buf);
      }
    });
  }

  function onFinish() {
    writable.end();
  }
  function onEnd() {
    dup.push(null);
  }
}
