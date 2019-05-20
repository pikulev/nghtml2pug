const { minify } = require('html-minifier');
const parse = require('./ng.parser');
const Pugify = require('./parser');

const defaultOptions = {
  // nghtml2pug options
  useTabs: false,
  useCommas: true,

  // html-minifier options
  caseSensitive: true,
  removeEmptyAttributes: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  preserveLineBreaks: false,

  // ng parser options
  canSelfClose: false,
  allowHtmComponentClosingTags: false,
  isTagNameCaseSensitive: false,
};

module.exports = (sourceHtml, options = {}) => {
  const opts = { ...defaultOptions, ...options };

  // Parse HTML template
  const html = minify(sourceHtml, opts);
  const ast = parse(html, opts);

  // Convert to Pug
  const pugify = new Pugify(ast, opts);
  return pugify.parse();
};
