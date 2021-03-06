"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sizeNeedsBreakpoints;

var _lodash = _interopRequireDefault(require("lodash"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sizeNeedsBreakpoints(spacingMap, size) {
  // Zero stays the same across all breakpoints
  if (size === 0 || size === '0') {
    return false;
  } // Fractions should have breakpoints cause of gutters


  if (size.indexOf('/') !== -1) {
    return true;
  } // Size is in spacing map, we need breakpoints


  if (_lodash.default.has(spacingMap, size)) {
    return true;
  } // regular numbers are treated as gutter multipliers/dividers, and
  // these differ per breakpoint.


  return true;
}