/**
 * Markdownify TypeScript - Convert HTML to Markdown
 * TypeScript port of python-markdownify
 */

// Default options matching Python version's DefaultOptions class
export interface DefaultMarkdownConverterOptions {
  autolinks: boolean;
  bullets: string;
  code_language: string;
  code_language_callback: ((el: any) => string | null) | null;
  convert: string[] | null;
  default_title: boolean;
  escape_asterisks: boolean;
  escape_underscores: boolean;
  escape_misc: boolean;
  heading_style: string;
  keep_inline_images_in: string[];
  newline_style: string;
  strip: string[] | null;
  strip_document: string | null;
  strip_pre: string | null;
  strong_em_symbol: string;
  sub_symbol: string;
  sup_symbol: string;
  table_infer_header: boolean;
  wrap: boolean;
  wrap_width: number;
}

// User-provided options (all fields optional)
export interface MarkdownConverterOptions extends Partial<DefaultMarkdownConverterOptions> {
  autolinks?: boolean;
  bullets?: string;
  code_language?: string;
  code_language_callback?: ((el: any) => string | null) | null;
  convert?: string[] | null;
  default_title?: boolean;
  escape_asterisks?: boolean;
  escape_underscores?: boolean;
  escape_misc?: boolean;
  heading_style?: string;
  keep_inline_images_in?: string[];
  newline_style?: string;
  strip?: string[] | null;
  strip_document?: string | null;
  strip_pre?: string | null;
  strong_em_symbol?: string;
  sub_symbol?: string;
  sup_symbol?: string;
  table_infer_header?: boolean;
  wrap?: boolean;
  wrap_width?: number;
}

export interface ConversionFunction {
  (el: any, text: string, parent_tags: Set<string>): string;
}

export interface HeadingLevel {
  level: number;
  text: string;
}

// Constants
export const ATX = 'atx';
export const ATX_CLOSED = 'atx_closed';
export const UNDERLINED = 'underlined';
export const SETEXT = UNDERLINED;

export const SPACES = 'spaces';
export const BACKSLASH = 'backslash';

export const ASTERISK = '*';
export const UNDERSCORE = '_';

export const LSTRIP = 'lstrip';
export const RSTRIP = 'rstrip';
export const STRIP = 'strip';
export const STRIP_ONE = 'strip_one';
