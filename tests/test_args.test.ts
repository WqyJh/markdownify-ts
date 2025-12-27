/**
 * Test whitelisting/blacklisting of specific tags.
 */
import { md } from './utils';
import { markdownify } from '../src/converter';
import { LSTRIP, RSTRIP, STRIP, STRIP_ONE } from '../src/types';

describe('Arguments Tests', () => {
  describe('Strip', () => {
    test('strip tags', () => {
      expect(md('<a href="https://github.com/WqyJh">Some Text</a>', { strip: ['a'] }))
        .toBe('Some Text');
    });

    test('do not strip tags', () => {
      expect(md('<a href="https://github.com/WqyJh">Some Text</a>', { strip: [] }))
        .toBe('[Some Text](https://github.com/WqyJh)');
    });
  });

  describe('Convert', () => {
    test('convert specific tags', () => {
      expect(md('<a href="https://github.com/WqyJh">Some Text</a>', { convert: ['a'] }))
        .toBe('[Some Text](https://github.com/WqyJh)');
    });

    test('do not convert tags', () => {
      expect(md('<a href="https://github.com/WqyJh">Some Text</a>', { convert: [] }))
        .toBe('Some Text');
    });
  });

  describe('Strip Document', () => {
    test('default strip document behavior', () => {
      // Test default behavior using markdownify (should be STRIP)
      expect(markdownify('<p>Hello</p>')).toBe('Hello');
    });

    test('lstrip document', () => {
      expect(markdownify('<p>Hello</p>', { strip_document: LSTRIP })).toBe('Hello\n\n');
    });

    test('rstrip document', () => {
      expect(markdownify('<p>Hello</p>', { strip_document: RSTRIP })).toBe('\n\nHello');
    });

    test('strip document', () => {
      expect(markdownify('<p>Hello</p>', { strip_document: STRIP })).toBe('Hello');
    });

    test('no strip document', () => {
      expect(markdownify('<p>Hello</p>', { strip_document: null })).toBe('\n\nHello\n\n');
    });
  });

  describe('Strip Pre', () => {
    test('default strip pre behavior', () => {
      // Test default behavior using markdownify (should be STRIP)
      expect(markdownify('<pre>  \n  \n  Hello  \n  \n  </pre>')).toBe('```\n  Hello\n```');
    });

    test('strip pre with STRIP', () => {
      expect(markdownify('<pre>  \n  \n  Hello  \n  \n  </pre>', { strip_pre: STRIP })).toBe('```\n  Hello\n```');
    });

    test('strip pre with STRIP_ONE', () => {
      expect(markdownify('<pre>  \n  \n  Hello  \n  \n  </pre>', { strip_pre: STRIP_ONE })).toBe('```\n  \n  Hello  \n  \n```');
    });

    test('strip pre with null', () => {
      expect(markdownify('<pre>  \n  \n  Hello  \n  \n  </pre>', { strip_pre: null })).toBe('```\n  \n  \n  Hello  \n  \n  \n```');
    });
  });

  describe('BS4 Options', () => {
    test('bs4 options as string', () => {
      expect(markdownify('<p>Hello</p>', { bs4_options: 'html.parser' })).toBe('Hello');
    });

    test('bs4 options as array', () => {
      expect(markdownify('<p>Hello</p>', { bs4_options: ['html.parser'] })).toBe('Hello');
    });

    test('bs4 options as object', () => {
      expect(markdownify('<p>Hello</p>', { bs4_options: { features: 'html.parser' } })).toBe('Hello');
    });
  });
});