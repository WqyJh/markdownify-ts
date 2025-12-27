import { md } from './utils';

describe('Escaping Tests', () => {
  describe('test_asterisks', () => {
    test('escape asterisks by default', () => {
      expect(md('*hey*dude*')).toBe('\\*hey\\*dude\\*');
    });

    test('do not escape asterisks when disabled', () => {
      expect(md('*hey*dude*', { escape_asterisks: false })).toBe('*hey*dude*');
    });
  });

  describe('test_underscore', () => {
    test('escape underscores by default', () => {
      expect(md('_hey_dude_')).toBe('\\_hey\\_dude\\_');
    });

    test('do not escape underscores when disabled', () => {
      expect(md('_hey_dude_', { escape_underscores: false })).toBe('_hey_dude_');
    });
  });

  describe('test_xml_entities', () => {
    test('escape ampersand with escape_misc', () => {
      expect(md('&amp;', { escape_misc: true })).toBe('\\&');
    });
  });

  describe('test_named_entities', () => {
    test('convert named entities', () => {
      expect(md('&raquo;')).toBe('»');
    });
  });

  describe('test_hexadecimal_entities', () => {
    test('convert hexadecimal entities', () => {
      expect(md('&#x27;')).toBe('\x27');
    });
  });

  describe('test_single_escaping_entities', () => {
    test('single escaping entities', () => {
      expect(md('&amp;amp;', { escape_misc: true })).toBe('\\&amp;');
    });
  });

  describe('test_misc', () => {
    test('escape backslash with asterisk', () => {
      expect(md('\\*', { escape_misc: true })).toBe('\\\\\\*');
    });

    test('escape less than and greater than', () => {
      expect(md('<foo>', { escape_misc: true })).toBe('');
    });

    test('escape hash at start', () => {
      expect(md('# foo', { escape_misc: true })).toBe('\\# foo');
    });

    test('do not escape hash with number', () => {
      expect(md('#5', { escape_misc: true })).toBe('#5');
    });

    test('do not escape hash at end', () => {
      expect(md('5#', { escape_misc: true })).toBe('5#');
    });

    test('do not escape many hashes', () => {
      expect(md('####### foo', { escape_misc: true })).toBe('####### foo');
    });

    test('escape greater than', () => {
      expect(md('> foo', { escape_misc: true })).toBe('\\> foo');
    });

    test('escape tilde', () => {
      expect(md('~~foo~~', { escape_misc: true })).toBe('\\~\\~foo\\~\\~');
    });

    test('escape equals in heading', () => {
      expect(md('foo\n===\n', { escape_misc: true })).toBe('foo\n\\=\\=\\=\n');
    });

    test('escape dash sequences', () => {
      expect(md('---\n', { escape_misc: true })).toBe('\\---\n');
      expect(md('- test', { escape_misc: true })).toBe('\\- test');
    });

    test('do not escape dash in middle', () => {
      expect(md('x - y', { escape_misc: true })).toBe('x \\- y');
    });

    test('do not escape dash in word', () => {
      expect(md('test-case', { escape_misc: true })).toBe('test-case');
    });

    test('do not escape dash at end', () => {
      expect(md('x-', { escape_misc: true })).toBe('x-');
    });

    test('do not escape dash at start of word', () => {
      expect(md('-y', { escape_misc: true })).toBe('-y');
    });

    test('escape plus in list', () => {
      expect(md('+ x\n+ y\n', { escape_misc: true })).toBe('\\+ x\n\\+ y\n');
    });

    test('escape backtick', () => {
      expect(md('`x`', { escape_misc: true })).toBe('\\`x\\`');
    });

    test('escape square brackets', () => {
      expect(md('[text](notalink)', { escape_misc: true })).toBe('\\[text\\](notalink)');
    });

    test('escape bracket in text', () => {
      expect(md('<a href="link">text]</a>', { escape_misc: true })).toBe('[text\\]](link)');
    });

    test('escape brackets in link', () => {
      expect(md('<a href="link">[text]</a>', { escape_misc: true })).toBe('[\\[text\\]](link)');
    });

    test('escape dot in list', () => {
      expect(md('1. x', { escape_misc: true })).toBe('1\\. x');
    });

    test('escape dot in span', () => {
      expect(md('<span>1.</span> x', { escape_misc: true })).toBe('1\\. x');
    });

    test('escape dot with space', () => {
      expect(md(' 1. x', { escape_misc: true })).toBe(' 1\\. x');
    });

    test('escape dot with 8 digits', () => {
      expect(md('123456789. x', { escape_misc: true })).toBe('123456789\\. x');
    });

    test('do not escape dot with 10 digits', () => {
      expect(md('1234567890. x', { escape_misc: true })).toBe('1234567890. x');
    });

    test('do not escape dot with letter', () => {
      expect(md('A1. x', { escape_misc: true })).toBe('A1. x');
    });

    test('do not escape single dot', () => {
      expect(md('1.2', { escape_misc: true })).toBe('1.2');
    });

    test('do not escape dot in text', () => {
      expect(md('not a number. x', { escape_misc: true })).toBe('not a number. x');
    });

    test('escape parenthesis in list', () => {
      expect(md('1) x', { escape_misc: true })).toBe('1\\) x');
    });

    test('escape parenthesis in span', () => {
      expect(md('<span>1)</span> x', { escape_misc: true })).toBe('1\\) x');
    });

    test('escape parenthesis with space', () => {
      expect(md(' 1) x', { escape_misc: true })).toBe(' 1\\) x');
    });

    test('escape parenthesis with 8 digits', () => {
      expect(md('123456789) x', { escape_misc: true })).toBe('123456789\\) x');
    });

    test('do not escape parenthesis with 10 digits', () => {
      expect(md('1234567890) x', { escape_misc: true })).toBe('1234567890) x');
    });

    test('do not escape parenthesis in text', () => {
      expect(md('(1) x', { escape_misc: true })).toBe('(1) x');
    });

    test('do not escape parenthesis with letter', () => {
      expect(md('A1) x', { escape_misc: true })).toBe('A1) x');
    });

    test('do not escape parenthesis at end', () => {
      expect(md('1)x', { escape_misc: true })).toBe('1)x');
    });

    test('do not escape parenthesis in text', () => {
      expect(md('not a number) x', { escape_misc: true })).toBe('not a number) x');
    });

    test('escape pipe', () => {
      expect(md('|not table|', { escape_misc: true })).toBe('\\|not table\\|');
    });

    test('no escape without escape_misc', () => {
      expect(md('\\ &lt;foo> &amp;amp; | ` `', { escape_misc: false })).toBe('\\ <foo> &amp; | ` `');
    });
  });
});
