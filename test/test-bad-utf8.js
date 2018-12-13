var tap = require('tap');
var Log = require('../');

tap.test('truncated utf8', function(t) {
  var slt = Log();
  var input = [
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from([
      // an incomplete utf8 sequence (3/4 bytes)
      0xf0, // byte 1 of 4 marker
      0xbf, // byte 2 of 4 marker
      0xbf, // byte 3 of 4 marker
    ]),
  ];
  var expected = Buffer.concat([
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from([
      0xef, 0xbf, 0xbd, // single replacement character
      0x0a,             // trailing newline adde by strong-log-transformer
    ]),
  ]);
  var received = '';

  if (/^v(4|6)\./.test(process.version)) {
    expected = Buffer.concat([
      Buffer.from('good line\n'),
      Buffer.from('good line\n'),
      Buffer.from('good line\n'),
      Buffer.from('good line\n'),
      Buffer.from([
        // prior to node 8 each byte of an invalid utf8 sequence would be
        // replaced by a UTF replacement character. For more details, see
        // https://github.com/nodejs/node/commit/24ef1e6775
        0xef, 0xbf, 0xbd, // replacement character
        0xef, 0xbf, 0xbd, // replacement character
        0xef, 0xbf, 0xbd, // replacement character
        0x0a,             // trailing newline adde by strong-log-transformer
      ]),
    ]);
  }
  slt.on('data', function(buf) {
    t.comment(buf);
    if (Buffer.isBuffer(buf)) {
      received += buf.toString('utf8');
    } else if (buf !== null) {
      received += buf;
    }
  });
  slt.on('end', function() {
    var expectedStr = expected.toString('utf8');
    t.same(received, expectedStr, 'output is input + trailing newline');
    t.end();
  });
  slt.write(Buffer.concat(input));
  slt.end();
});
