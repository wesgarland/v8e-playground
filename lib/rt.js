/**
 * @file     rt.v8e - Basic runtime for .v8e files. Runs the function main, handles errors, etc.
 * @author   Wes Garland, wes@distributive.network
 * @date     Aug 2024
 */
'use strict'

function __startV8eRuntime()
{
  if (typeof main !== 'function')
    throw new Error(`main is not a function (${String(main)})`);
  __funWrapper(main);
}

function __funWrapper(fun)
{
  try
  {
    const result = fun();
    if (!(result instanceof Promise))
      die(typeof test === 'function' && test.seenFailure);
    else
    {
      result.catch(error => {
        writeln('*** Unhandled Rejection: ' + error?.stack ? error.stack : String(error));
      }).finally(() => die(true));
    }
  }
  catch(error)
  {
    writeln('*** Uncaught Exception: ' + error?.stack ? error.stack : String(error));
    die(true);
  }
}

ontimer(__startV8eRuntime);
nextTimer(1);
