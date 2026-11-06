// Přihlašovací obrazovka (ve stylu zamčeného iPhonu) a první spuštění.
import { h, emo, sleep, sound, confetti } from '../util.js';
import { icon } from '../icons.js';
import { listUsers, createUser, verifyPin, signIn, AVATARS, COLORS } from '../auth.js';
import { store } from '../store.js';

const T = (cs, en) => (navigator.language?.startsWith('cs') || true ? cs : en);

function avatarEl(u, size = 84) {
  const a = h('div', { class: 'avatar', style: { '--av': u.color, width: size + 'px', height: size + 'px' }, html: emo(u.avatar) });
  return a;
}

function clock() {
  const el = h('div', { class: 'lk-clock' });
  const upd = () => {
    const d = new Date();
    el.innerHTML = `<div class="lk-date">${d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}</div><div class="lk-time">${d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</div>`;
  };
  upd();
  const t = setInterval(upd, 10000);
  el._stop = () => clearInterval(t);
  return el;
}

// iOS-like PIN pad. resolves with the entered PIN or null (cancel)
export function pinPad(host, { title, subtitle, head = null, length = 4, onSubmit, cancelLabel = T('Zrušit', 'Cancel') }) {
  return new Promise(resolve => {
    let pin = '';
    const dots = h('div', { class: 'pin-dots' }, ...Array.from({ length }, () => h('i')));
    const keys = h('div', { class: 'pin-keys' });
    const sub = h('div', { class: 'pin-sub' }, subtitle || '');
    const box = h('div', { class: 'pin' }, head, h('div', { class: 'pin-title' }, title), sub, dots, keys);
    const render = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < pin.length));
    const press = async k => {
      if (k === 'del') { pin = pin.slice(0, -1); render(); return; }
      if (pin.length >= length) return;
      pin += k; render();
      if (pin.length === length) {
        await sleep(120);
        const ok = await onSubmit(pin);
        if (ok === false) {
          sound.wrong();
          dots.classList.add('shake'); sub.textContent = T('Špatný PIN. Zkus to znovu.', 'Wrong PIN. Try again.');
          setTimeout(() => { dots.classList.remove('shake'); pin = ''; render(); }, 520);
        } else { cleanup(); resolve(pin); }
      }
    };
    const letters = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
    for (let i = 1; i <= 9; i++) keys.append(h('button', { class: 'pin-key', onclick: () => press(String(i)) }, h('b', {}, String(i)), h('small', {}, letters[i - 1])));
    keys.append(h('button', { class: 'pin-key text', onclick: () => { cleanup(); resolve(null); } }, cancelLabel), h('button', { class: 'pin-key', onclick: () => press('0') }, h('b', {}, '0')), h('button', { class: 'pin-key text', onclick: () => press('del'), html: icon('left') }));
    const onKey = e => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Escape') { cleanup(); resolve(null); } };
    window.addEventListener('keydown', onKey);
    const cleanup = () => { window.removeEventListener('keydown', onKey); box.classList.add('out'); setTimeout(() => box.remove(), 300); };
    host.append(box);
  });
}

export async function showLock(root, onDone) {
  const users = await listUsers();
  root.innerHTML = '';
  const wall = h('div', { class: 'lk-wall' });
  const shell = h('div', { class: 'lk' }, wall);
  root.append(shell);
  if (!users.length) return onboarding(shell, onDone);

  const clk = clock();
  const grid = h('div', { class: 'lk-users' });
  const panel = h('div', { class: 'lk-panel' }, h('div', { class: 'lk-q' }, T('Kdo se dnes učí?', 'Who is studying today?')), grid);
  shell.append(clk, panel);
  if (window.folio?.quit && !window.folio.frameless) shell.append(h('button', { class: 'lk-power', title: 'Ukončit', html: icon('x'), onclick: () => window.folio.quit() }));
  const last = await store.get('global:lastUser');
  users.sort((a, b) => (b.id === last) - (a.id === last));
  users.forEach((u, i) => {
    const b = h('button', { class: 'lk-user rise', style: { animationDelay: 120 + i * 70 + 'ms' } }, avatarEl(u), h('span', {}, u.name), u.pin ? h('small', { html: icon('lock') }) : null);
    b.onclick = async () => {
      if (u.pin) {
        panel.classList.add('dim'); shell.classList.add('pinning');
        const ok = await pinPad(shell, { head: h('div', { class: 'pin-av' }, avatarEl(u, 60)), title: u.name, subtitle: T('Zadej PIN', 'Enter your PIN'), onSubmit: p => verifyPin(u, p) });
        if (ok == null) { panel.classList.remove('dim'); shell.classList.remove('pinning'); return; }
      }
      await unlock(u);
    };
    grid.append(b);
  });
  grid.append(h('button', { class: 'lk-user add rise', style: { animationDelay: 120 + users.length * 70 + 'ms' }, onclick: () => { clk._stop(); shell.innerHTML = ''; shell.append(wall); onboarding(shell, onDone, true); } },
    h('div', { class: 'avatar add', html: icon('plus') }), h('span', {}, T('Nový profil', 'New profile'))));

  async function unlock(u) {
    await signIn(u);
    sound.correct();
    shell.classList.add('unlocking');
    clk._stop();
    await sleep(520);
    onDone(u);
  }
}

async function onboarding(shell, onDone, addOnly = false) {
  const stage = h('div', { class: 'ob' });
  shell.append(stage);
  const data = { name: '', avatar: AVATARS[0], color: COLORS[0], lang: 'cs', pin: null };
  const slide = (...kids) => { stage.innerHTML = ''; const s = h('div', { class: 'ob-slide' }, ...kids); stage.append(s); return s; };

  function welcome() {
    slide(
      h('img', { class: 'ob-icon', src: 'assets/icon-512.png', alt: '' }),
      h('h1', { class: 'ob-title' }, 'Folio'),
      h('p', { class: 'ob-text' }, T('Tvoje učebnice matematiky pro fyziku a techniku – kniha, lekce s animacemi, testy, kartičky a sešit na psaní perem. Všechno na jednom místě.', 'Your maths textbook – book, animated lessons, tests, flashcards and a pen notebook in one place.')),
      h('div', { class: 'ob-feats' },
        feat('openbook', T('Kniha', 'Book'), T('1 363 stran, listuješ jako v papírové', 'Turn pages like paper')),
        feat('bulb', T('31 kapitol', '31 chapters'), T('Lekce česky i anglicky', 'Lessons in Czech & English')),
        feat('pencil', T('Pero', 'Pen'), T('Poznámky přímo do stránek', 'Write right on the pages'))),
      h('button', { class: 'btn primary big capsule ob-next', onclick: profileStep }, T('Pokračovat', 'Continue')));
  }
  function feat(e, t, s) { return h('div', { class: 'ob-feat' }, h('div', { html: emo(e) }), h('b', {}, t), h('small', {}, s)); }

  function profileStep() {
    const preview = h('div', { class: 'avatar ob-preview', style: { '--av': data.color }, html: emo(data.avatar) });
    const name = h('input', { class: 'input ob-name', placeholder: T('Jak ti máme říkat?', 'What should we call you?'), value: data.name, maxlength: 24 });
    const avs = h('div', { class: 'ob-avatars' });
    AVATARS.forEach(a => {
      const b = h('button', { class: 'ob-av' + (a === data.avatar ? ' on' : ''), html: emo(a) });
      b.onclick = () => { data.avatar = a; preview.innerHTML = emo(a); preview.animate([{ transform: 'scale(.8)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'cubic-bezier(.34,1.4,.64,1)' }); [...avs.children].forEach(x => x.classList.toggle('on', x === b)); };
      avs.append(b);
    });
    const more = h('button', { class: 'ob-av more', title: T('Jakékoli emoji…', 'Any emoji…'), html: icon('plus') });
    more.onclick = async () => {
      const { pickEmoji } = await import('../emoji-picker.js');
      const k = await pickEmoji(more, { title: T('Tvůj avatar', 'Your avatar') });
      if (!k) return;
      data.avatar = 'u:' + k; preview.innerHTML = emo(data.avatar); more.innerHTML = emo(data.avatar);
      [...avs.children].forEach(x => x.classList.toggle('on', x === more));
    };
    avs.append(more);
    const cols = h('div', { class: 'ob-colors' });
    COLORS.forEach(c => {
      const b = h('button', { class: 'ob-color' + (c === data.color ? ' on' : ''), style: { '--c': c } });
      b.onclick = () => { data.color = c; preview.style.setProperty('--av', c); [...cols.children].forEach(x => x.classList.toggle('on', x === b)); };
      cols.append(b);
    });
    const langSeg = h('div', { class: 'seg' });
    [['cs', 'Čeština'], ['en', 'English'], ['both', 'CZ + EN']].forEach(([v, l]) => langSeg.append(h('button', { class: data.lang === v ? 'on' : '', onclick: e => { data.lang = v; [...langSeg.children].forEach(x => x.classList.toggle('on', x === e.currentTarget)); } }, l)));
    const next = h('button', { class: 'btn primary big capsule ob-next' }, T('Pokračovat', 'Continue'));
    next.onclick = () => { data.name = name.value.trim(); if (!data.name) { name.classList.add('shake'); setTimeout(() => name.classList.remove('shake'), 500); name.focus(); return; } pinStep(); };
    name.addEventListener('keydown', e => { if (e.key === 'Enter') next.click(); });
    slide(h('div', { class: 'ob-step' }, T('Krok 1 ze 2', 'Step 1 of 2')), preview, h('h2', { class: 'ob-h2' }, T('Vytvoř si profil', 'Create your profile')), name, avs, cols,
      h('div', { class: 'ob-row' }, h('span', { class: 'muted' }, T('Jazyk lekcí', 'Lesson language')), langSeg), next,
      addOnly ? h('button', { class: 'btn ghost', onclick: () => location.reload() }, T('Zpět', 'Back')) : null);
    setTimeout(() => name.focus(), 350);
  }
  function pinStep() {
    const s = slide(h('div', { class: 'ob-step' }, T('Krok 2 ze 2', 'Step 2 of 2')), h('div', { class: 'avatar ob-preview', style: { '--av': data.color }, html: emo(data.avatar) }),
      h('h2', { class: 'ob-h2' }, T(`Ahoj, ${data.name}`, `Hi, ${data.name}`)),
      h('p', { class: 'ob-text' }, T('Chceš si profil zamknout PINem? Hodí se, když počítač používá víc lidí.', 'Lock your profile with a PIN? Handy if others use this computer.')));
    const host = h('div', { class: 'ob-pinhost' });
    s.append(host, h('button', { class: 'btn ghost', onclick: () => finish() }, T('Bez PINu', 'No PIN')));
    pinPad(host, { title: '', subtitle: T('Zvol 4 číslice', 'Choose 4 digits'), cancelLabel: '', onSubmit: async p => { data.pin = p; return true; } }).then(p => { if (p) finish(); });
  }
  async function finish() {
    const u = await createUser(data);
    slide(h('div', { class: 'avatar ob-preview big', style: { '--av': data.color }, html: emo(data.avatar) }),
      h('h2', { class: 'ob-h2' }, T('Všechno je připravené', 'You are all set')),
      h('p', { class: 'ob-text' }, T('Kniha, lekce i poznámky se ukládají do tohoto profilu.', 'Book, lessons and notes are saved to this profile.')));
    confetti({ count: 160 });
    sound.correct();
    await sleep(1400);
    shell.classList.add('unlocking');
    await sleep(500);
    onDone(u);
  }
  addOnly ? profileStep() : welcome();
}
