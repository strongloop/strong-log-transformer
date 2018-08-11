#!/bin/bash

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --timeStamp < fixtures/basic.in > sandbox/text-timestamp.test

# timestamps are real so we have a regex-per-line filter
grep -E -f fixtures/text-timestamp.grep sandbox/text-timestamp.test > sandbox/text-timestamp.matched

assert_exit 0 diff -u sandbox/text-timestamp.matched sandbox/text-timestamp.test
