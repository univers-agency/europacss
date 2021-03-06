"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseRFSQuery;

var _parseRFS = _interopRequireDefault(require("./parseRFS"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseRFSQuery(node, config, fontSizeQuery, lineHeight, breakpoint) {
  fontSizeQuery = fontSizeQuery.match(/between\((.*)\)/)[1];
  const fontSize = fontSizeQuery;
  const renderedFontSize = (0, _parseRFS.default)(node, config, fontSize, breakpoint);
  return { ...{
      'font-size': renderedFontSize
    },
    ...(lineHeight && {
      'line-height': lineHeight
    })
  };
}