strong-log-transformer
======================

A stream filter for performing common log stream transformations like
timestamping and joining multi-line messages.

**This is not a logger!** But it may be useful for rolling your own logger.

## Usage

Install strong-log-transformer and add it to your dependencies list.
```sh
npm install --save strong-log-transformer
```

## Line Merging

In order to keep things flowing when line merging is enabled (disabled by
default) there is a sliding 10ms timeout for flushing the buffer. This means
that whitespace leading lines are only considered part of the previous line if
they arrive within 10ms of the previous line, which should be reasonable
considering the lines were likely written in the same `write()`.
