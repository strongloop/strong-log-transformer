#!/bin/sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js < fixtures/basic.in > sandbox/basic.test

exec diff -u fixtures/basic.out sandbox/basic.test >&2
