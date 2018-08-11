#!/bin/bash

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --timeStamp --format=json < fixtures/basic.in > sandbox/json-timestamp.test

# timestamps are real so we have a regex-per-line filter
grep -E -f fixtures/json-timestamp.grep sandbox/json-timestamp.test > sandbox/json-timestamp.matched

assert_exit 0 diff -u sandbox/json-timestamp.matched sandbox/json-timestamp.test
