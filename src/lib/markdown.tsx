// Markdown/MDX-token pipeline. Content files are .mdx but contain no JSX, only Markdown (GFM) plus the
// {{token}} vocabulary from the blueprint (§4.4) and HTML-comment markers. We parse them as Markdown
// (remark) instead of MDX so `{{…}}`, `<5` and Hebrew punctuation can never break compilation, and no
// content can execute code. Tokens become custom `il-token` elements resolved by server components.
import type { ReactNode } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { visit, SKIP } from 'unist-util-visit';
import type { Root, Parent, Text, Heading, PhrasingContent } from 'mdast';
import type { Root as HRoot, Element as HElement } from 'hast';

export const TOKEN_KINDS = ['slot', 'aff', 'sponsored', 'link', 'chart', 'calc', 'sources', 'updated'] as const;
export type TokenKind = (typeof TOKEN_KINDS)[number];
export const TOKEN_RE = /\{\{(slot|aff|sponsored|link|chart|calc|sources|updated):([^}]*)\}\}/g;

export interface TokenOccurrence { kind: TokenKind; arg: string }

/** All tokens in a markdown string, ignoring those inside code spans/fences (authoring scaffolding). */
export function scanTokens(md: string): TokenOccurrence[] {
  const stripped = md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const out: TokenOccurrence[] = [];
  for (const m of stripped.matchAll(TOKEN_RE)) out.push({ kind: m[1] as TokenKind, arg: m[2].trim() });
  return out;
}

/** Any `{{…}}` left that is not part of the known vocabulary (→ unresolved token). */
export function findUnknownTokens(md: string): string[] {
  const stripped = md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const all = stripped.match(/\{\{[^}]*\}\}/g) ?? [];
  return all.filter((t) => !new RegExp(`^${TOKEN_RE.source}$`).test(t));
}

export function parseSourcesArg(arg: string): string[] {
  return arg.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
}

function textOf(node: { children?: unknown[]; value?: string }): string {
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map((c) => textOf(c as { children?: unknown[]; value?: string })).join('');
}

/** remark plugin: tokens → il-token nodes; HTML comments → markers/removed; table captions; answer box. */
function remarkIlTokens() {
  return (tree: Root) => {
    let lastHeading = '';
    // 1. headings + comments + raw html
    visit(tree, (node, index, parent) => {
      if (node.type === 'heading') lastHeading = textOf(node as unknown as { children?: unknown[] });
      if (node.type === 'table') {
        (node as unknown as { data: object }).data = {
          hProperties: { 'data-caption': lastHeading },
        };
      }
      if (node.type === 'html' && parent && index !== undefined) {
        const v = (node as { value: string }).value.trim();
        const marker = /^<!--\s*(DISC-PENSION)\s*-->$/.exec(v);
        const replacement = marker
          ? ({ type: 'ilMarker', data: { hName: 'il-marker', hProperties: { 'data-name': marker[1] } } } as unknown as PhrasingContent)
          : null;
        if (replacement) (parent as Parent).children.splice(index, 1, replacement as never);
        else (parent as Parent).children.splice(index, 1); // comments (LEGAL-REVIEW) and any raw HTML are dropped
        return [SKIP, index];
      }
      if (node.type === 'blockquote') {
        const first = (node as unknown as Parent).children[0] as Parent | undefined;
        const firstInline = first?.children?.[0] as { type: string; children?: { value?: string }[] } | undefined;
        if (firstInline?.type === 'strong' && /^תשובה קצרה/.test(firstInline.children?.[0]?.value ?? '')) {
          (node as unknown as { data: object }).data = { hProperties: { className: ['answer-box'] } };
        }
      }
      return undefined;
    });
    // 2. split text nodes on tokens
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined || !node.value.includes('{{')) return;
      const parts: PhrasingContent[] = [];
      let last = 0;
      const re = new RegExp(TOKEN_RE.source, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(node.value))) {
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        parts.push({
          type: 'ilToken',
          data: { hName: 'il-token', hProperties: { 'data-kind': m[1], 'data-arg': m[2].trim() } },
        } as unknown as PhrasingContent);
        last = m.index + m[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      (parent as Parent).children.splice(index, 1, ...(parts as never[]));
      return [SKIP, index + parts.length];
    });
    // 3. a paragraph that only holds one token/marker becomes a block-level node
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || index === undefined) return;
      const kids = node.children.filter((c) => !(c.type === 'text' && c.value.trim() === ''));
      if (kids.length === 1 && ((kids[0] as { type: string }).type === 'ilToken' || (kids[0] as { type: string }).type === 'ilMarker')) {
        const k = kids[0] as unknown as { data: { hProperties: Record<string, string> } };
        k.data.hProperties['data-block'] = 'true';
        (parent as Parent).children.splice(index, 1, kids[0] as never);
      }
    });
  };
}

/** remark plugin: highlight unfilled owner blanks in legal text (clearly marked draft fields). */
function remarkOwnerBlanks(keys: string[]) {
  return (tree: Root) => {
    if (!keys.length) return;
    const re = new RegExp(keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      const parts: PhrasingContent[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(node.value))) {
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        parts.push({
          type: 'ilBlank',
          data: { hName: 'mark', hProperties: { className: ['legal-blank'], title: 'שדה להשלמה על ידי בעל האתר' } },
          children: [{ type: 'text', value: m[0] }],
        } as unknown as PhrasingContent);
        last = m.index + m[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      (parent as Parent).children.splice(index, 1, ...(parts as never[]));
      return [SKIP, index + parts.length];
    });
  };
}

export interface HeadingInfo { id: string; text: string; depth: number }

export interface RenderOptions {
  components?: Record<string, unknown>;
  ownerBlankKeys?: string[];
}

export function extractHeadings(md: string): HeadingInfo[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(md) as Root;
  const out: HeadingInfo[] = [];
  const seen = new Map<string, number>();
  visit(tree, 'heading', (h: Heading) => {
    const text = textOf(h as unknown as { children?: unknown[] }).trim();
    let id = text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n}`;
    out.push({ id, text, depth: h.depth });
  });
  return out;
}

export function renderMarkdown(md: string, opts: RenderOptions = {}): ReactNode {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkIlTokens)
    .use(() => remarkOwnerBlanks(opts.ownerBlankKeys ?? []))
    .use(remarkRehype)
    .use(rehypeSlug);
  const mdast = processor.parse(md);
  const hast = processor.runSync(mdast, md) as HRoot;
  return toJsxRuntime(hast, {
    Fragment,
    jsx: jsx as never,
    jsxs: jsxs as never,
    components: opts.components as never,
  });
}

/** Split a markdown body at H2 boundaries: section 0 = everything before the first H2. */
export interface Section { heading: string | null; md: string }
export function splitSections(md: string): Section[] {
  const lines = md.split('\n');
  const sections: Section[] = [{ heading: null, md: '' }];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) inFence = !inFence;
    const m = !inFence && /^##\s+(.+?)\s*$/.exec(line);
    if (m) sections.push({ heading: m[1], md: `${line}\n` });
    else sections[sections.length - 1].md += `${line}\n`;
  }
  return sections;
}

export type { HElement };
