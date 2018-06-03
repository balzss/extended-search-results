module.exports = {
  "env": {
    "webextensions": true,
    "browser": true,
    "commonjs": true,
    "es6": true,
    "jquery": true
  },
  "globals": {
    "chrome": true,
    "defaultConfig": true,
  },
  "extends": "standard",
  "rules": {
    "semi": ["error", "always"],
    "one-var": "off",
    "no-var": "error",
    "max-len": [
      "warn", 120
    ],
    "id-length": [
      "error", {
        "min": 2,
        "max": 32,
        "exceptions": ["i", "j", "k", "x", "y", "n", "e"]
      }
    ],
    "array-bracket-spacing": [
      "error", "never"
    ],
    "arrow-parens": [
      "error", "as-needed"
    ],
    "arrow-spacing": [
      "error", {
        "after": true,
        "before": true
      }
    ],
    "callback-return": "off", //?
    "camelcase": "error",
    "capitalized-comments": "warn",
    "class-methods-use-this": "error",
    "comma-dangle": "error",
    "comma-spacing": [
      "error", {
        "after": true,
        "before": false
      }
    ],
    "indent": ["error", 4]
  }
};
