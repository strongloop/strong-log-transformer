#!/bin/bash
set -e

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

node ../bin/sl-log-transformer.js --version | egrep '^strong-log-transformer v[0-9]+\.[0-9]+\.[0-9]+' && ok "version" || fail "version"
