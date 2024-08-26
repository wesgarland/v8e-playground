/**
 * @file     timers.js - basic implementation of timers for v8e-playground.
 * @author   Wes Garland, wes@distributive.network
 * @date     Aug 2024
 */
'use strict';

globalThis.__timers = (function __timers() {
  const timers = [];
  const recurringCookie = {};

  function schedule()
  {
    if (timers.length === 0)
    {
      if (globalThis.__timers.die) /* no timers + main done => exit */
        globalThis.__timers.die();
      return;
    }

    timers.sort((a, b) => a.when - b.when);
    const interval = timers[0].when - Date.now();
    if (interval > 1)
      nextTimer(interval);
    else
      nextTimer(1);
    ontimer(fireNext);
  }

  function add(timer)
  {
    timers.push(timer);
    schedule();
  }

  function remove(timer)
  {
    for (let i=0; i < timers.length; i++)
    {
      if (timers[i] === timer)
      {
        timers.splice(i, 1);
        break;
      }
    }
    schedule();
  }

  function fireNext()
  {
    while(timers.length && timers[0].when <= Date.now())
      timers[0].fire();
    schedule();
  }
  
  function Timer(when, what, args, that)
  {
    this.when = when || Date.now();
    this.what = what;
    this.args = args;
  }

  Timer.prototype.fire = function Timer$$fire()
  {
    if (typeof this.what === 'string')
    {
      const indirectEval = eval;
      indirectEval(what);
      return;
    }

    this.what.apply(globalThis, this.args);
    if (!this.hasOwnProperty('recurring'))
      remove(this);
    else
    {
      this.when = Date.now() + this.recurring;
      schedule(this);
    }
  }

  globalThis.setTimeout =function setTimeout(what, delay, ...args)
  {
    const when = (Date.now() || 0) + delay;
    const timer = new Timer(when, what, args);
    add(timer);
    return timer;
  }

  globalThis.setInterval = function setInterval(what, delay, ...args)
  {
    const timer = globalThis.setTimeout.apply(this, arguments);
    timer.recurring = delay;
    return timer;
  }

  globalThis.clearInterval = function clearInterval(timer)
  {
    remove(timer);
    schedule();
  }

  globalThis.setImmediate = function setImmediate(what)
  {
    globalThis.setTimeout(what, 0);
  }
  
  globalThis.clearImmediate = globalThis.clearTimeout = globalThis.clearInterval;
  return __timers;
})();
