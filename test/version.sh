#!/bin/sh

node ../bin/sl-log-transformer.js --version | egrep '^strong-log-transformer v[0-9]+\.[0-9]+\.[0-9]+' || exit 1
