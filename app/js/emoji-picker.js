// Výběr emoji (jako ve Figmě / na iPhonu): hledání, skupiny, naposledy použité,
// náhled s názvem. Celá sada 1 800+ 3D emoji (Microsoft Fluent Emoji, MIT).
import { h, sound } from './util.js';
import { lang } from './i18n.js';
import { profile, saveProfile } from './store.js';
import { emojiSrc } from './emoji-text.js';

let data = null;
const load = async () => (data ||= await fetch('emoji/index.json').then(r => r.json()));
const TAB = ['1f600', '1f44b', '1f43b', '1f354', '1f697', '26bd', '1f4a1', '2764', '1f3c1'];
const E = (cs, en) => (lang() === 'en' ? en : cs);
// a few Czech words so searching in Czech works for the most common emoji
const CS = { srdce: 'heart', kočka: 'cat', pes: 'dog', smích: 'laugh', úsměv: 'smile', oheň: 'fire', hvězda: 'star', kniha: 'book', tužka: 'pencil', mozek: 'brain', raketa: 'rocket', slunce: 'sun', měsíc: 'moon', květina: 'flower', strom: 'tree', káva: 'coffee', pizza: 'pizza', liška: 'fox', panda: 'panda', sova: 'owl', jednorožec: 'unicorn', robot: 'robot', hudba: 'music', palec: 'thumbs', ruka: 'hand', oči: 'eyes', pláč: 'cry', smutný: 'sad', vlajka: 'flag', česko: 'czechia', auto: 'car', dům: 'house', počítač: 'computer', telefon: 'phone', hodiny: 'clock', dárek: 'gift', míč: 'ball', zvíře: 'animal', ryba: 'fish', pták: 'bird', jídlo: 'food', ovoce: 'fruit', jablko: 'apple', vlna: 'wave', déšť: 'rain', sníh: 'snow', blesk: 'lightning', poklad: 'gem', koruna: 'crown', pohár: 'trophy', medaile: 'medal', cíl: 'target', atom: 'atom', magnet: 'magnet', lupa: 'magnifying', zámek: 'lock', klíč: 'key' };

export function pickEmoji(anchor, { title } = {}) {
  return new Promise(async resolve => {
    const d = await load();
    const recent = (profile.emojiRecent ||= []);
    const box = h('div', { class: 'epick', role: 'dialog' });
    const search = h('input', { class: 'epick-search', type: 'search', placeholder: E('Hledat emoji (anglicky i česky)', 'Search emoji'), autocomplete: 'off' });
    const tabs = h('div', { class: 'epick-tabs' });
    const grid = h('div', { class: 'epick-grid' });
    const preview = h('div', { class: 'epick-foot' }, h('span', { class: 'epick-hint' }, title || E('Vyber emoji', 'Pick an emoji')));
    box.append(h('div', { class: 'epick-head' }, search), tabs, grid, preview);
    document.body.append(box);

    const cell = e => {
      const b = h('button', { class: 'epick-e', title: e[2], 'data-k': e[0] }, h('img', { src: emojiSrc(e[0]), alt: e[1] || '', loading: 'lazy', draggable: 'false' }));
      return b;
    };
    const byKey = new Map(d.list.map(e => [e[0], e]));
    const sections = [];
    function renderAll() {
      grid.innerHTML = ''; sections.length = 0;
      if (recent.length) {
        const sec = h('section', {}, h('div', { class: 'epick-cap' }, E('Naposledy použité', 'Recently used')));
        const g = h('div', { class: 'epick-set' }); recent.forEach(k => byKey.has(k) && g.append(cell(byKey.get(k)))); sec.append(g); grid.append(sec);
      }
      d.groups.forEach((gr, gi) => {
        const sec = h('section', { 'data-g': gi }, h('div', { class: 'epick-cap' }, lang() === 'en' ? gr[2] : gr[1]));
        const g = h('div', { class: 'epick-set' });
        d.list.forEach(e => { if (e[3] === gi) g.append(cell(e)); });
        sec.append(g); grid.append(sec); sections[gi] = sec;
      });
    }
    function renderSearch(q) {
      q = q.toLowerCase().trim();
      const terms = [q, ...Object.entries(CS).filter(([cs]) => cs.startsWith(q) || q.startsWith(cs)).map(([, en]) => en)];
      const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const res = terms.filter(Boolean).map(x => new RegExp('(^|[\\s:-])' + esc(x), 'i'));
      const score = e => (res.some(r => r.test(e[2])) ? 2 : res.some(r => r.test(e[4])) ? 1 : 0);
      const hits = d.list.map(e => [e, score(e)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      grid.innerHTML = '';
      const g = h('div', { class: 'epick-set' }); hits.slice(0, 400).forEach(e => g.append(cell(e)));
      grid.append(hits.length ? g : h('div', { class: 'epick-empty' }, E('Nic nenalezeno', 'Nothing found')));
    }
    TAB.forEach((k, gi) => tabs.append(h('button', { class: 'epick-tab', title: lang() === 'en' ? d.groups[gi][2] : d.groups[gi][1], onclick: () => { search.value = ''; renderAll(); sections[gi]?.scrollIntoView({ block: 'start' }); sound.tick(); } }, h('img', { src: emojiSrc(k), alt: '' }))));
    renderAll();
    search.oninput = () => (search.value.trim() ? renderSearch(search.value) : renderAll());
    grid.addEventListener('pointerover', e => {
      const b = e.target.closest('.epick-e'); if (!b) return;
      const em = byKey.get(b.dataset.k); if (!em) return;
      preview.innerHTML = '';
      preview.append(h('img', { src: emojiSrc(em[0]), alt: '' }), h('div', {}, h('b', {}, em[2]), em[4] ? h('small', {}, em[4]) : null));
    });
    grid.addEventListener('click', e => {
      const b = e.target.closest('.epick-e'); if (!b) return;
      const k = b.dataset.k;
      profile.emojiRecent = [k, ...recent.filter(x => x !== k)].slice(0, 24); saveProfile();
      sound.select();
      done(k);
    });

    // position next to the anchor (bottom sheet on phones)
    const r = anchor?.getBoundingClientRect?.();
    if (r && innerWidth > 640) {
      const W = 372, H = Math.min(440, innerHeight - 24);
      const below = innerHeight - r.bottom > H + 12;
      Object.assign(box.style, { left: Math.max(12, Math.min(r.left, innerWidth - W - 12)) + 'px', top: (below ? r.bottom + 8 : Math.max(12, r.top - H - 8)) + 'px', height: H + 'px' });
    } else box.classList.add('sheet');
    requestAnimationFrame(() => box.classList.add('open'));
    sound.open();
    setTimeout(() => search.focus({ preventScroll: true }), 120);
    const outside = e => { if (!box.contains(e.target)) done(null); };
    const esc = e => { if (e.key === 'Escape') { e.stopPropagation(); done(null); } };
    setTimeout(() => { document.addEventListener('pointerdown', outside, true); document.addEventListener('keydown', esc, true); }, 0);
    function done(v) {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', esc, true);
      box.classList.remove('open');
      setTimeout(() => box.remove(), 250);
      resolve(v);
    }
  });
}
