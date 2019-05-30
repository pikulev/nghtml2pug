# nghtml2pug
Converts angular **HTML** templates to **Pug** templating language (_formerly Jade_).

## Important
It uses Angular HTML parser from `"@angular/compiler": "^7.2.15"`.
So _there is a peer dependency_, make sure you have it installed.

Turns this :unamused:
```html
<ng-container *ngFor="lel item of items; let i = index">
  <span class="icon"></span> {{ i + 1}}.{{ item }}
</ng-container>
```

Into this :tada:
```pug
ng-container(*ngFor='lel item of items; let i = index')
  span.icon
  |  {{ i + 1}}.{{ item }}
```

## Install

Get it on [npm](https://www.npmjs.com/package/nghtml2pug):

```bash
npm install -g nghtml2pug
```

## Usage

### CLI
Accept input from a file or stdin and write to stdout:

```bash
# choose a file
nghtml2pug < example.html

# use pipe
echo '<h1>foo</h1>' | nghtml2pug -f
```

Write output to a file:
```bash
nghtml2pug < example.html > example.pug
```

See `nghtml2pug --help` for more information.

### Programmatically

```js
const ngHTML2Pug = require('nghtml2pug')

const html = '<header><h1 class="title">Hello World!</h1></header>'
const pug = ngHTML2Pug(html, { useTabs: true })
```

### Options

Name | Type | Default | Description
--- | --- | --- | ---
useTabs | Boolean | `false` | Use tabs instead of spaces
useDoubleQuotes | Boolean | `false` | Use double quotes instead of single quotes
