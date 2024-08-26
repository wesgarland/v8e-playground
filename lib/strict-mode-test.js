/**
 * @file      strict-mode-test.js - helper for strict-mode.test.v8e
 * @author    Wes Garland
 * @date      Aug 2024
 */
'use strict';

function mutator_strict(abc)
{
  arguments[0] = 123;
  return abc;
}
