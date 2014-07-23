#!/bin/sh

mkdir -p sandbox
node ../bin/sl-log-transformer.js --mergeMultiline < fixtures/lineMerge.in \
                                                   > sandbox/lineMerge.test

exec diff -u fixtures/lineMerge.out sandbox/lineMerge.test >&2
