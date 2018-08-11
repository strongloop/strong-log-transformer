#!/bin/bash

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --format=json < fixtures/basic.in > sandbox/json.test

assert_exit 0 diff -u fixtures/basic.json sandbox/json.test
