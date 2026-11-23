import { escapeHtml, safeHttpUrl } from './http';

function formatInline(raw: string): string {
  let text = escapeHtml(raw);
  // Inline images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, url: string) => {
    const safeUrl = safeHttpUrl(url);
    if (!safeUrl) return '';
    return `<img src="${escapeHtml(safeUrl)}" alt="${alt}" loading="lazy" decoding="async" class="my-6 w-full rounded-sm border border-[#e5ded3] object-cover" />`;
  });
  // Links: [label](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, url: string) => {
    const safeUrl = safeHttpUrl(url);
    if (!safeUrl) return label;
    const isExternal = !safeUrl.startsWith('https://www.satvastones.in') && !safeUrl.startsWith('https://satvastones.in');
    const rel = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapeHtml(safeUrl)}"${rel} class="text-[#8d3f3d] underline decoration-[#c5a059]/60 underline-offset-4 transition-colors hover:text-[#14110f]">${label}</a>`;
  });
  // Bold: **text** or __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[#14110f]">$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong class="font-semibold text-[#14110f]">$1</strong>');
  // Italic: *text* or _text_
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');
  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code class="rounded bg-[#f1ece3] px-1.5 py-0.5 font-mono text-[0.88em] text-[#14110f]">$1</code>');
  return text;
}

/**
 * Converts editorial Markdown into clean, XSS-safe HTML matching the
 * Satvastones typography scale. Safe for both Cloudflare Workers SSR and browser preview.
 */
export function renderEditorialMarkdown(markdown: string): string {
  const source = String(markdown || '').replace(/\r\n/g, '\n').trim();
  if (!source) return '';

  const lines = source.split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p class="mb-5 text-[15px] leading-[1.85] text-[#3d3732] sm:text-base">${formatInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    const tag = listType;
    const cls =
      tag === 'ul'
        ? 'mb-6 ml-5 list-disc space-y-2.5 text-[15px] leading-[1.8] text-[#3d3732] marker:text-[#c5a059] sm:text-base'
        : 'mb-6 ml-5 list-decimal space-y-2.5 text-[15px] leading-[1.8] text-[#3d3732] marker:text-[#8d3f3d] sm:text-base';
    blocks.push(`<${tag} class="${cls}">${listItems.map((item) => `<li>${formatInline(item)}</li>`).join('')}</${tag}>`);
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) return;
    blocks.push(
      `<blockquote class="my-7 border-l-2 border-[#c5a059] bg-[#f4efe7] px-6 py-4 font-display text-xl italic leading-relaxed text-[#14110f] sm:text-2xl">${formatInline(quoteLines.join(' '))}</blockquote>`
    );
    quoteLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push('<hr class="my-9 border-0 border-t border-[#e5ded3]" />');
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        `<h3 class="font-display mb-3 mt-8 text-2xl leading-snug text-[#14110f] sm:text-[1.75rem]">${formatInline(h3Match[1])}</h3>`
      );
      continue;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        `<h2 class="font-display mb-4 mt-10 text-3xl leading-tight text-[#14110f] sm:text-[2.15rem]">${formatInline(h2Match[1])}</h2>`
      );
      continue;
    }

    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        `<h2 class="font-display mb-4 mt-10 text-3xl leading-tight text-[#14110f] sm:text-[2.25rem]">${formatInline(h1Match[1])}</h2>`
      );
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    const ulMatch = line.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(ulMatch[1]);
      continue;
    }

    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(olMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return blocks.join('\n');
}

export function estimateReadTimeMinutes(content: string): number {
  const words = String(content || '')
    .replace(/[#*_`>\-\[\]()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.min(45, Math.ceil(words / 200)));
}
