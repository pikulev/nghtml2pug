### IMPORTANT: PEER DEPENDENCY
It uses Angular HTML parser from `"@angular/compiler": "^7.2.15"`.
So *there is a peer dependency*, make sure you have it installed.


# nghtml2pug
[![Build Status](https://travis-ci.org/pikulev/nghtml2pug.svg?branch=master)](https://travis-ci.org/pikulev/nghtml2pug)

Converts angular **HTML** templates to **Pug** templating language (_formerly Jade_).

<p align="center">
  <img src="https://raw.githubusercontent.com/pikulev/nghtml2pug/master/repo_files/cover.png" alt="nghtml2pug">
</p>

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
npm i nghtml2pug
```

In case your project doesn't have `@angular/compiler`
```bash
npm i @angular/compiler
```

## Usage

### CLI using NPX
Accept input from a file or stdin and write to stdout:

```bash
# choose a file
npx nghtml2pug < example.html

# use pipe
echo '<h1>foo</h1>' | npx nghtml2pug
```

Write output to a file:
```bash
npx nghtml2pug < example.html > example.pug
```

`npx nghtml2pug -- --help` for more information.

### Programmatically

```js
const ngHTML2Pug = require('nghtml2pug')

const html = '<tg-template #title><h1>Hello World!</h1></ng-template>'
const pug = ngHTML2Pug(html, { useTabs: true })
```

### Options

Name | Type | Default | Description
--- | --- | --- | ---
useTabs | Boolean | `false` | Use tabs instead of spaces
useDoubleQuotes | Boolean | `false` | Use double quotes instead of single quotes
