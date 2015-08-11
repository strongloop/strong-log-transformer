#!/bin/bash
set -e

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js < fixtures/basic.in > sandbox/basic.test

assert_exit 0 diff -u fixtures/basic.out sandbox/basic.test
