const { Comment, Text } = require('@angular/compiler/src/ml_parser/ast');

const DIV_NODE = 'div';
const COMMENT_NODE_PUG = '//';

const hasSingleTextNodeChild = node => {
  return node.children && node.children.length === 1 && node.children[0] instanceof Text && node.children[0].value;
};

class Parser {
  constructor(root, options = {}) {
    this.pug = '';
    this.root = root;

    const { useTabs, useCommas, useDoubleQuotes } = options;

    // Tabs or spaces
    this.indentStyle = useTabs ? '\t' : '  ';
    // Comma separate attributes
    this.separatorStyle = useCommas ? ', ' : ' ';
    // Single quotes or double
    this.quoteStyle = useDoubleQuotes ? '"' : "'";
  }

  getIndent(level = 0) {
    return this.indentStyle.repeat(level);
  }

  parse() {
    const walk = this.walk(this.root.rootNodes, 0);
    let it;

    do {
      it = walk.next();
    } while (!it.done);

    return this.pug.substring(1);
  }

  /**
   * DOM tree traversal
   * Depth-first search (pre-order)
   *
   * @param {DOM} tree - DOM tree or Node
   * @param {Number} level - Current tree level
   */
  *walk(tree, level) {
    if (!tree) {
      return;
    }

    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];

      const newline = this.parseNode(node, level);
      if (newline) {
        this.pug += `\n${newline}`;
      }

      if (node.children && node.children.length > 0 && !hasSingleTextNodeChild(node)) {
        yield* this.walk(node.children, level + 1);
      }
    }
  }

  /*
   * Returns a Pug node name with all attributes set in parentheses.
   */
  getNodeWithAttributes(node) {
    const { name, attrs } = node;
    const attributes = [];
    let pugNode = name;

    if (!attrs) {
      return pugNode;
    }

    // Add CSS selectors to pug node and append any element attributes to it
    for (const attr of attrs) {
      const { name, value } = attr;

      // Remove div tag if a selector is present (shorthand)
      // e.g. div#form() -> #form()
      const hasSelector = name === 'id' || name === 'class';
      if (pugNode === DIV_NODE && hasSelector) {
        pugNode = pugNode.replace(DIV_NODE, '');
      }

      switch (name) {
        case 'id':
          pugNode += `#${value}`;
          break;
        case 'class':
          pugNode += `.${value.split(' ').join('.')}`;
          break;
        default: {
          // Add escaped single quotes (\') to attribute values
          const val = value.replace(/'/g, "\\'");
          const quote = this.quoteStyle;
          attributes.push(val ? `${name}=${quote}${val}${quote}` : name);
          break;
        }
      }
    }

    if (attributes.length) {
      pugNode += `(${attributes.join(this.separatorStyle)})`;
    }

    return pugNode;
  }

  /**
   * formatPugNode applies the correct indent for the current line,
   * and formats the value as either as a single or multiline string.
   *
   * @param {String} node - The pug node (e.g. header(class='foo'))
   * @param {String} value - The node's value
   * @param {Number} level - Current tree level to generate indent
   * @param {String} blockChar - The character used to denote a multiline value
   */
  formatPugNode(node, value = '', level, blockChar = '.') {
    const indent = this.getIndent(level);
    const result = `${indent}${node}`;

    const lines = value.split('\n');

    // Create an inline node
    if (lines.length <= 1) {
      return value.length ? `${result} ${value}` : result;
    }

    // Create a multiline node
    const indentChild = this.getIndent(level + 1);
    const multiline = lines.map(line => `${indentChild}${line}`).join('\n');

    return `${result}${blockChar}\n${multiline}`;
  }

  /**
   * createComment formats a #comment element.
   *
   * Block comments in Pug don't require the dot '.' character.
   */
  createComment(node, level) {
    return this.formatPugNode(COMMENT_NODE_PUG, node.value, level, '');
  }

  /**
   * createText formats a #text element.
   *
   * A #text element containing only line breaks (\n) indicates
   * unnecessary whitespace between elements that should be removed.
   *
   * Actual text in a single #text element has no significant
   * whitespace and should be treated as inline text.
   */
  createText(node, level) {
    const { value } = node;
    const indent = this.getIndent(level);

    // Omit line breaks between HTML elements and extra white spaces
    if (/^(\n|\s+)+$/.test(value)) {
      return false;
    }

    // Replace leading space with HTML symbol
    const html = value.replace(/\s$/, '&#32;');

    return `${indent}| ${html}`;
  }

  /**
   * createElement formats a generic HTML element.
   */
  createElement(node, level) {
    const pugNode = this.getNodeWithAttributes(node);

    const value = hasSingleTextNodeChild(node) ? node.children[0].value : node.value;

    return this.formatPugNode(pugNode, value, level);
  }

  parseNode(node, level) {
    switch (true) {
      case node instanceof Comment:
        return this.createComment(node, level);

      case node instanceof Text:
        return this.createText(node, level);

      default:
        return this.createElement(node, level);
    }
  }
}

module.exports = Parser;
