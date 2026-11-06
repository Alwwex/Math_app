import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

const hermite = (n, x) => { let h0 = 1, h1 = 2 * x; if (n === 0) return 1; for (let k = 1; k < n; k++) { const h2 = 2 * x * h1 - 2 * k * h0; h0 = h1; h1 = h2; } return h1; };

export default {
  intro: D('Kvantová mechanika jazykem operátorů: komutátory, relace neurčitosti, moment hybnosti a žebříkové operátory harmonického oscilátoru – mnohdy bez řešení jediné diferenciální rovnice.',
    'Quantum mechanics in operator language: commutators, uncertainty relations, angular momentum and the ladder operators of the harmonic oscillator – often without solving a single differential equation.'),
  steps: [
    step('19.1', D('Operátorový formalismus a komutátory', 'Operator formalism and commutators'), 'atom', [
      lead('Pozorovatelné veličiny jsou hermitovské operátory. Klíčová otázka: záleží na pořadí? To měří **komutátor** $[A, B] = AB - BA$.', 'Observables are Hermitian operators. The key question: does order matter? That is measured by the **commutator** $[A, B] = AB - BA$.'),
      math('[\\hat x, \\hat p_x] = i\\hbar,\\qquad \\hat p_x = -i\\hbar\\dfrac{\\partial}{\\partial x}'),
      p('Když dva operátory komutují, mají společné vlastní funkce – obě veličiny lze současně přesně změřit. Když ne, platí **relace neurčitosti** $\\Delta A\\,\\Delta B \\ge \\frac12|\\langle[A, B]\\rangle|$.', 'Commuting operators share eigenfunctions – both quantities can be measured exactly together. If not, the **uncertainty relation** $\\Delta A\\,\\Delta B \\ge \\frac12|\\langle[A, B]\\rangle|$ holds.'),
      example(D('Komutátor polohy a hybnosti', 'Position–momentum commutator'), D('Ověř $[x, p] = i\\hbar$ působením na funkci $f$.', 'Verify $[x, p] = i\\hbar$ acting on a function $f$.'),
        [D('$xpf = -i\\hbar x f\'$.', '$xpf = -i\\hbar x f\'$.'), D('$pxf = -i\\hbar(xf)\' = -i\\hbar(f + xf\')$.', '$pxf = -i\\hbar(xf)\' = -i\\hbar(f + xf\')$.'), D('Rozdíl: $(xp - px)f = i\\hbar f$.', 'Difference: $(xp - px)f = i\\hbar f$.')], '$[x, p] = i\\hbar$'),
      check(mcq(D('Z $[x, p] = i\\hbar$ plyne…', 'From $[x, p] = i\\hbar$ it follows that…'), ['$\\Delta x\\,\\Delta p \\ge \\hbar/2$', '$\\Delta x = \\Delta p$', '$x$ a $p$ komutují', '$p = 0$'], 0, D('Heisenbergova relace neurčitosti.', 'Heisenberg’s uncertainty relation.'))),
    ]),
    step('19.2', D('Moment hybnosti', 'Angular momentum'), 'cyclone', [
      lead('Složky momentu hybnosti spolu nekomutují: $[L_x, L_y] = i\\hbar L_z$. Komutuje s nimi ale $L^2$.', 'The components of angular momentum do not commute: $[L_x, L_y] = i\\hbar L_z$. But $L^2$ commutes with all of them.'),
      math('L^2 Y_\\ell^m = \\ell(\\ell + 1)\\hbar^2\\,Y_\\ell^m,\\qquad L_z Y_\\ell^m = m\\hbar\\,Y_\\ell^m,\\quad m = -\\ell, \\dots, \\ell'),
      p('Žebříkové operátory $L_\\pm = L_x \\pm iL_y$ posouvají $m$ o jedničku nahoru nebo dolů – celé spektrum odvodíme jen z komutátorů.', 'Ladder operators $L_\\pm = L_x \\pm iL_y$ shift $m$ up or down by one – the whole spectrum follows from commutators alone.'),
      check(num(D('Kolik hodnot $m$ připadá na $\\ell = 2$?', 'How many values of $m$ for $\\ell = 2$?'), 5, D('$m = -2, -1, 0, 1, 2$ – tedy $2\\ell + 1$.', '$m = -2, -1, 0, 1, 2$ – i.e. $2\\ell + 1$.'))),
    ]),
    step('19.2', D('Harmonický oscilátor pomocí žebříku', 'The harmonic oscillator by ladder operators'), 'bell', [
      lead('Definujeme $a = \\frac{1}{\\sqrt2}(\\hat x + i\\hat p)$ a $a^\\dagger$ (v bezrozměrných jednotkách). Platí $[a, a^\\dagger] = 1$ a $H = \\hbar\\omega(a^\\dagger a + \\frac12)$.', 'Define $a = \\frac{1}{\\sqrt2}(\\hat x + i\\hat p)$ and $a^\\dagger$ (dimensionless units). Then $[a, a^\\dagger] = 1$ and $H = \\hbar\\omega(a^\\dagger a + \\frac12)$.'),
      p('$a^\\dagger$ přidá jedno kvantum energie, $a$ jedno ubere. Nejnižší stav splní $a\\psi_0 = 0$, odkud $\\psi_0 \\propto e^{-x^2/2}$.', '$a^\\dagger$ adds one quantum, $a$ removes one. The ground state satisfies $a\\psi_0 = 0$, giving $\\psi_0 \\propto e^{-x^2/2}$.'),
      widget('paramPlot', {
        view: [-5, 5, 0, 9.5], params: [{ k: 'n', label: 'n', min: 0, max: 7, value: 3, int: true, step: 1 }],
        curves: [{ f: x => x * x / 2, color: 'var(--ink-3)', thin: true, label: 'V = x^2/2' },
          ...[0, 1, 2, 3, 4, 5, 6, 7].map(k => ({ f: (x, P) => { if (k > P.n) return NaN; let f = 1; for (let j = 2; j <= k; j++) f *= j; const N = 1 / Math.sqrt(2 ** k * f * Math.sqrt(Math.PI)); return k + .5 + .9 * N * hermite(k, x) * Math.exp(-x * x / 2); }, thin: true }))],
        info: (P, T) => `E_n = (n + \\tfrac12)\\hbar\\omega\n\\text{${T('rozestup hladin', 'level spacing')}}:\\ \\hbar\\omega`,
      }),
      check(mcq(D('Energie základního stavu oscilátoru je…', 'The ground-state energy of the oscillator is…'), ['$\\frac12\\hbar\\omega$', '$0$', '$\\hbar\\omega$', '$2\\hbar\\omega$'], 0, D('Nulové kmity – i v základním stavu.', 'Zero-point energy.'))),
    ]),
  ],
  quiz: [
    num(D('$[x, x^2] = ?$', '$[x, x^2] = ?$'), 0, D('Funkce téže proměnné komutují.', 'Functions of the same variable commute.')),
    mcq(D('$[L_x, L_y] = ?$', '$[L_x, L_y] = ?$'), ['$i\\hbar L_z$', '$0$', '$L_z$', '$-i\\hbar L_x$'], 0, D('Cyklicky.', 'Cyclic.')),
    mcq(D('Vlastní číslo $L^2$ pro $\\ell = 1$ je…', 'The eigenvalue of $L^2$ for $\\ell = 1$ is…'), ['$2\\hbar^2$', '$\\hbar^2$', '$\\hbar$', '$4\\hbar^2$'], 0, D('$\\ell(\\ell + 1) = 2$.', '$\\ell(\\ell + 1) = 2$.')),
    tf(D('Komutující operátory mohou mít společnou sadu vlastních funkcí.', 'Commuting operators can share a set of eigenfunctions.'), true, D('Proto lze měřit současně.', 'Hence simultaneous measurement.')),
    mcq(D('$a^\\dagger$ v harmonickém oscilátoru…', 'In the harmonic oscillator, $a^\\dagger$…'), [D('zvýší energii o $\\hbar\\omega$', 'raises the energy by $\\hbar\\omega$'), D('sníží energii', 'lowers the energy'), D('nic nezmění', 'changes nothing'), D('vynuluje stav', 'annihilates the state')], 0, D('Kreační operátor.', 'Creation operator.')),
    num(D('$[a, a^\\dagger] = ?$', '$[a, a^\\dagger] = ?$'), 1, D('Kanonický komutátor.', 'Canonical commutator.')),
    mcq(D('Operátor hybnosti v poloze je…', 'The momentum operator in position space is…'), ['$-i\\hbar\\,\\partial/\\partial x$', '$i\\hbar x$', '$\\hbar\\,\\partial/\\partial x$', '$x^2$'], 0, D('Standardní tvar.', 'Standard form.')),
  ],
  glossary: [
    term('komutátor', 'commutator', D('$[A, B] = AB - BA$.', '$[A, B] = AB - BA$.'), '[A, B]'),
    term('pozorovatelná', 'observable', D('Měřitelná veličina – hermitovský operátor.', 'A measurable quantity – a Hermitian operator.'), ''),
    term('relace neurčitosti', 'uncertainty relation', D('$\\Delta A\\,\\Delta B \\ge \\frac12|\\langle[A,B]\\rangle|$.', '$\\Delta A\\,\\Delta B \\ge \\frac12|\\langle[A,B]\\rangle|$.'), ''),
    term('moment hybnosti', 'angular momentum', D('Operátor $\\mathbf L = \\mathbf r\\times\\mathbf p$.', 'The operator $\\mathbf L = \\mathbf r\\times\\mathbf p$.'), ''),
    term('žebříkový operátor', 'ladder operator', D('Posune stav o jedno kvantum nahoru/dolů.', 'Shifts a state one step up or down.'), 'a,\\ a^\\dagger'),
    term('základní stav', 'ground state', D('Stav s nejnižší energií.', 'The lowest-energy state.'), '\\psi_0'),
    term('nulové kmity', 'zero-point energy', D('Energie $\\frac12\\hbar\\omega$ základního stavu.', 'The ground-state energy $\\frac12\\hbar\\omega$.'), ''),
  ],
};
