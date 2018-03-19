module.exports = {
  extends: ['airbnb-base', 'plugin:security/recommended'],
  env: {
    browser: true,
    node: true,
    jest: true,
    es6: true,
  },
  rules: {
    semi: 0,
    indent: 0,
    'arrow-parens': 0,
    'no-confusing-arrow': 0,
  },
  plugins: ['security'],
}
