[![TypeScript CI](https://github.com/WqyJh/markdownify-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/WqyJh/markdownify-ts/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/@wqyjh/markdownify)](https://www.npmjs.com/package/@wqyjh/markdownify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

# Markdownify TS

A TypeScript port of [python-markdownify](https://github.com/matthewwithanm/python-markdownify) - Convert HTML to Markdown.

## Installation

```bash
npm install @wqyjh/markdownify
```

## Usage

Convert some HTML to Markdown:

```typescript
import { markdownify } from '@wqyjh/markdownify';

const result = markdownify('<b>Yay</b> <a href="http://github.com">GitHub</a>');
// Result: '**Yay** [GitHub](http://github.com)'
```

Specify tags to exclude:

```typescript
import { markdownify } from '@wqyjh/markdownify';

const result = markdownify('<b>Yay</b> <a href="http://github.com">GitHub</a>', { strip: ['a'] });
// Result: '**Yay** GitHub'
```

...or specify the tags you want to include:

```typescript
import { markdownify } from '@wqyjh/markdownify';

const result = markdownify('<b>Yay</b> <a href="http://github.com">GitHub</a>', { convert: ['b'] });
// Result: '**Yay** GitHub'
```

## Options

Markdownify supports the following options:

**strip**
A list of tags to strip. This option can't be used with the `convert` option.

**convert**
A list of tags to convert. This option can't be used with the `strip` option.

**autolinks**
A boolean indicating whether the "automatic link" style should be used when a `a` tag's contents match its href. Defaults to `true`.

**default_title**
A boolean to enable setting the title of a link to its href, if no title is given. Defaults to `false`.

**heading_style**
Defines how headings should be converted. Accepted values are `ATX`, `ATX_CLOSED`, `SETEXT`, and `UNDERLINED` (which is an alias for `SETEXT`). Defaults to `UNDERLINED`.

**bullets**
An iterable (string, list, or tuple) of bullet styles to be used. If the iterable only contains one item, it will be used regardless of how deeply lists are nested. Otherwise, the bullet will alternate based on nesting level. Defaults to `'*+-'`.

**strong_em_symbol**
In markdown, both `*` and `_` are used to encode **strong** or *emphasized* texts. Either of these symbols can be chosen by the options `ASTERISK` (default) or `UNDERSCORE` respectively.

**sub_symbol, sup_symbol**
Define the chars that surround `<sub>` and `<sup>` text. Defaults to an empty string, because this is non-standard behavior. Could be something like `~` and `^` to result in `~sub~` and `^sup^`. If the value starts with `<` and ends with `>`, it is treated as an HTML tag and a `/` is inserted after the `<` in the string used after the text; this allows specifying `<sub>` to use raw HTML in the output for subscripts, for example.

**newline_style**
Defines the style of marking linebreaks (`<br>`) in markdown. The default value `SPACES` of this option will adopt the usual two spaces and a newline, while `BACKSLASH` will convert a linebreak to `\n` (a backslash and a newline). While the latter convention is non-standard, it is commonly preferred and supported by a lot of interpreters.

**code_language**
Defines the language that should be assumed for all `<pre>` sections. Useful, if all code on a page is in the same programming language and should be annotated with ` ```python ` or similar. Defaults to `''` (empty string) and can be any string.

**code_language_callback**
When the HTML code contains `<pre>` tags that in some way provide the code language, for example as class, this callback can be used to extract the language from the tag and prefix it to the converted `<pre>` tag. The callback gets one single argument, a HTMLElement object, and returns a string containing the code language, or `null`. An example to use the class name as code language could be:

```typescript
const options = {
  code_language_callback: (el) => el.getAttribute('class')?.split(' ')[0] || null
};
```

**escape_asterisks**
If set to `false`, do not escape `*` to `\*` in text. Defaults to `true`.

**escape_underscores**
If set to `false`, do not escape `_` to `\_` in text. Defaults to `true`.

**escape_misc**
If set to `true`, escape miscellaneous punctuation characters that sometimes have Markdown significance in text. Defaults to `false`.

**keep_inline_images_in**
Images are converted to their alt-text when the images are located inside headlines or table cells. If some inline images should be converted to markdown images instead, this option can be set to a list of parent tags that should be allowed to contain inline images, for example `['td']`. Defaults to an empty list.

**table_infer_header**
Controls handling of tables with no header row (as indicated by `<thead>` or `<th>`). When set to `true`, the first body row is used as the header row. Defaults to `false`, which leaves the header row empty.

**wrap, wrap_width**
If `wrap` is set to `true`, all text paragraphs are wrapped at `wrap_width` characters. Defaults to `false` and `80`. Use with `newline_style=BACKSLASH` to keep line breaks in paragraphs. A `wrap_width` value of `null` reflows lines to unlimited line length.

**strip_document**
Controls whether leading and/or trailing separation newlines are removed from the final converted document. Supported values are `LSTRIP` (leading), `RSTRIP` (trailing), `STRIP` (both), and `null` (neither). Newlines within the document are unaffected. Defaults to `STRIP`.

**strip_pre**
Controls whether leading/trailing blank lines are removed from `<pre>` tags. Supported values are `STRIP` (all leading/trailing blank lines), `STRIP_ONE` (one leading/trailing blank line), and `null` (neither). Defaults to `STRIP`.

## Creating Custom Converters

If you have a special usecase that calls for a special conversion, you can always inherit from `MarkdownConverter` and override the method you want to change. The function that handles a HTML tag named `abc` is called `convert_abc(el, text, parent_tags)` and returns a string containing the converted HTML tag. The `MarkdownConverter` object will handle the conversion based on the function names:

```typescript
import { MarkdownConverter } from '@wqyjh/markdownify';

class ImageBlockConverter extends MarkdownConverter {
  /**
   * Create a custom MarkdownConverter that adds two newlines after an image
   */
  convert_img(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return super.convert_img(el, text, parent_tags) + '\n\n';
  }
}

// Create shorthand method for conversion
function md(html: string, options = {}) {
  return new ImageBlockConverter(options).convert(html);
}
```

```typescript
import { MarkdownConverter } from '@wqyjh/markdownify';

class IgnoreParagraphsConverter extends MarkdownConverter {
  /**
   * Create a custom MarkdownConverter that ignores paragraphs
   */
  convert_p(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '';
  }
}

// Create shorthand method for conversion
function md(html: string, options = {}) {
  return new IgnoreParagraphsConverter(options).convert(html);
}
```

## Command Line Interface

Use `npx @wqyjh/markdownify example.html > example.md` or pipe input from stdin (`cat example.html | npx @wqyjh/markdownify > example.md`). Call `npx @wqyjh/markdownify -h` to see all available options. They are the same as listed above and take the same arguments.

## Development

To run tests and the linter:

```bash
npm install
npm test
npm run lint
npm run build
```

## License

MIT