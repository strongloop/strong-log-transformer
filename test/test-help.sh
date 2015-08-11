#!/bin/bash
set -e

cd $(dirname "${BASH_SOURCE[0]}")
source common.sh

node ../bin/sl-log-transformer.js --help | grep 'Usage' && ok "Usage" || fail "Usage"
node ../bin/sl-log-transformer.js --help | grep 'timeStamp' && ok "timeStamp" || fail "timeStamp"
node ../bin/sl-log-transformer.js --help | grep 'mergeMultiline' && ok "mergeMultiline" || fail "mergeMultiline"
node ../bin/sl-log-transformer.js --help | grep 'tag TAG' && ok "tag" || fail "tag"
node ../bin/sl-log-transformer.js --help | grep 'format FORMAT' && ok "format" || fail "format"
