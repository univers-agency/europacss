"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveConfig;

var _mergeWith = _interopRequireDefault(require("lodash/mergeWith"));

var _isFunction = _interopRequireDefault(require("lodash/isFunction"));

var _defaults = _interopRequireDefault(require("lodash/defaults"));

var _map = _interopRequireDefault(require("lodash/map"));

var _toPath = _interopRequireDefault(require("lodash/toPath"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const configUtils = {
  negative(scale) {
    return Object.keys(scale).filter(key => scale[key] !== '0').reduce((negativeScale, key) => ({ ...negativeScale,
      [`-${key}`]: `-${scale[key]}`
    }), {});
  }

};

function value(valueToResolve, ...args) {
  return (0, _isFunction.default)(valueToResolve) ? valueToResolve(...args) : valueToResolve;
}

function mergeExtensions({
  extend,
  ...theme
}) {
  return (0, _mergeWith.default)(theme, extend, (themeValue, extensions) => {
    if (!(0, _isFunction.default)(themeValue) && !(0, _isFunction.default)(extensions)) {
      return { ...themeValue,
        ...extensions
      };
    }

    return (resolveThemePath, utils) => ({ ...value(themeValue, resolveThemePath, utils),
      ...value(extensions, resolveThemePath, utils)
    });
  });
}

function resolveFunctionKeys(object) {
  const resolveThemePath = (key, defaultValue) => {
    const path = (0, _toPath.default)(key);
    let index = 0;
    let val = object;

    while (val !== undefined && val !== null && index < path.length) {
      val = val[path[index++]];
      val = (0, _isFunction.default)(val) ? val(resolveThemePath) : val;
    }

    return val === undefined ? defaultValue : val;
  };

  return Object.keys(object).reduce((resolved, key) => {
    return { ...resolved,
      [key]: (0, _isFunction.default)(object[key]) ? object[key](resolveThemePath, configUtils) : object[key]
    };
  }, {});
}

function resolveConfig(configs) {
  return (0, _defaults.default)({
    theme: resolveFunctionKeys(mergeExtensions((0, _defaults.default)({}, ...(0, _map.default)(configs, 'theme'))))
  }, ...configs);
}