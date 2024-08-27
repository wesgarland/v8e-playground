/**
 * @file     test.js - Collection of utilities for writing unit tests with v8e-playground
 * @author   Wes Garland, wes@distributive.network
 * @date     Aug 2024
 */

function test(text, value, expected)
{
  var s;

  if (arguments.length === 2)
    expected = true;

  if (value === expected)
    s = `\u001b[32m . Pass:\u001b[0m`;
  else
  {
    s = `\u001b[31m * Fail:\u001b[0m`;
    test.seenFailure = true;
  }
  console.log(s, text, `(${String(value)})`);
}
