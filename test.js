'use strict'

const util = require('util')
const EventEmitter = require('events')
const PassThrough = require('stream').PassThrough
const test = require('tape')
const addSecretListener = require('./')

test('add listener normally should have side effects', function (t) {
  t.plan(3)
  const emitter = new EventEmitter()
  emitter.on('newListener', function (type, listener) {
    t.equal(type, 'foo')
    t.equal(listener, onFoo)
  })
  emitter.on('foo', onFoo)
  emitter.emit('foo', 'baz')
  function onFoo (bar) {
    t.equal(bar, 'baz')
    t.end()
  }
})

test('inject listener', function (t) {
  const emitter = new EventEmitter()
  addSecretListener(emitter, 'foo', function (bar) {
    t.equal(bar, 'baz')
    t.end()
  })
  emitter.emit('foo', 'baz')
})

test('inject listener - no super constructor', function (t) {
  function MyEmitter () {}
  util.inherits(MyEmitter, EventEmitter)
  const emitter = new MyEmitter()
  addSecretListener(emitter, 'foo', function (bar) {
    t.equal(bar, 'baz')
    t.end()
  })
  emitter.emit('foo', 'baz')
})

test('inject listener - no EventEmitter side effects', function (t) {
  const emitter = new EventEmitter()
  emitter.on('newListener', fail)
  addSecretListener(emitter, 'foo', function (bar) {
    t.equal(bar, 'baz')
    t.end()
  })
  emitter.emit('foo', 'baz')
})

test('inject listener - no stream side effects', function (t) {
  t.plan(3)
  let waited = false
  const stream = new PassThrough()
  stream.write('hello world')
  addSecretListener(stream, 'data', function (chunk) {
    t.equal(waited, true)
    t.equal(chunk.toString(), 'hello world')
  })
  setTimeout(function () {
    waited = true
    stream.on('data', function (chunk) {
      t.equal(chunk.toString(), 'hello world')
    })
  }, 100)
})

test('inject listener to the end', function (t) {
  t.plan(2)
  const emitter = new EventEmitter()
  emitter.on('foo', function (bar) {
    t.equal(bar, 'baz')
  })
  addSecretListener(emitter, 'foo', function (bar) {
    t.equal(bar, 'baz')
    t.end()
  })
  emitter.emit('foo', 'baz')
})

test('inject listener to the start', function (t) {
  t.plan(2)
  const emitter = new EventEmitter()
  emitter.on('foo', function (bar) {
    t.equal(bar, 'baz')
    t.end()
  })
  addSecretListener(emitter, 'foo', function (bar) {
    t.equal(bar, 'baz')
  }, true)
  emitter.emit('foo', 'baz')
})

test('remove only listener from unused emitter using removeAllListeners()', function (t) {
  const emitter = new EventEmitter()
  addSecretListener(emitter, 'foo', fail)
  emitter.removeAllListeners()
  emitter.emit('foo')
  t.end()
})

test('remove only listener from unused emitter using removeAllListeners(type)', function (t) {
  const emitter = new EventEmitter()
  addSecretListener(emitter, 'foo', fail)
  emitter.removeAllListeners('foo')
  emitter.emit('foo')
  t.end()
})

test('remove only listener from unused emitter using removeListener(type, listener)', function (t) {
  const emitter = new EventEmitter()
  addSecretListener(emitter, 'foo', fail)
  emitter.removeListener('foo', fail)
  emitter.emit('foo')
  t.end()
})

test('remove only listener from emitter that previously had other listeners', function (t) {
  const emitter = new EventEmitter()
  emitter.on('foo', function () {})
  emitter.removeAllListeners()
  addSecretListener(emitter, 'foo', fail)
  emitter.removeListener('foo', fail)
  emitter.emit('foo')
  t.end()
})

test('remove listeners number 2', function (t) {
  t.plan(2)
  const emitter = new EventEmitter()
  emitter.on('foo', function () {})
  addSecretListener(emitter, 'foo', fail)
  emitter.on('removeListener', function (type, fn) {
    t.equal(type, 'foo')
    t.equal(fn, fail)
  })
  emitter.removeListener('foo', fail)
  emitter.emit('foo')
})

test('remove listeners number 3', function (t) {
  t.plan(2)
  const emitter = new EventEmitter()
  emitter.on('foo', function () {})
  emitter.on('foo', function () {})
  addSecretListener(emitter, 'foo', fail)
  emitter.on('removeListener', function (type, fn) {
    t.equal(type, 'foo')
    t.equal(fn, fail)
  })
  emitter.removeListener('foo', fail)
  emitter.emit('foo')
})

function fail () {
  throw new Error('should not fire listener')
}
