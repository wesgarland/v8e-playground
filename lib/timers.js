/**
 * @file     timers.js - basic implementation of timers for v8e-playground.
 * @author   Wes Garland, wes@distributive.network
 * @date     Aug 2024
 */
'use strict';

globalThis.__timers = (function __timers() {
  const timers = [ { when: Number.MAX_SAFE_INTEGER } ];
  const recurringCookie = {};
  var firingMutex = false;

  function schedule()
  {
    if (firingMutex)
      return;

    if (timers.length === 0)
    {
      if (globalThis.__timers.die) /* no timers + main done => exit */
        globalThis.__timers.die();
      nextTimer(0);
      return;
    }

    timers.sort((a, b) => a.when - b.when);
    nextTimer(timers[0].when);
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
    const now = Date.now();

    firingMutex = true;
    while(timers.length && (!timers[0].when || timers[0].when <= now))
      timers[0].fire();

    firingMutex = false;
    schedule();
  }

  function Timer(when, what, args)
  {
    this.when = when;
    this.what = what;
    this.args = args;
  }

  Timer.prototype.fire = function Timer$$fire()
  {
    if (typeof this.what !== 'string')
      this.what.apply(globalThis, this.args);
    else
    {
      const indirectEval = eval;
      indirectEval(what);
    }

    if (!this.hasOwnProperty('recurring'))
      remove(this);
    else
      this.when = Date.now() + this.recurring;
  }

  globalThis.setTimeout = function setTimeout(what, delay, ...args)
  {
    if (delay < 4)
      delay = 4;
    const when = Date.now() + delay;
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
  }

  globalThis.setImmediate = function setImmediate(what)
  {
    const timer = new Timer(1 + timers.length, what);
    add(timer);
    nextTimer(); /* fire "now" */
    return timer;
  }

  globalThis.clearImmediate = globalThis.clearTimeout = globalThis.clearInterval;
  return __timers;
})();
