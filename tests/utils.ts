import { MarkdownConverter } from '../src/converter';
import { MarkdownConverterOptions } from '../src/types';

// for unit testing, disable document-level stripping by default so that
// separation newlines are included in testing
export function md(html: string, options: Partial<MarkdownConverterOptions> = {}): string {
  const testOptions: Partial<MarkdownConverterOptions> = {
    strip_document: null,
    ...options
  };

  return new MarkdownConverter(testOptions).convert(html);
}
