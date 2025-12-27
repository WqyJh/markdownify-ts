import { md } from './utils';

describe('Advanced Tests', () => {
  describe('Chomp', () => {
    test('chomp with empty bold tags', () => {
      expect(md(' <b></b> ')).toBe('  ');
    });

    test('chomp with space only bold tags', () => {
      expect(md(' <b> </b> ')).toBe('  ');
    });

    test('chomp with multiple spaces in bold tags', () => {
      expect(md(' <b>  </b> ')).toBe('  ');
    });

    test('chomp with three spaces in bold tags', () => {
      expect(md(' <b>   </b> ')).toBe('  ');
    });

    test('chomp with text and trailing space', () => {
      expect(md(' <b>s </b> ')).toBe(' **s**  ');
    });

    test('chomp with leading space and text', () => {
      expect(md(' <b> s</b> ')).toBe('  **s** ');
    });

    test('chomp with spaces around text', () => {
      expect(md(' <b> s </b> ')).toBe('  **s**  ');
    });

    test('chomp with multiple spaces around text', () => {
      expect(md(' <b>  s  </b> ')).toBe('  **s**  ');
    });
  });

  describe('Nested', () => {
    test('nested link in paragraph', () => {
      expect(md('<p>This is an <a href="http://example.com/">example link</a>.</p>'))
        .toBe('\n\nThis is an [example link](http://example.com/).\n\n');
    });
  });

  describe('Ignore Comments', () => {
    test('ignore html comments', () => {
      expect(md('<!-- This is a comment -->')).toBe('');
    });

    test('ignore comments with other tags', () => {
      expect(md("<!-- This is a comment --><a href='http://example.com/'>example link</a>"))
        .toBe('[example link](http://example.com/)');
    });
  });

  describe('Code with Tricky Content', () => {
    test('code with greater than symbol', () => {
      expect(md('<code>></code>')).toBe('`>`');
    });

    test('code with path and following bold', () => {
      expect(md('<code>/home/</code><b>username</b>')).toBe('`/home/`**username**');
    });

    test('code with line breaks', () => {
      expect(md('First line <code>blah blah<br />blah blah</code> second line'))
        .toBe('First line `blah blah  \nblah blah` second line');
    });
  });

  describe('Special Tags', () => {
    test('ignore doctype tag', () => {
      expect(md('<!DOCTYPE html>')).toBe('');
    });

    test('handle cdata tag', () => {
      expect(md('<![CDATA[foobar]]>')).toBe('');
    });
  });
});