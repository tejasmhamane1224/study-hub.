import katex from 'katex';
import { marked } from 'marked';

export function renderFormattedContent(content) {
  if (!content || typeof content !== 'string') return '';

  try {
    const placeholders = {};
    let placeholderIndex = 0;

    const createPlaceholder = (replacement) => {
      const key = `@@STUDY_HUB_TOKEN_${placeholderIndex++}@@`;
      placeholders[key] = replacement;
      return key;
    };

    // 1. Protect fenced code blocks ```...```
    let text = content.replace(/(```[\s\S]*?```)/g, (match) => {
      return createPlaceholder(match);
    });

    // 2. Protect inline code `...`
    text = text.replace(/(`[^`\n]+?`)/g, (match) => {
      return createPlaceholder(match);
    });

    // 3. Extract & Render Display Math: $$...$$ and \[...\]
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        return createPlaceholder(`<div class="katex-display-wrapper my-3 overflow-x-auto custom-scrollbar">${rendered}</div>`);
      } catch {
        return match;
      }
    });

    text = text.replace(/\\\[([\s\S]+?)\\\]/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        return createPlaceholder(`<div class="katex-display-wrapper my-3 overflow-x-auto custom-scrollbar">${rendered}</div>`);
      } catch {
        return match;
      }
    });

    // 4. Extract & Render Inline Math: $...$ and \(...\)
    text = text.replace(/\$([^$\n]+?)\$/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        return createPlaceholder(rendered);
      } catch {
        return match;
      }
    });

    text = text.replace(/\\\(([\s\S]+?)\\\)/g, (match, math) => {
      try {
        const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        return createPlaceholder(rendered);
      } catch {
        return match;
      }
    });

    // 5. Render markdown on clean text
    let html = marked.parse(text);

    // 6. Restore placeholders
    for (const [token, value] of Object.entries(placeholders)) {
      html = html.split(token).join(value);
    }

    return html;
  } catch (err) {
    console.error("Math rendering error:", err);
    try {
      return marked.parse(content);
    } catch {
      return content;
    }
  }
}
