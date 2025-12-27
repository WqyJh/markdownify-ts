import { MarkdownConverter } from '../src/converter';
import { MarkdownConverterOptions } from '../src/types';

class UnitTestConverter extends MarkdownConverter {
  /**
   * Create a custom MarkdownConverter for unit tests
   */
  convert_img(el: any, text: string, parent_tags: Set<string>): string {
    /* Add two newlines after an image */
    return super.convert_img(el, text, parent_tags) + '\n\n';
  }

  convert_custom_tag(el: any, text: string, parent_tags: Set<string>): string {
    /* Ensure conversion function is found for tags with special characters in name */
    return "convert_custom_tag(): " + text;
  }

  convert_h1(el: any, text: string, parent_tags: Set<string>): string {
    /* Ensure explicit heading conversion function is used */
    return "convert_h1: " + text;
  }

  convert_hN(n: number, el: any, text: string, parent_tags: Set<string>): string {
    /* Ensure general heading conversion function is used */
    return "convert_hN(" + n + "): " + text;
  }
}

describe('Custom Converter Tests', () => {
  // Create shorthand method for conversion
  function md(html: string, options: Partial<MarkdownConverterOptions> = {}): string {
    return new UnitTestConverter(options).convert(html);
  }

  describe('Custom Conversion Functions', () => {
    test('custom img conversion with two newlines', () => {
      expect(md('<img src="/path/to/img.jpg" alt="Alt text" title="Optional title" />text'))
        .toBe('![Alt text](/path/to/img.jpg "Optional title")\n\ntext');
    });

    test('custom img conversion without title', () => {
      expect(md('<img src="/path/to/img.jpg" alt="Alt text" />text'))
        .toBe('![Alt text](/path/to/img.jpg)\n\ntext');
    });

    test('custom tag conversion', () => {
      expect(md("<custom-tag>text</custom-tag>")).toBe("convert_custom_tag(): text");
    });

    test('explicit h1 conversion function', () => {
      expect(md("<h1>text</h1>")).toBe("convert_h1: text");
    });

    test('general heading conversion function', () => {
      expect(md("<h3>text</h3>")).toBe("convert_hN(3): text");
    });
  });

  describe('Soup Method', () => {
    test('convert soup object', () => {
      const htmlparser2 = require('htmlparser2');
      const html = '<b>test</b>';
      const soup = htmlparser2.parseDocument(html);
      expect(new MarkdownConverter().convertSoup(soup)).toBe('**test**');
    });
  });
});