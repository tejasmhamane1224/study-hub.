import katex from 'katex';
import { marked } from 'marked';

export function renderFormattedContent(content) {
  if (!content) return '';

  try {
    // 1. Replace display block math $$...$$ or \[...\]
    let processed = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return match;
      }
    });

    processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return match;
      }
    });

    // 2. Replace inline math $...$ or \(...\)
    processed = processed.replace(/\$([^$\n]+?)\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return match;
      }
    });

    processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return match;
      }
    });

    // 3. Render markdown
    return marked.parse(processed);
  } catch (err) {
    console.error("Math rendering error:", err);
    return marked.parse(content);
  }
}
