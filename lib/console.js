/**
 * @file      console.v8e - Simple implementation of console object for bare-metal dcp-evaluator
 * @author    Wes Garland
 * @date      Aug 2024
 */
'use strict';

const console = {};

try
{
  function consoleLog()
  {
    if (consoleLog.inFixup)
    {
      writeln('*** detected re-entrant call to consoleLog at ' + new Error().stack);
      die(true);
    }
    else
    {
      consoleLog.inFixup = true;
      writeln(Array.from(arguments).map(fixup).join(' '));
      consoleLog.inFixup = false;
    }
  }

  function fixup(element)
  {
    switch(typeof element)
    {
      default: return String(element);
      case 'boolean':
      case 'number':    return `\u001b[33m${element}\u001b[0m`;
      case 'undefined': return `\u001b[90m${element}\u001b[0m`;
      case 'object':
      {
        let disp;

        if (Array.isArray(element))
          return `[ ${element.join(', ')} ]`;
        else if (element instanceof Error)
          return element.stack;
        else if (element instanceof Date)
          return `\u001b[5m${element.toISOString()}\u001b[0m`;
        else if (element.constructor === Object)
          disp = JSON.stringify(element);
        else
          disp = String(element);

        if (disp === '[object Object]' && element.constructor.name)
          disp = `[object ${element.constructor.name}]`;

        return `\u001b[90m${disp}\u001b[0m`;
      }
    }
  }

  console.log = console.debug = console.info = console.warn = console.error = consoleLog;
}
catch(error)
{
  writeln(' * fatal error loading console.v8e: ' + error.stack);
  die();
}

globalThis.console = console;
