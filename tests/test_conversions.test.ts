import { md } from './utils';
import { ATX, ATX_CLOSED, BACKSLASH, SPACES, UNDERSCORE } from '../src/types';

// test template for different inline tags
function inline_tests(tag: string, markup: string) {
  expect(md(`<${tag}>Hello</${tag}>`)).toBe(`${markup}Hello${markup}`);
  expect(md(`foo <${tag}>Hello</${tag}> bar`)).toBe(`foo ${markup}Hello${markup} bar`);
  expect(md(`foo<${tag}> Hello</${tag}> bar`)).toBe(`foo ${markup}Hello${markup} bar`);
  expect(md(`foo <${tag}>Hello </${tag}>bar`)).toBe(`foo ${markup}Hello${markup} bar`);
  expect(md(`foo <${tag}></${tag}> bar`)).toMatch(/foo  bar|foo bar/); // Either is OK
}

describe('Conversion Tests', () => {
  describe('test_a', () => {
    test('basic link', () => {
      expect(md('<a href="https://google.com">Google</a>')).toBe('[Google](https://google.com)');
    });

    test('autolink', () => {
      expect(md('<a href="https://google.com">https://google.com</a>')).toBe('<https://google.com>');
    });

    test('autolink with complex URL', () => {
      expect(md('<a href="https://community.kde.org/Get_Involved">https://community.kde.org/Get_Involved</a>'))
        .toBe('<https://community.kde.org/Get_Involved>');
    });

    test('autolink disabled', () => {
      expect(md('<a href="https://community.kde.org/Get_Involved">https://community.kde.org/Get_Involved</a>', { autolinks: false }))
        .toBe('[https://community.kde.org/Get\\_Involved](https://community.kde.org/Get_Involved)');
    });
  });

  describe('test_a_spaces', () => {
    test('link with spaces around', () => {
      expect(md('foo <a href="http://google.com">Google</a> bar')).toBe('foo [Google](http://google.com) bar');
    });

    test('link with space before tag', () => {
      expect(md('foo<a href="http://google.com"> Google</a> bar')).toBe('foo [Google](http://google.com) bar');
    });

    test('link with space after tag', () => {
      expect(md('foo <a href="http://google.com">Google </a>bar')).toBe('foo [Google](http://google.com) bar');
    });

    test('empty link', () => {
      expect(md('foo <a href="http://google.com"></a> bar')).toBe('foo  bar');
    });
  });

  describe('test_a_with_title', () => {
    test('link with title', () => {
      const text = md('<a href="http://google.com" title="The &quot;Goog&quot;">Google</a>');
      expect(text).toBe('[Google](http://google.com "The \\"Goog\\"")');
    });

    test('link with default title', () => {
      expect(md('<a href="https://google.com">https://google.com</a>', { default_title: true }))
        .toBe('[https://google.com](https://google.com "https://google.com")');
    });
  });

  describe('test_a_shortcut', () => {
    test('shortcut autolink', () => {
      const text = md('<a href="http://google.com">http://google.com</a>');
      expect(text).toBe('<http://google.com>');
    });
  });

  describe('test_a_no_autolinks', () => {
    test('no autolinks option', () => {
      expect(md('<a href="https://google.com">https://google.com</a>', { autolinks: false }))
        .toBe('[https://google.com](https://google.com)');
    });
  });

  describe('test_a_in_code', () => {
    test('link inside code', () => {
      expect(md('<code><a href="https://google.com">Google</a></code>')).toBe('`Google`');
    });

    test('link inside pre', () => {
      expect(md('<pre><a href="https://google.com">Google</a></pre>')).toBe('\n\n```\nGoogle\n```\n\n');
    });
  });

  describe('test_b', () => {
    test('bold tag', () => {
      expect(md('<b>Hello</b>')).toBe('**Hello**');
    });
  });

  describe('test_b_spaces', () => {
    test('bold with spaces around', () => {
      expect(md('foo <b>Hello</b> bar')).toBe('foo **Hello** bar');
    });

    test('bold with space before tag', () => {
      expect(md('foo<b> Hello</b> bar')).toBe('foo **Hello** bar');
    });

    test('bold with space after tag', () => {
      expect(md('foo <b>Hello </b>bar')).toBe('foo **Hello** bar');
    });

    test('empty bold', () => {
      expect(md('foo <b></b> bar')).toBe('foo  bar');
    });
  });

  describe('test_blockquote', () => {
    test('simple blockquote', () => {
      expect(md('<blockquote>Hello</blockquote>')).toBe('\n> Hello\n\n');
    });

    test('blockquote with newlines', () => {
      expect(md('<blockquote>\nHello\n</blockquote>')).toBe('\n> Hello\n\n');
    });

    test('blockquote with non-breaking space', () => {
      expect(md('<blockquote>&nbsp;Hello</blockquote>')).toBe('\n> \u00a0Hello\n\n');
    });
  });

  describe('test_blockquote_with_nested_paragraph', () => {
    test('blockquote with paragraph', () => {
      expect(md('<blockquote><p>Hello</p></blockquote>')).toBe('\n> Hello\n\n');
    });

    test('blockquote with multiple paragraphs', () => {
      expect(md('<blockquote><p>Hello</p><p>Hello again</p></blockquote>')).toBe('\n> Hello\n>\n> Hello again\n\n');
    });
  });

  describe('test_blockquote_with_paragraph', () => {
    test('blockquote followed by paragraph', () => {
      expect(md('<blockquote>Hello</blockquote><p>handsome</p>')).toBe('\n> Hello\n\nhandsome\n\n');
    });
  });

  describe('test_blockquote_nested', () => {
    test('nested blockquote', () => {
      const text = md('<blockquote>And she was like <blockquote>Hello</blockquote></blockquote>');
      expect(text).toBe('\n> And she was like\n> > Hello\n\n');
    });
  });

  describe('test_br', () => {
    test('line break with spaces', () => {
      expect(md('a<br />b<br />c')).toBe('a  \nb  \nc');
    });

    test('line break with backslash', () => {
      expect(md('a<br />b<br />c', { newline_style: BACKSLASH })).toBe('a\\\nb\\\nc');
    });

    test('line break in heading', () => {
      expect(md('<h1>foo<br />bar</h1>', { heading_style: ATX })).toBe('\n\n# foo bar\n\n');
    });

    test('line break in table cell', () => {
      expect(md('<td>foo<br />bar</td>', { heading_style: ATX })).toBe(' foo bar |');
    });
  });

  describe('test_code', () => {
    test('code inline', () => {
      inline_tests('code', '`');
    });

    test('code with asterisks and underscores', () => {
      expect(md('<code>*this_should_not_escape*</code>')).toBe('`*this_should_not_escape*`');
    });

    test('kbd with asterisks and underscores', () => {
      expect(md('<kbd>*this_should_not_escape*</kbd>')).toBe('`*this_should_not_escape*`');
    });

    test('samp with asterisks and underscores', () => {
      expect(md('<samp>*this_should_not_escape*</samp>')).toBe('`*this_should_not_escape*`');
    });

    test('code with nested span', () => {
      expect(md('<code><span>*this_should_not_escape*</span></code>')).toBe('`*this_should_not_escape*`');
    });

    test('code with multiple spaces', () => {
      expect(md('<code>this  should\t\tnormalize</code>')).toBe('`this should normalize`');
    });

    test('code with nested span and multiple spaces', () => {
      expect(md('<code><span>this  should\t\tnormalize</span></code>')).toBe('`this should normalize`');
    });

    test('code with nested bold', () => {
      expect(md('<code>foo<b>bar</b>baz</code>')).toBe('`foobarbaz`');
    });

    test('kbd with nested italic', () => {
      expect(md('<kbd>foo<i>bar</i>baz</kbd>')).toBe('`foobarbaz`');
    });

    test('samp with nested del', () => {
      expect(md('<samp>foo<del> bar </del>baz</samp>')).toBe('`foo bar baz`');
    });

    test('samp with nested del and spaces', () => {
      expect(md('<samp>foo <del>bar</del> baz</samp>')).toBe('`foo bar baz`');
    });

    test('code with nested em', () => {
      expect(md('<code>foo<em> bar </em>baz</code>')).toBe('`foo bar baz`');
    });

    test('code with nested code', () => {
      expect(md('<code>foo<code> bar </code>baz</code>')).toBe('`foo bar baz`');
    });

    test('code with nested strong', () => {
      expect(md('<code>foo<strong> bar </strong>baz</code>')).toBe('`foo bar baz`');
    });

    test('code with nested s', () => {
      expect(md('<code>foo<s> bar </s>baz</code>')).toBe('`foo bar baz`');
    });

    test('code with nested sup', () => {
      expect(md('<code>foo<sup>bar</sup>baz</code>', { sup_symbol: '^' })).toBe('`foobarbaz`');
    });

    test('code with nested sub', () => {
      expect(md('<code>foo<sub>bar</sub>baz</code>', { sub_symbol: '^' })).toBe('`foobarbaz`');
    });

    test('code with backticks inside', () => {
      expect(md('foo<code>`bar`</code>baz')).toBe('foo`` `bar` ``baz');
    });

    test('code with double backticks inside', () => {
      expect(md('foo<code>``bar``</code>baz')).toBe('foo``` ``bar`` ```baz');
    });

    test('code with spaces and backticks inside', () => {
      expect(md('foo<code> `bar` </code>baz')).toBe('foo `` `bar` `` baz');
    });
  });

  describe('test_dl', () => {
    test('simple definition list', () => {
      expect(md('<dl><dt>term</dt><dd>definition</dd></dl>')).toBe('\n\nterm\n:   definition\n\n');
    });

    test('definition list with nested paragraphs in dt', () => {
      expect(md('<dl><dt><p>te</p><p>rm</p></dt><dd>definition</dd></dl>')).toBe('\n\nte rm\n:   definition\n\n');
    });

    test('definition list with nested paragraphs in dd', () => {
      expect(md('<dl><dt>term</dt><dd><p>definition-p1</p><p>definition-p2</p></dd></dl>')).toBe('\n\nterm\n:   definition-p1\n\n    definition-p2\n\n');
    });

    test('definition list with multiple dd', () => {
      expect(md('<dl><dt>term</dt><dd><p>definition 1</p></dd><dd><p>definition 2</p></dd></dl>')).toBe('\n\nterm\n:   definition 1\n:   definition 2\n\n');
    });

    test('definition list with multiple dt', () => {
      expect(md('<dl><dt>term 1</dt><dd>definition 1</dd><dt>term 2</dt><dd>definition 2</dd></dl>')).toBe('\n\nterm 1\n:   definition 1\n\nterm 2\n:   definition 2\n\n');
    });

    test('definition list with nested blockquote', () => {
      expect(md('<dl><dt>term</dt><dd><blockquote><p>line 1</p><p>line 2</p></blockquote></dd></dl>')).toBe('\n\nterm\n:   > line 1\n    >\n    > line 2\n\n');
    });

    test('definition list with nested lists', () => {
      expect(md('<dl><dt>term</dt><dd><ol><li><p>1</p><ul><li>2a</li><li>2b</li></ul></li><li><p>3</p></li></ol></dd></dl>')).toBe('\n\nterm\n:   1. 1\n\n       * 2a\n       * 2b\n    2. 3\n\n');
    });
  });

  describe('test_del', () => {
    test('del tag', () => {
      inline_tests('del', '~~');
    });
  });

  describe('test_div_section_article', () => {
    const tags = ['div', 'section', 'article'];

    tags.forEach(tag => {
      test(`${tag} with simple content`, () => {
        expect(md(`<${tag}>456</${tag}>`)).toBe('\n\n456\n\n');
      });

      test(`${tag} with surrounding text`, () => {
        expect(md(`123<${tag}>456</${tag}>789`)).toBe('123\n\n456\n\n789');
      });

      test(`${tag} with newlines`, () => {
        expect(md(`123<${tag}>\n 456 \n</${tag}>789`)).toBe('123\n\n456\n\n789');
      });

      test(`${tag} with nested paragraph`, () => {
        expect(md(`123<${tag}><p>456</p></${tag}>789`)).toBe('123\n\n456\n\n789');
      });

      test(`${tag} with nested paragraph and newlines`, () => {
        expect(md(`123<${tag}>\n<p>456</p>\n</${tag}>789`)).toBe('123\n\n456\n\n789');
      });

      test(`${tag} with nested pre`, () => {
        expect(md(`123<${tag}><pre>4 5 6</pre></${tag}>789`)).toBe('123\n\n```\n4 5 6\n```\n\n789');
      });

      test(`${tag} with nested pre and newlines`, () => {
        expect(md(`123<${tag}>\n<pre>4 5 6</pre>\n</${tag}>789`)).toBe('123\n\n```\n4 5 6\n```\n\n789');
      });

      test(`${tag} with text and newlines`, () => {
        expect(md(`123<${tag}>4\n5\n6</${tag}>789`)).toBe('123\n\n4\n5\n6\n\n789');
      });

      test(`${tag} with text and newlines and spaces`, () => {
        expect(md(`123<${tag}>\n4\n5\n6\n</${tag}>789`)).toBe('123\n\n4\n5\n6\n\n789');
      });

      test(`${tag} with nested paragraph and newlines`, () => {
        expect(md(`123<${tag}>\n<p>\n4\n5\n6\n</p>\n</${tag}>789`)).toBe('123\n\n4\n5\n6\n\n789');
      });
    });

    test('div with nested h1 and ATX heading style', () => {
      expect(md('<div><h1>title</h1>body</div>', { heading_style: ATX })).toBe('\n\n# title\n\nbody\n\n');
    });

    test('section with nested h1 and ATX heading style', () => {
      expect(md('<section><h1>title</h1>body</section>', { heading_style: ATX })).toBe('\n\n# title\n\nbody\n\n');
    });

    test('article with nested h1 and ATX heading style', () => {
      expect(md('<article><h1>title</h1>body</article>', { heading_style: ATX })).toBe('\n\n# title\n\nbody\n\n');
    });
  });

  describe('test_em', () => {
    test('em tag', () => {
      inline_tests('em', '*');
    });
  });

  describe('test_figcaption', () => {
    test('figcaption with text before', () => {
      expect(md('TEXT<figure><figcaption>\nCaption\n</figcaption><span>SPAN</span></figure>')).toBe('TEXT\n\nCaption\n\nSPAN');
    });

    test('figcaption with text after', () => {
      expect(md('<figure><span>SPAN</span><figcaption>\nCaption\n</figcaption></figure>TEXT')).toBe('SPAN\n\nCaption\n\nTEXT');
    });
  });

  describe('test_header_with_space', () => {
    test('h3 with leading newlines', () => {
      expect(md('<h3>\n\nHello</h3>')).toBe('\n\n### Hello\n\n');
    });

    test('h3 with newlines in content', () => {
      expect(md('<h3>Hello\n\n\nWorld</h3>')).toBe('\n\n### Hello World\n\n');
    });

    test('h4 with leading newlines', () => {
      expect(md('<h4>\n\nHello</h4>')).toBe('\n\n#### Hello\n\n');
    });

    test('h5 with leading newlines', () => {
      expect(md('<h5>\n\nHello</h5>')).toBe('\n\n##### Hello\n\n');
    });

    test('h5 with leading and trailing newlines', () => {
      expect(md('<h5>\n\nHello\n\n</h5>')).toBe('\n\n##### Hello\n\n');
    });

    test('h5 with leading, trailing newlines and spaces', () => {
      expect(md('<h5>\n\nHello   \n\n</h5>')).toBe('\n\n##### Hello\n\n');
    });
  });

  describe('test_h1', () => {
    test('h1 with underline style', () => {
      expect(md('<h1>Hello</h1>')).toBe('\n\nHello\n=====\n\n');
    });
  });

  describe('test_h2', () => {
    test('h2 with underline style', () => {
      expect(md('<h2>Hello</h2>')).toBe('\n\nHello\n-----\n\n');
    });
  });

  describe('test_hn', () => {
    test('h3 with ATX style', () => {
      expect(md('<h3>Hello</h3>')).toBe('\n\n### Hello\n\n');
    });

    test('h4 with ATX style', () => {
      expect(md('<h4>Hello</h4>')).toBe('\n\n#### Hello\n\n');
    });

    test('h5 with ATX style', () => {
      expect(md('<h5>Hello</h5>')).toBe('\n\n##### Hello\n\n');
    });

    test('h6 with ATX style', () => {
      expect(md('<h6>Hello</h6>')).toBe('\n\n###### Hello\n\n');
    });

    test('h10 should be treated as h6', () => {
      expect(md('<h10>Hello</h10>')).toBe(md('<h6>Hello</h6>'));
    });

    test('h0 should be treated as h1', () => {
      expect(md('<h0>Hello</h0>')).toBe(md('<h1>Hello</h1>'));
    });

    test('hx should be treated as normal text', () => {
      expect(md('<hx>Hello</hx>')).toBe(md('Hello'));
    });
  });

  describe('test_hn_chained', () => {
    test('chained headings with ATX style', () => {
      expect(md('<h1>First</h1>\n<h2>Second</h2>\n<h3>Third</h3>', { heading_style: ATX })).toBe('\n\n# First\n\n## Second\n\n### Third\n\n');
    });

    test('heading after text with ATX style', () => {
      expect(md('X<h1>First</h1>', { heading_style: ATX })).toBe('X\n\n# First\n\n');
    });

    test('heading after text with ATX_CLOSED style', () => {
      expect(md('X<h1>First</h1>', { heading_style: ATX_CLOSED })).toBe('X\n\n# First #\n\n');
    });

    test('heading after text with underline style', () => {
      expect(md('X<h1>First</h1>')).toBe('X\n\nFirst\n=====\n\n');
    });
  });

  describe('test_hn_nested_tag_heading_style', () => {
    test('h1 with nested p and ATX_CLOSED style', () => {
      expect(md('<h1>A <p>P</p> C </h1>', { heading_style: ATX_CLOSED })).toBe('\n\n# A P C #\n\n');
    });

    test('h1 with nested p and ATX style', () => {
      expect(md('<h1>A <p>P</p> C </h1>', { heading_style: ATX })).toBe('\n\n# A P C\n\n');
    });
  });

  describe('test_hn_nested_simple_tag', () => {
    const tag_to_markdown = [
      ['strong', '**strong**'],
      ['b', '**b**'],
      ['em', '*em*'],
      ['i', '*i*'],
      ['p', 'p'],
      ['a', 'a'],
      ['div', 'div'],
      ['blockquote', 'blockquote'],
    ];

    tag_to_markdown.forEach(([tag, markdown]) => {
      test(`h3 with nested ${tag}`, () => {
        expect(md(`<h3>A <${tag}>${tag}</${tag}> B</h3>`)).toBe(`\n\n### A ${markdown} B\n\n`);
      });
    });

    test('h3 with nested br', () => {
      expect(md('<h3>A <br>B</h3>', { heading_style: ATX })).toBe('\n\n### A B\n\n');
    });
  });

  describe('test_hn_nested_img', () => {
    const image_attributes_to_markdown = [
      ['', '', ''],
      ['alt=\'Alt Text\'', 'Alt Text', ''],
      ['alt=\'Alt Text\' title=\'Optional title\'', 'Alt Text', ' "Optional title"'],
    ];

    image_attributes_to_markdown.forEach(([image_attributes, markdown, title]) => {
      test(`h3 with img (${image_attributes})`, () => {
        expect(md(`<h3>A <img src="/path/to/img.jpg" ${image_attributes}/> B</h3>`))
          .toBe(`\n\n### A${markdown ? ' ' + markdown + ' ' : ' '}B\n\n`);
      });

      test(`h3 with img and keep_inline_images_in (${image_attributes})`, () => {
        expect(md(`<h3>A <img src="/path/to/img.jpg" ${image_attributes}/> B</h3>`, { keep_inline_images_in: ['h3'] }))
          .toBe(`\n\n### A ![${markdown}](/path/to/img.jpg${title}) B\n\n`);
      });
    });
  });

  describe('test_hn_atx_headings', () => {
    test('h1 with ATX style', () => {
      expect(md('<h1>Hello</h1>', { heading_style: ATX })).toBe('\n\n# Hello\n\n');
    });

    test('h2 with ATX style', () => {
      expect(md('<h2>Hello</h2>', { heading_style: ATX })).toBe('\n\n## Hello\n\n');
    });
  });

  describe('test_hn_atx_closed_headings', () => {
    test('h1 with ATX_CLOSED style', () => {
      expect(md('<h1>Hello</h1>', { heading_style: ATX_CLOSED })).toBe('\n\n# Hello #\n\n');
    });

    test('h2 with ATX_CLOSED style', () => {
      expect(md('<h2>Hello</h2>', { heading_style: ATX_CLOSED })).toBe('\n\n## Hello ##\n\n');
    });
  });

  describe('test_hn_newlines', () => {
    test('multiple headings with text between', () => {
      expect(md('<h1>H1-1</h1>TEXT<h2>H2-2</h2>TEXT<h1>H1-2</h1>TEXT', { heading_style: ATX }))
        .toBe('\n\n# H1-1\n\nTEXT\n\n## H2-2\n\nTEXT\n\n# H1-2\n\nTEXT');
    });

    test('multiple headings with paragraphs between', () => {
      expect(md('<h1>H1-1</h1>\n<p>TEXT</p>\n<h2>H2-2</h2>\n<p>TEXT</p>\n<h1>H1-2</h1>\n<p>TEXT</p>', { heading_style: ATX }))
        .toBe('\n\n# H1-1\n\nTEXT\n\n## H2-2\n\nTEXT\n\n# H1-2\n\nTEXT\n\n');
    });
  });

  describe('test_head', () => {
    test('head tag', () => {
      expect(md('<head>head</head>')).toBe('head');
    });
  });

  describe('test_hr', () => {
    test('hr tag', () => {
      expect(md('Hello<hr>World')).toBe('Hello\n\n---\n\nWorld');
    });

    test('hr self-closing tag', () => {
      expect(md('Hello<hr />World')).toBe('Hello\n\n---\n\nWorld');
    });

    test('hr with paragraphs', () => {
      expect(md('<p>Hello</p>\n<hr>\n<p>World</p>')).toBe('\n\nHello\n\n---\n\nWorld\n\n');
    });
  });

  describe('test_i', () => {
    test('i tag', () => {
      expect(md('<i>Hello</i>')).toBe('*Hello*');
    });
  });

  describe('test_img', () => {
    test('img with alt and title', () => {
      expect(md('<img src="/path/to/img.jpg" alt="Alt text" title="Optional title" />'))
        .toBe('![Alt text](/path/to/img.jpg "Optional title")');
    });

    test('img with alt only', () => {
      expect(md('<img src="/path/to/img.jpg" alt="Alt text" />'))
        .toBe('![Alt text](/path/to/img.jpg)');
    });
  });

  describe('test_video', () => {
    test('video with src and poster', () => {
      expect(md('<video src="/path/to/video.mp4" poster="/path/to/img.jpg">text</video>'))
        .toBe('[![text](/path/to/img.jpg)](/path/to/video.mp4)');
    });

    test('video with src only', () => {
      expect(md('<video src="/path/to/video.mp4">text</video>'))
        .toBe('[text](/path/to/video.mp4)');
    });

    test('video with source element', () => {
      expect(md('<video><source src="/path/to/video.mp4"/>text</video>'))
        .toBe('[text](/path/to/video.mp4)');
    });

    test('video with poster only', () => {
      expect(md('<video poster="/path/to/img.jpg">text</video>'))
        .toBe('![text](/path/to/img.jpg)');
    });

    test('video with no src or poster', () => {
      expect(md('<video>text</video>'))
        .toBe('text');
    });
  });

  describe('test_kbd', () => {
    test('kbd tag', () => {
      inline_tests('kbd', '`');
    });
  });

  describe('test_p', () => {
    test('simple paragraph', () => {
      expect(md('<p>hello</p>')).toBe('\n\nhello\n\n');
    });

    test('nested paragraphs', () => {
      expect(md('<p><p>hello</p></p>')).toBe('\n\nhello\n\n');
    });

    test('paragraph with long text', () => {
      expect(md('<p>123456789 123456789</p>')).toBe('\n\n123456789 123456789\n\n');
    });

    test('paragraph with newlines', () => {
      expect(md('<p>123456789\n\n\n123456789</p>')).toBe('\n\n123456789\n123456789\n\n');
    });

    test('paragraph with wrapping', () => {
      expect(md('<p>123456789\n\n\n123456789</p>', { wrap: true, wrap_width: 80 })).toBe('\n\n123456789 123456789\n\n');
    });

    test('paragraph with wrapping and no width', () => {
      expect(md('<p>123456789\n\n\n123456789</p>', { wrap: true, wrap_width: undefined })).toBe('\n\n123456789 123456789\n\n');
    });

    test('paragraph with wrapping and width 10', () => {
      expect(md('<p>123456789 123456789</p>', { wrap: true, wrap_width: 10 })).toBe('\n\n123456789\n123456789\n\n');
    });

    test('paragraph with long link and wrapping', () => {
      expect(md('<p><a href="https://example.com">Some long link</a></p>', { wrap: true, wrap_width: 10 }))
        .toBe('\n\n[Some long\nlink](https://example.com)\n\n');
    });

    test('paragraph with br and backslash newline style', () => {
      expect(md('<p>12345<br />67890</p>', { wrap: true, wrap_width: 10, newline_style: BACKSLASH }))
        .toBe('\n\n12345\\\n67890\n\n');
    });

    test('paragraph with br and backslash newline style and width 50', () => {
      expect(md('<p>12345<br />67890</p>', { wrap: true, wrap_width: 50, newline_style: BACKSLASH }))
        .toBe('\n\n12345\\\n67890\n\n');
    });

    test('paragraph with br and spaces newline style', () => {
      expect(md('<p>12345<br />67890</p>', { wrap: true, wrap_width: 10, newline_style: SPACES }))
        .toBe('\n\n12345  \n67890\n\n');
    });

    test('paragraph with br and spaces newline style and width 50', () => {
      expect(md('<p>12345<br />67890</p>', { wrap: true, wrap_width: 50, newline_style: SPACES }))
        .toBe('\n\n12345  \n67890\n\n');
    });

    test('paragraph with long text and br and backslash newline style', () => {
      expect(md('<p>12345678901<br />12345</p>', { wrap: true, wrap_width: 10, newline_style: BACKSLASH }))
        .toBe('\n\n12345678901\\\n12345\n\n');
    });

    test('paragraph with long text and br and backslash newline style and width 50', () => {
      expect(md('<p>12345678901<br />12345</p>', { wrap: true, wrap_width: 50, newline_style: BACKSLASH }))
        .toBe('\n\n12345678901\\\n12345\n\n');
    });

    test('paragraph with long text and br and spaces newline style', () => {
      expect(md('<p>12345678901<br />12345</p>', { wrap: true, wrap_width: 10, newline_style: SPACES }))
        .toBe('\n\n12345678901  \n12345\n\n');
    });

    test('paragraph with long text and br and spaces newline style and width 50', () => {
      expect(md('<p>12345678901<br />12345</p>', { wrap: true, wrap_width: 50, newline_style: SPACES }))
        .toBe('\n\n12345678901  \n12345\n\n');
    });

    test('paragraph with words and br and backslash newline style', () => {
      expect(md('<p>1234 5678 9012<br />67890</p>', { wrap: true, wrap_width: 10, newline_style: BACKSLASH }))
        .toBe('\n\n1234 5678\n9012\\\n67890\n\n');
    });

    test('paragraph with words and br and spaces newline style', () => {
      expect(md('<p>1234 5678 9012<br />67890</p>', { wrap: true, wrap_width: 10, newline_style: SPACES }))
        .toBe('\n\n1234 5678\n9012  \n67890\n\n');
    });

    test('multiple paragraphs', () => {
      expect(md('First<p>Second</p><p>Third</p>Fourth')).toBe('First\n\nSecond\n\nThird\n\nFourth');
    });

    test('paragraph with non-breaking space', () => {
      expect(md('<p>&nbsp;x y</p>', { wrap: true, wrap_width: 80 })).toBe('\n\n\u00a0x y\n\n');
    });
  });

  describe('test_pre', () => {
    test('pre with text', () => {
      expect(md('<pre>test\n    foo\nbar</pre>')).toBe('\n\n```\ntest\n    foo\nbar\n```\n\n');
    });

    test('pre with nested code', () => {
      expect(md('<pre><code>test\n    foo\nbar</code></pre>')).toBe('\n\n```\ntest\n    foo\nbar\n```\n\n');
    });

    test('pre with asterisks and underscores', () => {
      expect(md('<pre>*this_should_not_escape*</pre>')).toBe('\n\n```\n*this_should_not_escape*\n```\n\n');
    });

    test('pre with nested span and asterisks and underscores', () => {
      expect(md('<pre><span>*this_should_not_escape*</span></pre>')).toBe('\n\n```\n*this_should_not_escape*\n```\n\n');
    });

    test('pre with tabs and spaces', () => {
      expect(md('<pre>\t\tthis  should\t\tnot  normalize</pre>')).toBe('\n\n```\n\t\tthis  should\t\tnot  normalize\n```\n\n');
    });

    test('pre with nested span and tabs and spaces', () => {
      expect(md('<pre><span>\t\tthis  should\t\tnot  normalize</span></pre>')).toBe('\n\n```\n\t\tthis  should\t\tnot  normalize\n```\n\n');
    });

    test('pre with nested bold and newlines', () => {
      expect(md('<pre>foo<b>\nbar\n</b>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested italic and newlines', () => {
      expect(md('<pre>foo<i>\nbar\n</i>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with text and nested italic', () => {
      expect(md('<pre>foo\n<i>bar</i>\nbaz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested italic and newlines', () => {
      expect(md('<pre>foo<i>\n</i>baz</pre>')).toBe('\n\n```\nfoo\nbaz\n```\n\n');
    });

    test('pre with nested del and newlines', () => {
      expect(md('<pre>foo<del>\nbar\n</del>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested em and newlines', () => {
      expect(md('<pre>foo<em>\nbar\n</em>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested code and newlines', () => {
      expect(md('<pre>foo<code>\nbar\n</code>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested strong and newlines', () => {
      expect(md('<pre>foo<strong>\nbar\n</strong>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested s and newlines', () => {
      expect(md('<pre>foo<s>\nbar\n</s>baz</pre>')).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested sup and newlines', () => {
      expect(md('<pre>foo<sup>\nbar\n</sup>baz</pre>', { sup_symbol: '^' })).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('pre with nested sub and newlines', () => {
      expect(md('<pre>foo<sub>\nbar\n</sub>baz</pre>', { sub_symbol: '^' })).toBe('\n\n```\nfoo\nbar\nbaz\n```\n\n');
    });

    test('text before pre', () => {
      expect(md('foo<pre>bar</pre>baz', { sub_symbol: '^' })).toBe('foo\n\n```\nbar\n```\n\nbaz');
    });

    test('paragraph before and after pre', () => {
      expect(md('<p>foo</p>\n<pre>bar</pre>\n</p>baz</p>', { sub_symbol: '^' })).toBe('\n\nfoo\n\n```\nbar\n```\n\nbaz');
    });
  });

  describe('test_q', () => {
    test('q tag', () => {
      expect(md('foo <q>quote</q> bar')).toBe('foo "quote" bar');
    });

    test('q tag with cite', () => {
      expect(md('foo <q cite="https://example.com">quote</q> bar')).toBe('foo "quote" bar');
    });
  });

  describe('test_script', () => {
    test('script tag', () => {
      expect(md('foo <script>var foo=42;</script> bar')).toBe('foo  bar');
    });
  });

  describe('test_style', () => {
    test('style tag', () => {
      expect(md('foo <style>h1 { font-size: larger }</style> bar')).toBe('foo  bar');
    });
  });

  describe('test_s', () => {
    test('s tag', () => {
      inline_tests('s', '~~');
    });
  });

  describe('test_samp', () => {
    test('samp tag', () => {
      inline_tests('samp', '`');
    });
  });

  describe('test_strong', () => {
    test('strong tag', () => {
      expect(md('<strong>Hello</strong>')).toBe('**Hello**');
    });
  });

  describe('test_strong_em_symbol', () => {
    test('strong with underscore symbol', () => {
      expect(md('<strong>Hello</strong>', { strong_em_symbol: UNDERSCORE })).toBe('__Hello__');
    });

    test('b with underscore symbol', () => {
      expect(md('<b>Hello</b>', { strong_em_symbol: UNDERSCORE })).toBe('__Hello__');
    });

    test('em with underscore symbol', () => {
      expect(md('<em>Hello</em>', { strong_em_symbol: UNDERSCORE })).toBe('_Hello_');
    });

    test('i with underscore symbol', () => {
      expect(md('<i>Hello</i>', { strong_em_symbol: UNDERSCORE })).toBe('_Hello_');
    });
  });

  describe('test_sub', () => {
    test('sub without symbol', () => {
      expect(md('<sub>foo</sub>')).toBe('foo');
    });

    test('sub with tilde symbol', () => {
      expect(md('<sub>foo</sub>', { sub_symbol: '~' })).toBe('~foo~');
    });

    test('sub with sub tag symbol', () => {
      expect(md('<sub>foo</sub>', { sub_symbol: '<sub>' })).toBe('<sub>foo</sub>');
    });
  });

  describe('test_sup', () => {
    test('sup without symbol', () => {
      expect(md('<sup>foo</sup>')).toBe('foo');
    });

    test('sup with caret symbol', () => {
      expect(md('<sup>foo</sup>', { sup_symbol: '^' })).toBe('^foo^');
    });

    test('sup with sup tag symbol', () => {
      expect(md('<sup>foo</sup>', { sup_symbol: '<sup>' })).toBe('<sup>foo</sup>');
    });
  });

  describe('test_lang', () => {
    test('pre with code language', () => {
      expect(md('<pre>test\n    foo\nbar</pre>', { code_language: 'python' })).toBe('\n\n```python\ntest\n    foo\nbar\n```\n\n');
    });

    test('pre with nested code and code language', () => {
      expect(md('<pre><code>test\n    foo\nbar</code></pre>', { code_language: 'javascript' })).toBe('\n\n```javascript\ntest\n    foo\nbar\n```\n\n');
    });
  });

  describe('test_lang_callback', () => {
    const callback = (el: any) => el.getAttribute('class');

    test('pre with code language callback', () => {
      expect(md('<pre class="python">test\n    foo\nbar</pre>', { code_language_callback: callback }))
        .toBe('\n\n```python\ntest\n    foo\nbar\n```\n\n');
    });

    test('pre with nested code and code language callback', () => {
      expect(md('<pre class="javascript"><code>test\n    foo\nbar</code></pre>', { code_language_callback: callback }))
        .toBe('\n\n```javascript\ntest\n    foo\nbar\n```\n\n');
    });

    test('pre with nested code and same class and code language callback', () => {
      expect(md('<pre class="javascript"><code class="javascript">test\n    foo\nbar</code></pre>', { code_language_callback: callback }))
        .toBe('\n\n```javascript\ntest\n    foo\nbar\n```\n\n');
    });
  });

  describe('test_spaces', () => {
    test('paragraphs with spaces', () => {
      expect(md('<p> a b </p> <p> c d </p>')).toBe('\n\na b\n\nc d\n\n');
    });

    test('paragraph with nested italic and spaces', () => {
      expect(md('<p> <i>a</i> </p>')).toBe('\n\n*a*\n\n');
    });

    test('text before paragraph', () => {
      expect(md('test <p> again </p>')).toBe('test\n\nagain\n\n');
    });

    test('text before blockquote', () => {
      expect(md('test <blockquote> text </blockquote> after')).toBe('test\n> text\n\nafter');
    });

    test('ordered list with spaces', () => {
      expect(md(' <ol> <li> x </li> <li> y </li> </ol> ')).toBe('\n\n1. x\n2. y\n');
    });

    test('unordered list with spaces', () => {
      expect(md(' <ul> <li> x </li> <li> y </li> </ul> ')).toBe('\n\n* x\n* y\n');
    });

    test('text before pre with spaces', () => {
      expect(md('test <pre> foo </pre> bar')).toBe('test\n\n```\n foo\n```\n\nbar');
    });
  });
});
