'use strict'

module.exports = addSecretListener

addSecretListener.prepend = function (target, type, listener) {
  addSecretListener(target, type, listener, true)
}

function addSecretListener (target, type, listener, prepend) {
  let events = target._events

  if (events === undefined) {
    events = target._events = Object.create(null)
    target._eventsCount = 0
  }

  const existing = events[type]

  if (existing === undefined) {
    events[type] = listener
    target._eventsCount++
  } else {
    if (typeof existing === 'function') {
      events[type] = prepend ? [listener, existing] : [existing, listener]
    } else if (prepend) {
      existing.unshift(listener)
    } else {
      existing.push(listener)
    }
  }
}
