#!/bin/bash

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --tag.one 1 --tag.two 2 < fixtures/basic.in > sandbox/text-object-tagged.test

assert_exit 0 diff -u fixtures/text-object-tagged.out sandbox/text-object-tagged.test
