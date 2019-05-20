import test from 'ava';
import nghtml2pug from './src';

test('transforms html document to pug with default options', t => {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hello World!</title>
  </head>
  <body data-page="home">
    <header id="nav">
      <h1 class="heading">Hello, world!</h1>
    </header>
  </body>
</html>`;

  const pug = `html(lang='en')
  head
    meta(charset='utf-8')
    title Hello World!
  body(data-page='home')
    header#nav
      h1.heading Hello, world!`;

  const generated = nghtml2pug(html);
  t.is(generated, pug);
});

test('result contains no outer html element when fragment is truthy', t => {
  const generated = nghtml2pug('<h1>Hello World!</h1>');
  t.falsy(generated.startsWith('html'));
});

test('ignore whitespace within elements', t => {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <style type="text/css">
* {
  margin: 0;
  padding: 0;
}
    </style>
  </head>
  <body>
    <script type="text/javascript">
$(document).ready(function() {
  console.log('ready')
})
    </script>
  </body>
</html>`;

  const pug = `html(lang='en')
  head
    style(type='text/css').
      * {
        margin: 0;
        padding: 0;
      }
  body
    script(type='text/javascript').
      $(document).ready(function() {
        console.log('ready')
      })`;

  const generated = nghtml2pug(html);
  t.is(generated, pug);
});

test('creates multiline block when linebreaks are present', t => {
  const html = '<textarea>multi\nline\nstring</textarea>';
  const pug = `textarea.
  multi
  line
  string`;

  const generated = nghtml2pug(html);
  t.is(generated, pug);
});

test('uses div tag shorthand when id/class is present', t => {
  const html = "<div id='foo' class='bar'>baz</div>";
  const pug = '#foo.bar baz';

  const generated = nghtml2pug(html);
  t.is(generated, pug);
});

test('removes whitespace between HTML elements', t => {
  const html = `<ul class="list">
  <li>one</li>
  <li>two</li>

  <li>three</li>


  <li>four</li>
</ul>`;

  const pug = `ul.list
  li one
  li two
  li three
  li four`;

  const generated = nghtml2pug(html);
  t.is(generated, pug);
});

test('does not fail on unicode characters', t => {
  const generated = nghtml2pug('<h1 class="accents">â, é, ï, õ, ù</h1>', {});
  const expected = 'h1.accents â, é, ï, õ, ù';

  t.is(generated, expected);
});

test('uses tabs when tabs is truthy', t => {
  const generated = nghtml2pug('<div><span>Tabs!</span></div>', {
    useTabs: true,
  });
  const expected = 'div\n\tspan Tabs!';

  t.is(generated, expected);
});

test('uses a comma to separate attributes', t => {
  const generated = nghtml2pug('<input type="text" name="foo" />', {});
  const expected = "input(type='text', name='foo')";

  t.is(generated, expected);
});

test('uses a space to separate attributes', t => {
  const generated = nghtml2pug('<input type="text" name="foo" />', {
    useCommas: false,
  });
  const expected = "input(type='text' name='foo')";

  t.is(generated, expected);
});

test('uses double quotes for attribute values', t => {
  const generated = nghtml2pug('<input type="text" name="foo" />', {
    useDoubleQuotes: true,
  });
  const expected = 'input(type="text", name="foo")';

  t.is(generated, expected);
});

test('single quotes in attribute values are escaped', t => {
  const generated = nghtml2pug(`<button aria-label="closin&apos;" onclick="window.alert('bye')">close</button>`, {});
  const expected = `button(aria-label='closin\\'', onclick='window.alert(\\'bye\\')') close`;

  t.is(generated, expected);
});

test('collapses boolean attributes', t => {
  const generated = nghtml2pug(`<input type="text" name="foo" disabled="disabled" readonly="readonly" />`, {});
  const expected = `input(type='text', name='foo', disabled, readonly)`;

  t.is(generated, expected);
});

test('replace last space to HTML space symbol', t => {
  const generated = nghtml2pug(`<span><b>From</b> should be less than <b>To</b></span>`);
  const expected = `span
  b From
  |  should be less than&#32;
  b To`;

  t.is(generated, expected);
});
