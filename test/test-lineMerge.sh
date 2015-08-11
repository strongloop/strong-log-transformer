#!/bin/bash
set -e

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --mergeMultiline < fixtures/lineMerge.in \
                                                   > sandbox/lineMerge.test

assert_exit 0 diff -u fixtures/lineMerge.out sandbox/lineMerge.test
