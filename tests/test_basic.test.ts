import { md } from './utils';

describe('Basic Tests', () => {
  test('single tag', () => {
    expect(md('<span>Hello</span>')).toBe('Hello');
  });

  test('soup', () => {
    expect(md('<div><span>Hello</div></span>')).toBe('\n\nHello\n\n');
  });

  test('whitespace', () => {
    expect(md(' a  b \t\t c ')).toBe(' a b c ');
    expect(md(' a  b \n\n c ')).toBe(' a b\nc ');
  });
});