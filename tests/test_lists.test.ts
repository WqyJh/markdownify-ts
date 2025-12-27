import { md } from './utils';

describe('Lists Tests', () => {
  const nested_uls = `
    <ul>
        <li>1
            <ul>
                <li>a
                    <ul>
                        <li>I</li>
                        <li>II</li>
                        <li>III</li>
                    </ul>
                </li>
                <li>b</li>
                <li>c</li>
            </ul>
        </li>
        <li>2</li>
        <li>3</li>
    </ul>`;

  const nested_ols = `
    <ol>
        <li>1
            <ol>
                <li>a
                    <ol>
                        <li>I</li>
                        <li>II</li>
                        <li>III</li>
                    </ol>
                </li>
                <li>b</li>
                <li>c</li>
            </ol>
        </li>
        <li>2</li>
        <li>3</li>
    </ol>`;

  describe('Ordered Lists', () => {
    test('basic ordered list', () => {
      expect(md('<ol><li>a</li><li>b</li></ol>')).toBe('\n\n1. a\n2. b\n');
    });

    test('ordered list with comments', () => {
      expect(md('<ol><!--comment--><li>a</li><span/><li>b</li></ol>')).toBe('\n\n1. a\n2. b\n');
    });

    test('ordered list with start attribute', () => {
      expect(md('<ol start="3"><li>a</li><li>b</li></ol>')).toBe('\n\n3. a\n4. b\n');
    });

    test('ordered list with start attribute in context', () => {
      const result = md('foo<ol start="3"><li>a</li><li>b</li></ol>bar');
      expect(result.includes('3. a')).toBe(true);
      expect(result.includes('4. b')).toBe(true);
    });

    test('ordered list with invalid start attributes', () => {
      const result1 = md('<ol start="-1"><li>a</li><li>b</li></ol>');
      expect(result1.includes('1. a')).toBe(true);
      expect(result1.includes('b')).toBe(true);

      const result2 = md('<ol start="foo"><li>a</li><li>b</li></ol>');
      expect(result2.includes('1. a')).toBe(true);
      expect(result2.includes('b')).toBe(true);
    });

    test('ordered list with paragraphs', () => {
      expect(md('<ol start="1234"><li><p>first para</p><p>second para</p></li><li><p>third para</p><p>fourth para</p></li></ol>'))
        .toBe('\n\n1234. first para\n\n      second para\n1235. third para\n\n      fourth para\n');
    });
  });

  describe('Nested Ordered Lists', () => {
    test('nested ordered lists', () => {
      expect(md(nested_ols)).toBe('\n\n1. 1\n   1. a\n      1. I\n      2. II\n      3. III\n   2. b\n   3. c\n2. 2\n3. 3\n');
    });
  });

  describe('Unordered Lists', () => {
    test('basic unordered list', () => {
      expect(md('<ul><li>a</li><li>b</li></ul>')).toBe('\n\n* a\n* b\n');
    });

    test('unordered list with whitespace', () => {
      expect(md(`<ul>
     <li>
             a
     </li>
     <li> b </li>
     <li>   c
     </li>
 </ul>`)).toBe('\n\n* a\n* b\n* c\n');
    });

    test('unordered list with paragraphs', () => {
      expect(md('<ul><li><p>first para</p><p>second para</p></li><li><p>third para</p><p>fourth para</p></li></ul>'))
        .toBe('\n\n* first para\n\n  second para\n* third para\n\n  fourth para\n');
    });
  });

  describe('Inline Unordered Lists', () => {
    test('inline unordered list with paragraphs', () => {
      expect(md('<p>foo</p><ul><li>a</li><li>b</li></ul><p>bar</p>'))
        .toBe('\n\nfoo\n\n* a\n* b\n\nbar\n\n');
    });

    test('inline unordered list without paragraphs', () => {
      const result = md('foo<ul><li>bar</li></ul>baz');
      expect(result.includes('* bar')).toBe(true);
      expect(result.includes('foo')).toBe(true);
      expect(result.includes('baz')).toBe(true);
    });
  });

  describe('Nested Unordered Lists', () => {
    test('nested unordered lists with alternating bullets', () => {
      expect(md(nested_uls)).toBe('\n\n* 1\n  + a\n    - I\n    - II\n    - III\n  + b\n  + c\n* 2\n* 3\n');
    });
  });

  describe('Custom Bullets', () => {
    test('custom bullet characters', () => {
      expect(md(nested_uls, { bullets: '-' })).toBe('\n\n- 1\n  - a\n    - I\n    - II\n    - III\n  - b\n  - c\n- 2\n- 3\n');
    });
  });

  describe('List Item Text', () => {
    test('list item with inline elements', () => {
      expect(md('<ul><li>foo <a href="#">bar</a></li><li>foo bar  </li><li>foo <b>bar</b>   <i>space</i>.</ul>'))
        .toBe('\n\n* foo [bar](#)\n* foo bar\n* foo **bar** *space*.\n');
    });
  });
});
