// Všechna emoji v textu (i ta napsaná uživatelem) se vykreslí jako 3D obrázky,
// takže vypadají všude stejně – na Windows, macOS, Linuxu i v prohlížeči.
// Stejný princip používá Figma: místo systémového písma se kreslí jednotná sada obrázků.
const RE = /\p{RI}\p{RI}|[#*0-9]️?⃣|(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️)\p{EMod}?(?:‍(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}️?)\p{EMod}?)*/gu;
const SKIN = /^1f3f[b-f]$/;
const SKIP = 'input, textarea, select, option, script, style, svg, canvas, .katex, [contenteditable], .no-emoji';

export function emojiKey(str) {
  return [...str].map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f' && !SKIN.test(h)).join('-');
}
export const emojiSrc = key => `emoji/u/${key}.webp`;

function fallback(e) { const img = e.currentTarget; img.replaceWith(document.createTextNode(img.alt)); }
function swap(node) {
  const text = node.nodeValue;
  RE.lastIndex = 0;
  if (!RE.test(text)) return;
  RE.lastIndex = 0;
  const frag = document.createDocumentFragment();
  let last = 0, m;
  while ((m = RE.exec(text))) {
    if (m.index > last) frag.append(text.slice(last, m.index));
    const img = document.createElement('img');
    img.className = 'emo emo-t';
    img.alt = m[0];
    img.draggable = false;
    img.decoding = 'async';
    img.src = emojiSrc(emojiKey(m[0]));
    img.addEventListener('error', fallback, { once: true });
    frag.append(img);
    last = m.index + m[0].length;
  }
  if (last < text.length) frag.append(text.slice(last));
  node.replaceWith(frag);
}
function scan(root) {
  if (root.nodeType === 3) { if (!root.parentElement?.closest(SKIP)) swap(root); return; }
  if (root.nodeType !== 1 || root.closest?.(SKIP)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const list = [];
  while (w.nextNode()) list.push(w.currentNode);
  list.forEach(swap);
}
export function initEmojiText(root = document.body) {
  scan(root);
  new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'characterData') scan(m.target);
      else m.addedNodes.forEach(scan);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true });
}
