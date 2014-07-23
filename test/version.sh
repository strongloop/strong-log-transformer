#!/bin/sh

node ../bin/sl-log-transformer.js --version | grep '^strong-log-transformer v\d\+\.\d\+\.\d\+$' || exit 1
