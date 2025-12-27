import { parse, HTMLElement, Node, TextNode } from 'node-html-parser';
import {
  MarkdownConverterOptions,
  DefaultMarkdownConverterOptions,
  ATX,
  ATX_CLOSED,
  UNDERLINED,
  SPACES,
  BACKSLASH,
  ASTERISK,
  UNDERSCORE,
  STRIP,
  STRIP_ONE
} from './types';

// Regex patterns
const reHtmlHeading = /h(\d+)/;
const reAllWhitespace = /[\t \r\n]+/g;
const reNewlineWhitespace = /[\t \r\n]*[\r\n][\t \r\n]*/g;
const reBacktickRuns = /`+/g;
const reExtractNewlines = /^(\n*)((?:.*[^\n])?)(\n*)$/s;

// Pre strip patterns (aligned with Python)
const rePreLstrip1 = /^ *\n/;
const rePreRstrip1 = /\n *$/;
const rePreLstrip = /^[ \n]*\n/;
const rePreRstrip = /[ \n]*$/;

function chomp(text: string): [string, string, string] {
  const prefix = text && text[0] === ' ' ? ' ' : '';
  const suffix = text && text[text.length - 1] === ' ' ? ' ' : '';
  text = text.trim();
  return [prefix, suffix, text];
}

function abstractInlineConversion(markupFn: (self: MarkdownConverter) => string) {
  return function(this: MarkdownConverter, el: HTMLElement, text: string, parent_tags: Set<string>): string {
    const markupPrefix = markupFn(this);
    let markupSuffix = markupPrefix;
    
    if (markupPrefix.startsWith('<') && markupPrefix.endsWith('>')) {
      markupSuffix = '</' + markupPrefix.substring(1);
    }
    
    if (parent_tags.has('_noformat')) {
      return text;
    }
    
    const [prefix, suffix, chompedText] = chomp(text);
    if (!chompedText) {
      return '';
    }
    
    return `${prefix}${markupPrefix}${chompedText}${markupSuffix}${suffix}`;
  };
}

function shouldRemoveWhitespaceInside(el: HTMLElement): boolean {
  if (!el || !el.tagName) {
    return false;
  }
  const tagName = el.tagName.toLowerCase();
  if (reHtmlHeading.test(tagName)) {
    return true;
  }
  return ['p', 'blockquote', 'article', 'div', 'section', 'ol', 'ul', 'li', 
          'dl', 'dt', 'dd', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'].includes(tagName);
}

function shouldRemoveWhitespaceOutside(el: HTMLElement): boolean {
  if (!el) return false;
  const isPre = el.tagName ? el.tagName.toLowerCase() === 'pre' : false;
  return shouldRemoveWhitespaceInside(el) || isPre;
}

function hasSibling(el: any): boolean {
  return el && (el.previousSibling !== undefined || el.nextSibling !== undefined);
}

// Strip functions for <pre> elements (aligned with Python)
function strip1Pre(text: string): string {
  // Strip one leading and trailing newline from a <pre> string.
  text = text.replace(rePreLstrip1, '');
  text = text.replace(rePreRstrip1, '');
  return text;
}

function stripPre(text: string): string {
  // Strip all leading and trailing newlines from a <pre> string.
  text = text.replace(rePreLstrip, '');
  text = text.replace(rePreRstrip, '');
  return text;
}

export class MarkdownConverter {
  private options: Record<string, any>;
  private convertFnCache: Map<string, any>;

  constructor(options: Partial<MarkdownConverterOptions> = {}) {
    const defaultOptions: DefaultMarkdownConverterOptions = {
      autolinks: true,
      bs4_options: 'html.parser',
      bullets: '*+-',
      code_language: '',
      code_language_callback: null,
      convert: null,
      default_title: false,
      escape_asterisks: true,
      escape_underscores: true,
      escape_misc: false,
      heading_style: UNDERLINED,
      keep_inline_images_in: [],
      newline_style: SPACES,
      strip: null,
      strip_document: STRIP,
      strip_pre: STRIP,
      strong_em_symbol: ASTERISK,
      sub_symbol: '',
      sup_symbol: '',
      table_infer_header: false,
      wrap: false,
      wrap_width: 80
    };

    // Start with default options
    this.options = { ...defaultOptions };
    
    // Apply options - only override if the key exists in the provided options
    // This matches Python's behavior where undefined means "not provided"
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        (this.options as any)[key] = value;
      }
    }
    
    if (this.options.strip && this.options.convert) {
      throw new Error('You may specify either tags to strip or tags to convert, but not both.');
    }

    this.convertFnCache = new Map();
  }

  convert(html: string): string {
    const root = parse(html);
    const body = root.querySelector('body') || root;
    let result = this.convertSoup(body);
    
    // Apply strip_document logic
    // strip_document should always have a value (default is STRIP)
    // Only skip stripping if explicitly set to null
    const stripDocument = this.options.strip_document;
    if (stripDocument !== null) {
      result = this.applyStripDocument(result, stripDocument);
    }
    
    return result;
  }
  
  private applyStripDocument(text: string, stripMode: string): string {
    if (stripMode === STRIP) {
      return text.trim();
    } else if (stripMode === 'lstrip') {
      return text.replace(/^[\t\r\n ]+/, '');
    } else if (stripMode === 'rstrip') {
      return text.replace(/[\t\r\n ]+$/, '');
    }
    return text;
  }

  convertSoup(soup: HTMLElement): string {
    return this.processTag(soup, new Set());
  }

  processElement(node: Node, parent_tags: Set<string> = new Set()): string {
    if (node instanceof TextNode) {
      // Check for special content that should be ignored
      const text = node.text || '';
      if (text.trim().startsWith('<!DOCTYPE') || 
          text.trim().startsWith('<![CDATA[')) {
        return '';
      }
      return this.processText(node, parent_tags);
    } else if (node instanceof HTMLElement) {
      return this.processTag(node, parent_tags);
    } else {
      return '';
    }
  }

  processTag(node: HTMLElement, parent_tags: Set<string> = new Set()): string {
    const shouldRemoveInside = shouldRemoveWhitespaceInside(node);

    const _canIgnore = (el: Node): boolean => {
      if (el instanceof HTMLElement) {
        return false;
      } else if (el instanceof TextNode) {
        if (el.text.trim() !== '') {
          return false;
        }
        // For TextNode, check if it has siblings using the parent's childNodes
        const hasPrevSibling = el.parentNode && el.parentNode.childNodes.indexOf(el) > 0;
        const hasNextSibling = el.parentNode && el.parentNode.childNodes.indexOf(el) < el.parentNode.childNodes.length - 1;
        
        if (shouldRemoveInside && (!hasPrevSibling || !hasNextSibling)) {
          return true;
        }
        
        // Check siblings using parent's childNodes
        const prevSibling = hasPrevSibling ? el.parentNode.childNodes[el.parentNode.childNodes.indexOf(el) - 1] : null;
        const nextSibling = hasNextSibling ? el.parentNode.childNodes[el.parentNode.childNodes.indexOf(el) + 1] : null;
        if (shouldRemoveWhitespaceOutside(prevSibling as HTMLElement) || 
            shouldRemoveWhitespaceOutside(nextSibling as HTMLElement)) {
          return true;
        }
        
        return false;
      } else {
        return true;
      }
    };

    const childrenToConvert = node.childNodes.filter((el: Node) => !_canIgnore(el));

    const parent_tags_for_children = new Set(parent_tags);
    const tagName = node.tagName?.toLowerCase() || '';
    parent_tags_for_children.add(tagName);

    if (reHtmlHeading.test(tagName) || ['td', 'th'].includes(tagName)) {
      parent_tags_for_children.add('_inline');
    }

    if (['pre', 'code', 'kbd', 'samp'].includes(tagName)) {
      parent_tags_for_children.add('_noformat');
    }

    const childStrings = childrenToConvert
      .map((el: Node) => this.processElement(el, parent_tags_for_children))
      .filter((s: string) => s);

    let processedChildStrings: string[];
    if (tagName === 'pre' || node.closest?.('pre')) {
      processedChildStrings = childStrings;
    } else {
      processedChildStrings = [''];
      for (const childString of childStrings) {
        const match = reExtractNewlines.exec(childString);
        if (!match) continue;
        
        const [_, leadingNl, content, trailingNl] = match;

        if (processedChildStrings[processedChildStrings.length - 1] && leadingNl) {
          const prevTrailingNl = processedChildStrings.pop();
          const numNewlines = Math.min(2, Math.max(prevTrailingNl?.length || 0, leadingNl.length));
          const newLeadingNl = '\n'.repeat(numNewlines);
          processedChildStrings.push(newLeadingNl, content, trailingNl);
        } else {
          processedChildStrings.push(leadingNl, content, trailingNl);
        }
      }
    }

    let text = processedChildStrings.join('');

    // For <pre> tags, if the content contains HTML tags (like <code>), we need to strip the HTML tags
    // This handles cases like <pre><code>test</code></pre> where node-html-parser treats the content as text
    if (tagName === 'pre' && text.includes('<') && text.includes('>')) {
      // Remove HTML tags but preserve the content
      text = text.replace(/<[^>]*>/g, '');
    }

    const convertFn = this.getConvFnCached(tagName);
    if (convertFn) {
      text = convertFn(node, text, parent_tags);
    }

    return text;
  }

  processText(el: TextNode, parent_tags: Set<string> = new Set()): string {
    let text = el.text || '';

    if (!parent_tags.has('pre')) {
      if (this.options.wrap) {
        text = text.replace(reAllWhitespace, ' ');
      } else {
        text = text.replace(reNewlineWhitespace, '\n');
        text = text.replace(/\t+/g, ' ');
        text = text.replace(/ +/g, ' ');
      }
    }

    // Only escape if not in a preformatted or code element
    if (!parent_tags.has('_noformat') && !parent_tags.has('code') && !parent_tags.has('kbd') && !parent_tags.has('samp')) {
      text = this.escape(text, parent_tags);
    }

    // For TextNode, check siblings using parent's childNodes
    const parentNode = el.parentNode as any;
    if (parentNode) {
      const currentIndex = parentNode.childNodes.indexOf(el);
      const hasPrevSibling = currentIndex > 0;
      const hasNextSibling = currentIndex < parentNode.childNodes.length - 1;
      const prevSibling = hasPrevSibling ? parentNode.childNodes[currentIndex - 1] : null;
      const nextSibling = hasNextSibling ? parentNode.childNodes[currentIndex + 1] : null;
      
      if (shouldRemoveWhitespaceOutside(prevSibling as HTMLElement) || 
          (shouldRemoveWhitespaceInside(el.parentNode as HTMLElement) && !hasPrevSibling)) {
        text = text.replace(/^[\t\r\n ]+/, '');
      }
      if (shouldRemoveWhitespaceOutside(nextSibling as HTMLElement) || 
          (shouldRemoveWhitespaceInside(el.parentNode as HTMLElement) && !hasNextSibling)) {
        text = text.replace(/[\t\r\n ]+$/, '');
      }
    }

    return text;
  }

  getConvFnCached(tagName: string): any {
    if (!this.convertFnCache.has(tagName)) {
      this.convertFnCache.set(tagName, this.getConvFn(tagName));
    }
    return this.convertFnCache.get(tagName);
  }

  getConvFn(tagName: string): any {
    tagName = tagName.toLowerCase();

    if (!this.shouldConvertTag(tagName)) {
      return null;
    }

    const convertFnName = `convert_${tagName.replace(/[\[\]:-]/g, '_')}`;
    if (typeof (this as any)[convertFnName] === 'function') {
      return (this as any)[convertFnName].bind(this);
    }

    const match = reHtmlHeading.exec(tagName);
    if (match) {
      const n = parseInt(match[1], 10);
      return (el: HTMLElement, text: string, parent_tags: Set<string>) => this.convert_hN(n, el, text, parent_tags);
    }

    return null;
  }

  shouldConvertTag(tag: string): boolean {
    const strip = this.options.strip;
    const convert = this.options.convert;
    if (strip) {
      return !strip.includes(tag);
    } else if (convert) {
      return convert.includes(tag);
    } else {
      return true;
    }
  }

  escape(text: string, parent_tags: Set<string>): string {
    if (!text) return '';

    if (this.options.escape_misc) {
      // Escape miscellaneous special Markdown characters
      text = text.replace(/([\\&<>`~`=+|])/g, '\\$1');
      // Escape sequence of one or more consecutive '-', preceded and followed by whitespace or start/end of fragment
      text = text.replace(/(\s|^)(-+(?:\s|$))/g, '$1\\$2');
      // Escape sequence of up to six consecutive '#', preceded and followed by whitespace or start/end of fragment
      text = text.replace(/(\s|^)(#{1,6}(?:\s|$))/g, '$1\\$2');
      // Escape '.' or ')' preceded by up to nine digits
      text = text.replace(/((?:\s|^)[0-9]{1,9})([.)](?:\s|$))/g, '$1\\$2');
      // Escape square brackets
      text = text.replace(/\[/g, '\\[');
      text = text.replace(/\]/g, '\\]');
    }

    if (this.options.escape_asterisks) {
      text = text.replace(/\*/g, '\\*');
    }
    if (this.options.escape_underscores) {
      text = text.replace(/_/g, '\\_');
    }
    
    return text;
  }

  underline(text: string, padChar: string): string {
    text = (text || '').trim();
    return text ? `\n\n${text}\n${padChar.repeat(text.length)}\n\n` : '';
  }

  convert_a(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_noformat')) {
      return text;
    }
    
    const [prefix, suffix, chompedText] = chomp(text);
    if (!chompedText) {
      return '';
    }
    
    const href = el.getAttribute('href');
    const title = el.getAttribute('title');
    
    if (this.options.autolinks && 
        chompedText.replace(/\\_/g, '_') === href && 
        !title && 
        !this.options.default_title) {
      return `<${href}>`;
    }
    
    let finalTitle = title;
    if (this.options.default_title && !title) {
      finalTitle = href;
    }
    
    const titlePart = finalTitle ? ` "${finalTitle.replace(/"/g, '\\"')}"` : '';
    return href ? `${prefix}[${chompedText}](${href}${titlePart})${suffix}` : chompedText;
  }

  convert_b = abstractInlineConversion(function(self: MarkdownConverter) {
    return self.options.strong_em_symbol.repeat(2);
  });

  convert_blockquote(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    // Use custom trim that preserves non-breaking spaces
    text = this.trimWhitespace(text || '');
    if (parent_tags.has('_inline')) {
      return ' ' + text + ' ';
    }
    if (!text) {
      return "\n";
    }

    const lines = text.split('\n');
    const indentedLines = lines.map(line => {
      // For blockquote lines, we need to preserve non-breaking spaces but trim regular whitespace
      // Use a custom trim that only removes regular spaces, tabs, newlines but preserves \u00a0
      const trimmedLine = line.replace(/^[\t\r\n ]+/, '').replace(/[\t\r\n ]+$/, '');
      if (!trimmedLine) return '>';
      return '> ' + trimmedLine;
    });
    
    return '\n' + indentedLines.join('\n') + '\n\n';
  }

  convert_br(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_inline')) {
      return ' ';
    }

    if (this.options.newline_style.toLowerCase() === BACKSLASH) {
      return '\\\n';
    } else {
      return '  \n';
    }
  }

  convert_code(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_noformat')) {
      return text;
    }

    const [prefix, suffix, chompedText] = chomp(text);
    if (!chompedText) {
      return '';
    }

    const backtickMatches = chompedText.match(reBacktickRuns);
    const maxBackticks = backtickMatches ? Math.max(...backtickMatches.map(match => match.length)) : 0;
    const markupDelimiter = '`'.repeat(maxBackticks + 1);

    let finalText = chompedText;
    if (maxBackticks > 0) {
      finalText = " " + chompedText + " ";
    }

    return `${prefix}${markupDelimiter}${finalText}${markupDelimiter}${suffix}`;
  }

  convert_del = abstractInlineConversion(() => '~~');

  convert_div(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_inline')) {
      return ' ' + text.trim() + ' ';
    }
    text = text.trim();
    return text ? `\n\n${text}\n\n` : '';
  }

  convert_article = this.convert_div;
  convert_section = this.convert_div;

  convert_em = abstractInlineConversion(function(self: MarkdownConverter) {
    return self.options.strong_em_symbol;
  });

  convert_kbd = this.convert_code;

  convert_dd(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    text = (text || '').trim();
    if (parent_tags.has('_inline')) {
      return ' ' + text + ' ';
    }
    if (!text) {
      return '\n';
    }

    const lines = text.split('\n');
    const indentedLines = lines.map((line, index) => {
      if (!line) return '';
      // First line: ":   " (colon + 3 spaces)
      // Subsequent lines: "    " (4 spaces)
      return index === 0 ? ':   ' + line : '    ' + line;
    });
    text = indentedLines.join('\n');

    return `${text}\n`;
  }

  convert_dl(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return this.convert_div(el, text, parent_tags);
  }

  convert_dt(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    text = (text || '').trim();
    text = text.replace(reAllWhitespace, ' ');
    if (parent_tags.has('_inline')) {
      return ' ' + text + ' ';
    }
    if (!text) {
      return '\n';
    }

    return '\n\n' + text + '\n';
  }

  convert_hN(n: number, el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_inline')) {
      return text;
    }

    n = Math.max(1, Math.min(6, n));

    const style = this.options.heading_style.toLowerCase();
    text = text.trim();
    if (style === UNDERLINED && n <= 2) {
      const line = n === 1 ? '=' : '-';
      return this.underline(text, line);
    }
    text = text.replace(reAllWhitespace, ' ');
    const hashes = '#'.repeat(n);
    if (style === ATX_CLOSED) {
      return `\n\n${hashes} ${text} ${hashes}\n\n`;
    }
    return `\n\n${hashes} ${text}\n\n`;
  }

  convert_hr(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '\n\n---\n\n';
  }

  convert_i = this.convert_em;

  convert_img(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    const alt = el.getAttribute('alt') || '';
    const src = el.getAttribute('src') || '';
    const title = el.getAttribute('title') || '';
    const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : '';
    
    if (parent_tags.has('_inline') && 
        el.parentNode?.tagName && 
        !this.options.keep_inline_images_in.includes(el.parentNode.tagName.toLowerCase())) {
      return alt;
    }

    return `![${alt}](${src}${titlePart})`;
  }

  convert_video(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_inline') && 
        el.parentNode?.tagName && 
        !this.options.keep_inline_images_in.includes(el.parentNode.tagName.toLowerCase())) {
      return text;
    }
    
    const src = el.getAttribute('src') || '';
    let actualSrc = src;
    if (!actualSrc) {
      const sources = el.querySelectorAll('source[src]');
      if (sources.length > 0) {
        actualSrc = sources[0].getAttribute('src') || '';
      }
    }
    
    const poster = el.getAttribute('poster') || '';
    if (actualSrc && poster) {
      return `[![${text}](${poster})](${actualSrc})`;
    }
    if (actualSrc) {
      return `[${text}](${actualSrc})`;
    }
    if (poster) {
      return `![${text}](${poster})`;
    }
    return text;
  }

  convert_list(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    let beforeParagraph = false;
    const nextSibling = el.nextElementSibling;
    if (nextSibling && !['ul', 'ol'].includes(nextSibling.tagName?.toLowerCase())) {
      beforeParagraph = true;
    }
    
    if (parent_tags.has('li')) {
      return '\n' + text.trimEnd();
    }
    
    return '\n\n' + text + (beforeParagraph ? '\n' : '');
  }

  convert_ul = this.convert_list;
  convert_ol = this.convert_list;

  convert_li(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    text = (text || '').trim();
    if (!text) {
      return "\n";
    }

    const parent = el.parentNode as HTMLElement;
    let bullet = '';
    
    if (parent && parent.tagName.toLowerCase() === 'ol') {
      const startAttr = parent.getAttribute('start');
      const start = startAttr && !isNaN(parseInt(startAttr, 10)) ? parseInt(startAttr, 10) : 1;
      const prevSiblings = Array.from(parent.children).filter((child: HTMLElement) => child.tagName.toLowerCase() === 'li');
      const currentIndex = prevSiblings.indexOf(el);
      bullet = `${start + currentIndex}.`;
    } else {
      let depth = -1;
      let current: HTMLElement | null = el;
      while (current) {
        if (current.tagName?.toLowerCase() === 'ul') {
          depth += 1;
        }
        current = current.parentNode as HTMLElement;
      }
      const bullets = this.options.bullets;
      bullet = bullets[depth % bullets.length];
    }
    
    bullet = bullet + ' ';
    const bulletWidth = bullet.length;
    const bulletIndent = ' '.repeat(bulletWidth);

    const lines = text.split('\n');
    const indentedLines = lines.map(line => line ? bulletIndent + line : '');
    text = indentedLines.join('\n');

    text = bullet + text.substring(bulletWidth);

    return `${text}\n`;
  }

  convert_p(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (parent_tags.has('_inline')) {
      return ' ' + this.trimWhitespace(text) + ' ';
    }
    text = this.trimWhitespace(text);
    if (this.options.wrap && this.options.wrap_width !== null && this.options.wrap_width !== undefined) {
      // Split by line breaks (two spaces followed by newline) to preserve them
      const parts = text.split(/  \n/);
      if (parts.length > 1) {
        // There are line breaks, process each part separately
        const processedParts = parts.map((part, index) => {
          if (index === parts.length - 1) {
            // Last part, no trailing line break
            return this.wrapText(part);
          } else {
            // Middle parts, add trailing line break
            return this.wrapText(part) + '  \n';
          }
        });
        text = processedParts.join('');
      } else {
        // No line breaks, wrap the text normally
        text = this.wrapText(text);
      }
    }
    return text ? `\n\n${text}\n\n` : '';
  }

  // Helper method to wrap text
  private wrapText(text: string): string {
    if (!this.options.wrap || this.options.wrap_width === null || this.options.wrap_width === undefined) {
      return text;
    }
    
    const lines = text.split('\n');
    const newLines = [];
    for (let line of lines) {
      // Use custom trim that preserves non-breaking spaces
      line = this.trimWhitespace(line);
      const lineNoTrailing = this.trimTrailingWhitespace(line);
      const trailing = line.substring(lineNoTrailing.length);
      if (lineNoTrailing.length > this.options.wrap_width) {
        const words = lineNoTrailing.split(' ');
        let wrappedLine = '';
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + word).length > this.options.wrap_width) {
            if (currentLine) {
              wrappedLine += this.trimWhitespace(currentLine) + '\n';
            }
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        }
        wrappedLine += this.trimWhitespace(currentLine);
        newLines.push(wrappedLine + trailing);
      } else {
        newLines.push(lineNoTrailing + trailing);
      }
    }
    return newLines.join('\n');
  }

  // Custom trim that preserves non-breaking spaces
  private trimWhitespace(text: string): string {
    return text.replace(/^[ \t\r\n]+/, '').replace(/[ \t\r\n]+$/, '');
  }

  // Custom trimEnd that preserves non-breaking spaces
  private trimTrailingWhitespace(text: string): string {
    return text.replace(/[ \t\r\n]+$/, '');
  }

  convert_pre(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    if (!text) {
      return '';
    }
    
    let codeLanguage = this.options.code_language;

    if (this.options.code_language_callback) {
      codeLanguage = this.options.code_language_callback(el) || codeLanguage;
    }

    // Handle strip_pre options using the new functions
    const stripPreOption = this.options.strip_pre;
    if (stripPreOption === STRIP) {
      text = stripPre(text);
    } else if (stripPreOption === STRIP_ONE) {
      text = strip1Pre(text);
    } else if (stripPreOption === null) {
      // null: Keep all whitespace as-is
      // No processing needed
    }

    // For STRIP_ONE, we need to preserve the exact format that Python produces
    // Python's convert_pre returns: \n\n```\n  \n  Hello  \n  \n```\n\n
    // But the content after strip1Pre should be:   \n  Hello  \n  
    if (stripPreOption === STRIP_ONE) {
      return `\n\n\`\`\`${codeLanguage}\n${text}\n\`\`\`\n\n`;
    } else {
      return `\n\n\`\`\`${codeLanguage}\n${text}\n\`\`\`\n\n`;
    }
  }

  convert_q(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '"' + text + '"';
  }

  convert_script(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '';
  }

  convert_style(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '';
  }

  convert_s = this.convert_del;
  convert_strong = this.convert_b;
  convert_samp = this.convert_code;

  convert_sub = abstractInlineConversion(function(self: MarkdownConverter) {
    return self.options.sub_symbol;
  });

  convert_sup = abstractInlineConversion(function(self: MarkdownConverter) {
    return self.options.sup_symbol;
  });

  convert_table(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '\n\n' + text.trim() + '\n\n';
  }

  convert_caption(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return text.trim() + '\n\n';
  }

  convert_figcaption(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    return '\n\n' + text.trim() + '\n\n';
  }

  convert_td(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    let colspan = 1;
    const colspanAttr = el.getAttribute('colspan');
    if (colspanAttr && !isNaN(parseInt(colspanAttr, 10))) {
      colspan = Math.max(1, Math.min(1000, parseInt(colspanAttr, 10)));
    }
    return ' ' + text.trim().replace(/\n/g, " ") + ' |'.repeat(colspan);
  }

  convert_th(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    let colspan = 1;
    const colspanAttr = el.getAttribute('colspan');
    if (colspanAttr && !isNaN(parseInt(colspanAttr, 10))) {
      colspan = Math.max(1, Math.min(1000, parseInt(colspanAttr, 10)));
    }
    return ' ' + text.trim().replace(/\n/g, " ") + ' |'.repeat(colspan);
  }

  convert_tr(el: HTMLElement, text: string, parent_tags: Set<string>): string {
    const cells = el.querySelectorAll('td, th');
    const isFirstRow = !el.previousElementSibling;
    const isHeadrow = cells.every((cell: HTMLElement) => cell.tagName.toLowerCase() === 'th') ||
                      (el.parentNode?.tagName.toLowerCase() === 'thead' &&
                       el.parentNode.querySelectorAll('tr').length === 1);
    
    const isHeadRowMissing = (isFirstRow && el.parentNode?.tagName.toLowerCase() !== 'tbody') ||
                             (isFirstRow && el.parentNode?.tagName.toLowerCase() === 'tbody' && 
                              el.parentNode.parentNode?.querySelectorAll('thead').length! < 1);
    
    let overline = '';
    let underline = '';
    let fullColspan = 0;
    
    for (const cell of cells as HTMLElement[]) {
      const colspanAttr = cell.getAttribute('colspan');
      if (colspanAttr && !isNaN(parseInt(colspanAttr, 10))) {
        fullColspan += Math.max(1, Math.min(1000, parseInt(colspanAttr, 10)));
      } else {
        fullColspan += 1;
      }
    }
    
    if ((isHeadrow || (isHeadRowMissing && this.options.table_infer_header)) && isFirstRow) {
      underline += '| ' + Array(fullColspan).fill('---').join(' | ') + ' |\n';
    } else if ((isHeadRowMissing && !this.options.table_infer_header) ||
               (isFirstRow && (el.parentNode?.tagName.toLowerCase() === 'table' ||
                (el.parentNode?.tagName.toLowerCase() === 'tbody' && 
                 !el.parentNode.previousElementSibling)))) {
      overline += '| ' + Array(fullColspan).fill('').join(' | ') + ' |\n';
      overline += '| ' + Array(fullColspan).fill('---').join(' | ') + ' |\n';
    }
    
    return overline + '|' + text + '\n' + underline;
  }
}

export function markdownify(html: string, options: Partial<MarkdownConverterOptions> = {}): string {
  return new MarkdownConverter(options).convert(html);
}