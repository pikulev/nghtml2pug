const { HtmlParser } = require('@angular/compiler/src/ml_parser/html_parser');

let parser = null;

const getParser = () => {
  if (!parser) {
    parser = new HtmlParser();
  }
  return parser;
};

module.exports = function parse(
  input,
  { canSelfClose = false, allowHtmComponentClosingTags = false, isTagNameCaseSensitive = false } = {},
) {
  return getParser().parse(
    input,
    'angular-html-parser',
    false,
    undefined,
    canSelfClose,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
  );
};
