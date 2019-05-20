#!/usr/bin/env node

const getStdin = require('get-stdin');
const { argv } = require('yargs');
const nghtml2pug = require('./');
const { version } = require('../package.json');

/**
 * Create a help page
 */
const help = [
  '\n  Usage: html2pug [options] < [file]\n',
  '  Options:\n',
  '    -t, --tabs              Use tabs instead of spaces',
  '    -d, --doubleQuotes      Use double quotes',
  '    -h, --help              Show this page',
  '    -v, --version           Show version\n',
  '  Examples:\n',
  '    # Accept input from file and write to stdout',
  '    $ html2pug < example.html\n',
  '    # Or write to a file',
  '    $ html2pug < example.html > example.pug \n',
].join('\n');

/**
 * Convert HTML from stdin to Pug
 */
async function main({ needsHelp, showVersion, useTabs, useDoubleQuotes }) {
  /* eslint-disable no-console */
  const stdin = await getStdin();

  if (showVersion) {
    return console.log(version);
  }

  if (needsHelp || !stdin) {
    return console.log(help);
  }

  const pug = nghtml2pug(stdin, { useTabs, useDoubleQuotes });
  return console.log(pug);

  /* eslint-enable no-console */
}

/**
 * Get the CLI options and run program
 */
main({
  needsHelp: !!(argv.help || argv.h),
  showVersion: !!(argv.version || argv.v),
  useTabs: !!(argv.tabs || argv.t),
  useDoubleQuotes: !!(argv.doubleQuotes || argv.d),
}).then(() => {
  process.exit(0);
});
