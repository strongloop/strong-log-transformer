// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: strong-log-transformer
// This file is licensed under the Apache License 2.0.
// License text available at https://opensource.org/licenses/Apache-2.0

var child_process = require('child_process');
var sltCLIPath = require.resolve('../bin/sl-log-transformer');

exports.sltCLI = runCLIWithInput;

function runCLIWithInput(args, input, callback) {
  var execPath = process.execPath;
  var argv = [sltCLIPath].concat(args);
  var output = [];
  var slt = child_process.spawn(execPath, argv, {stdio: "pipe"});
  slt.stdout.on('data', function(data) {
    output.push(data);
  });
  slt.stderr.on('data', function(data) {
    output.push(data);
  });
  slt.on('close', function(code, signal) {
    if (code || signal) {
      return callback(new Error('process exited with code: ' + code));
    }
    callback(null, Buffer.concat(output));
  });
  if (input && input.pipe) {
    input.pipe(slt.stdin);
  } else if (input) {
    slt.stdin.end(input);
  } else {
    slt.stdin.end();
  }
}
