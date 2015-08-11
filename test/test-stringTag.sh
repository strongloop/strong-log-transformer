#!/bin/bash
set -e

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --tag SOMETHING_AWESOME < fixtures/basic.in > sandbox/tagged.test

assert_exit 0 diff -u fixtures/tagged.out sandbox/tagged.test
