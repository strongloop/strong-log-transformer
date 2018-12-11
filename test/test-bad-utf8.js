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
    Buffer.from("good line\n"),
    Buffer.from("good line\n"),
    Buffer.from('good line\n'),
    Buffer.from('good line\n'),
    Buffer.from([
      0xef, 0xbf, 0xbd, // replacement character
      0xef, 0xbf, 0xbd, // replacement character
      0xef, 0xbf, 0xbd, // replacement character
      0x0a,             // trailing newline adde by strong-log-transformer
    ]),
  ]);
  var received = [];

  slt.on('readable', function() {
    var buf = slt.read();
    t.comment(buf);
    if (buf !== null) {
      received.push(buf);
    }
    t.ok(Buffer.isBuffer(buf) || buf === null, 'output is a buffer or null');
  });
  slt.on('end', function() {
    var result = Buffer.concat(received);
    t.same(result, expected, 'output is input + trailing newline');
    t.end();
  });
  slt.write(Buffer.concat(input));
  slt.end();
});
