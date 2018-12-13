var tap = require('tap');
var Log = require('../');

tap.test('tag object with ansi escape codes', function(t) {
  var slt = Log({
    tag: {
      blue: '\u001b[1m\u001b[34mblue\u001b[39m\u001b[22m',
      green: '\u001b[32mgreen\u001b[39m',
    },
  });
  var input = [
    'good line',
    'good line',
    'good line',
  ];
  var expected = input.map(function(line) {
    return 'blue:\u001b[1m\u001b[34mblue\u001b[39m\u001b[22m green:\u001b[32mgreen\u001b[39m ' + line + '\n';
  }).join('');
  var received = '';

  slt.on('data', function(buf) {
    t.comment(buf);
    if (Buffer.isBuffer(buf)) {
      received += buf.toString('utf8');
    } else if (buf !== null) {
      received += buf;
    }
  });
  slt.on('end', function() {
    t.same(received, expected, 'output is input + trailing newline');
    t.end();
  });
  slt.write(input.join('\n'));
  slt.end();
});

tap.test('tag string with ansi escape codes', function(t) {
  var slt = Log({
    tag: '\u001b[1m\u001b[34mblue\u001b[39m\u001b[22m',
  });
  var input = [
    'good line',
    'good line',
    'good line',
  ];
  var expected = input.map(function(line) {
    return '\u001b[1m\u001b[34mblue\u001b[39m\u001b[22m ' + line + '\n';
  }).join('');
  var received = '';

  slt.on('data', function(buf) {
    t.comment(buf);
    if (Buffer.isBuffer(buf)) {
      received += buf.toString('utf8');
    } else if (buf !== null) {
      received += buf;
    }
  });
  slt.on('end', function() {
    t.same(received, expected, 'output is input + trailing newline');
    t.end();
  });
  slt.write(input.join('\n'));
  slt.end();
});
