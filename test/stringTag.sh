#!/bin/sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --tag SOMETHING_AWESOME < fixtures/basic.in > sandbox/tagged.test

exec diff -u fixtures/tagged.out sandbox/tagged.test >&2
