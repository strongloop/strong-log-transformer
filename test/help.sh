#!/bin/sh

node ../bin/sl-log-transformer.js --help | grep 'Usage' && echo ok || echo 'not ok # Usage'
node ../bin/sl-log-transformer.js --help | grep 'timeStamp' && echo ok || echo 'not ok # timeStamp'
node ../bin/sl-log-transformer.js --help | grep 'mergeMultiline' && echo ok || echo 'not ok # mergeMultiline'
node ../bin/sl-log-transformer.js --help | grep 'tag TAG' && echo ok || echo 'not ok # tag'
node ../bin/sl-log-transformer.js --help | grep 'format FORMAT' && echo ok || echo 'not ok # format'
