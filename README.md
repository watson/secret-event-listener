# secret-event-listener

Add an event listener without causing any side effects.

[![npm](https://nodei.co/npm/secret-event-listener.png)](https://www.npmjs.com/package/secret-event-listener)

[![Build status](https://travis-ci.org/watson/secret-event-listener.svg?branch=master)](https://travis-ci.org/watson/secret-event-listener)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Why?

Adding an event listener to an emitter object will normally trigger
certain side effects. E.g. the
[`newListener`](https://nodejs.org/api/events.html#events_event_newlistener)
event will be emitted for every new listener added. A
`MaxListenersExceededWarning` process warning will be emitted if the
emitter reaches is [maximum listener
count](https://nodejs.org/api/events.html#events_emitter_setmaxlisteners_n).
Or a readable stream will enter [flowing
mode](https://nodejs.org/api/stream.html#stream_two_modes) if a `data`
listener is added.

This module gives you the ability to attach a listener without
triggering any of these side effects.

## Installation

```
npm install secret-event-listener --save
```

## Usage

```js
const {EventEmitter} = require('events')
const addSecretListener = require('secret-event-listener')

const emitter = new EventEmitter()

emitter.on('newListener', function () {
  throw new Error('should not fire the newListener event!')
})

addSecretListener(emitter, 'foo', function () {
  console.log('foo event fired :)')
})

emitter.emit('foo')
```

## API

### `addSecretListener(emitter, eventName, listener)`

Arguments:

- `emitter` - an object inheriting from
  [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter)
- `eventName` - the event to add the `listener` to
- `listener` - a listener function which should be called every time an
  event of `eventName` is emitted.

### `addSecretListener.prepend(emitter, eventName, listener)`

Like the main `addSecretListener` function, except the `listener` is
added to the beginning of the listeners array for the event named
`eventName`. 

## License

[MIT](https://github.com/watson/secret-event-listener/blob/master/LICENSE)
