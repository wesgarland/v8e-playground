/**
 * @file      webgpu-requirements.js - define setImmediate needed for webgpu to run
 * @author    Ryan Saweczko
 * @date      Aug 2024
 */
'use strict';

const pt0 = new Date().getTime(); 
globalThis.performance = {
  now: () => new Date().getTime() - pt0,
}

const events = [];

ontimer(fireTimerCallbacks);
function fireTimerCallbacks()
{
  let callback = events.shift();
  callback();

  if (events.length)
    nextTimer(performance.now());
}

globalThis.setImmediate = function eventLoop$$Worker$setImmediate(callback, arg) {
  events.push(callback);
  nextTimer(performance.now());
  return true;
}


