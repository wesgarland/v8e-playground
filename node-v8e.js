/**
 * @file     node-v8e.js - Node.js implementations of the functions provided by dcp-evaluator-v8. Use
 *                         node -r to load this module before trying to debug your v8e code.
 *
 *                         Example: /opt/dcp/bin/node -r ./node-v8e ./smoke.v8e
 *
 * @author   Wes Garland, wes@distributive.network
 * @date     Aug 2024
 */
'use strict';
const fs = require('fs');
const vm = require('vm');

delete globalThis.setTimeout;
delete globalThis.clearTimeout;
delete globalThis.setInterval;
delete globalThis.clearInterval;
delete globalThis.setImmediate;
delete globalThis.clearImmediate;

/* Implement ontimer() */
globalThis.ontimer = (callback) => {
  globalThis.ontimer.callback = callback;
}

/* Implement nextTimer() */
globalThis.nextTimer = function nextTimer(when)
{
  const nodeTimers = require('timers');

  nodeTimers.clearTimeout(nextTimer.hnd);
  nodeTimers.clearImmediate(nextTimer.hnd);
  if (when === 0)
    return;

  const interval = when - Date.now();
  if (!interval || interval <= 0)
    nextTimer.hnd = nodeTimers.setImmediate(globalThis.ontimer.callback);
  else
    nextTimer.hnd = nodeTimers.setTimeout(globalThis.ontimer.callback, interval);
}

/* Implement die() */
globalThis.die = () => process.exit(0);

/* Implement writeln() */
globalThis.writeln = (string) => process.stdout.write(`${string}\n`);

/* implement onreadln */
globalThis.onreadln = (callback) => {
  globalThis.onreadln.callback = callback;
};
globalThis.onreadln.callback = function defaultReadlnCallback() {
  /* throw new Error('onreadln callback not specified'); */
  return;
};
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
  terminal: false,
});
rl.on('line', (line) => globalThis.onreadln.callback(line) );
process.stdin.ref();

/* simulate processing -f from shebang */
const script = fs.readFileSync(process.argv[1], 'utf-8');
const shebang = script.split('\n')[0];
if (shebang.length > 127)
  console.warn('warning: shebang line is ${shebang.length} bytes long');
if (!shebang.startsWith('#! /usr/bin/env -S'))
  console.warn('warning: .v8e programs should use #! /usr/bin/env -S to start the dcp-evaluator');
const opts = shebang.split(' ');
while (opts.length)
{
  const opt = opts.shift();
  if (opt === '-f')
  {
    const filename = opts.shift();
    vm.runInThisContext(fs.readFileSync(filename, 'utf-8'), { filename });
  }
  else if (opt === '--webgpu')
    console.warn('Warning: webgpu not implemented in Node.js');
}

/* Simulate start-up banner */
writeln('Running "dcp-evaluator", node.js emulation...');
writeln('Evaluating (press Ctrl+C to quit)...');
