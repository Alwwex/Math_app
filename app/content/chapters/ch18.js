import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

const legendre = (l, x) => { let p0 = 1, p1 = x; if (l === 0) return 1; for (let n = 1; n < l; n++) { const p2 = ((2 * n + 1) * x * p1 - n * p0) / (n + 1); p0 = p1; p1 = p2; } return p1; };
const besselJ = (n, x) => { let s = 0; const N = 200; for (let k = 0; k < N; k++) { const t = Math.PI * (k + .5) / N; s += Math.cos(n * t - x * Math.sin(t)); } return s / N; };
const hermite = (n, x) => { let h0 = 1, h1 = 2 * x; if (n === 0) return 1; for (let k = 1; k < n; k++) { const h2 = 2 * x * h1 - 2 * k * h0; h0 = h1; h1 = h2; } return h1; };

export default {
  intro: D('Galerie funkcí, které vycházejí z fyzikálních rovnic: Legendreovy (gravitace a elektrostatika), Besselovy (válce a bubny), Hermitovy (kvantový oscilátor), Laguerrovy (atom vodíku) a funkce gama.',
    'A gallery of functions born from physics: Legendre (gravity, electrostatics), Bessel (cylinders, drums), Hermite (quantum oscillator), Laguerre (hydrogen atom) and the gamma function.'),
  steps: [
    step('18.1–18.3', D('Legendreovy polynomy a kulové funkce', 'Legendre polynomials and spherical harmonics'), 'gem', [
      lead('$P_0 = 1$, $P_1 = x$, $P_2 = \\frac12(3x^2 - 1)$, … Vznikají při řešení Laplaceovy rovnice v kulových souřadnicích.', '$P_0 = 1$, $P_1 = x$, $P_2 = \\frac12(3x^2 - 1)$, … They arise when solving Laplace’s equation in spherical coordinates.'),
      math('P_\\ell(x) = \\dfrac{1}{2^\\ell\\,\\ell!}\\dfrac{d^\\ell}{dx^\\ell}(x^2 - 1)^\\ell,\\qquad \\int_{-1}^{1} P_\\ell P_m\\,dx = \\dfrac{2}{2\\ell + 1}\\delta_{\\ell m}'),
      widget('paramPlot', {
        view: [-1.05, 1.05, -1.2, 1.2], params: [{ k: 'l', label: '\\ell', min: 0, max: 10, value: 3, int: true, step: 1 }], play: 'l', interval: 800,
        curves: [{ f: (x, P) => (Math.abs(x) <= 1 ? legendre(P.l, x) : NaN), label: P => `P_{${P.l}}(x)` }],
        info: (P, T) => `P_{${P.l}}(1) = 1\n\\text{${T('počet nulových bodů', 'number of zeros')}} = ${P.l}`,
      }),
      p('**Vytvořující funkce** $\\dfrac{1}{\\sqrt{1 - 2xh + h^2}} = \\sum_\\ell P_\\ell(x)h^\\ell$ je potenciál bodového náboje rozvinutý do multipólů.', 'The **generating function** $\\dfrac{1}{\\sqrt{1 - 2xh + h^2}} = \\sum_\\ell P_\\ell(x)h^\\ell$ is the potential of a point charge expanded in multipoles.'),
      phys('**Kulové funkce** $Y_\\ell^m(\\theta, \\phi)$ popisují tvary atomových orbitalů s, p, d, f.', '**Spherical harmonics** $Y_\\ell^m(\\theta, \\phi)$ give the shapes of s, p, d, f atomic orbitals.'),
      check(num(D('$P_2(1) = ?$', '$P_2(1) = ?$'), 1, D('Všechny $P_\\ell(1) = 1$.', 'All $P_\\ell(1) = 1$.'))),
    ]),
    step('18.4', D('Čebyševovy polynomy', 'Chebyshev polynomials'), 'chart', [
      lead('$T_n(\\cos\\theta) = \\cos n\\theta$. Na intervalu $[-1, 1]$ kmitají mezi $-1$ a $1$ se stejnými výkyvy.', '$T_n(\\cos\\theta) = \\cos n\\theta$. On $[-1, 1]$ they oscillate between $-1$ and $1$ with equal ripples.'),
      tip('Díky tomu jsou nejlepší pro aproximaci funkcí polynomy – chyba je rovnoměrně rozložená. Používají se v numerice a návrhu filtrů.', 'This makes them optimal for polynomial approximation – the error is spread evenly. Used in numerics and filter design.'),
      check(mcq(D('$T_2(x) = ?$', '$T_2(x) = ?$'), ['$2x^2 - 1$', '$x^2$', '$\\frac12(3x^2 - 1)$', '$4x^3 - 3x$'], 0, D('$\\cos 2\\theta = 2\\cos^2\\theta - 1$.', '$\\cos 2\\theta = 2\\cos^2\\theta - 1$.'))),
    ]),
    step('18.5–18.6', D('Besselovy funkce', 'Bessel functions'), 'drum', [
      lead('Řešení Besselovy rovnice $J_\\nu(x)$ vypadají jako tlumené kosiny. Jejich nulové body určují tóny bubnu.', 'Solutions $J_\\nu(x)$ of Bessel’s equation look like damped cosines. Their zeros set the tones of a drum.'),
      widget('paramPlot', {
        view: [0, 20, -.5, 1.05], params: [{ k: 'n', label: 'n', min: 0, max: 5, value: 0, int: true, step: 1 }],
        curves: [{ f: (x, P) => besselJ(P.n, x), label: P => `J_{${P.n}}(x)` }, { f: (x, P) => (x > .5 ? Math.sqrt(2 / (Math.PI * x)) * Math.cos(x - P.n * Math.PI / 2 - Math.PI / 4) : NaN), label: (P, T) => `\\text{${T('asymptotika', 'asymptotic')}}`, color: 'var(--ink-3)', dash: true, thin: true }],
        info: (P, T) => `J_n(x) \\approx \\sqrt{\\dfrac{2}{\\pi x}}\\cos\\left(x - \\dfrac{n\\pi}{2} - \\dfrac{\\pi}{4}\\right)\n\\text{${T('první nula', 'first zero')}}\\ J_0:\\ x \\approx 2{,}405`,
      }),
      phys('Základní tón kruhové membrány poloměru $a$ má frekvenci úměrnou $2{,}405/a$ – prvnímu kořeni $J_0$.', 'The fundamental of a circular membrane of radius $a$ is proportional to $2.405/a$ – the first zero of $J_0$.'),
      check(num(D('$J_0(0) = ?$', '$J_0(0) = ?$'), 1, D('$J_0$ začíná v jedničce, ostatní v nule.', '$J_0$ starts at 1, the others at 0.'))),
    ]),
    step('18.7–18.9', D('Laguerrovy a Hermitovy funkce', 'Laguerre and Hermite functions'), 'atom', [
      lead('Hermitovy polynomy $H_n$ dávají vlnové funkce kvantového harmonického oscilátoru $\\psi_n \\propto H_n(x)e^{-x^2/2}$; Laguerrovy polynomy radiální část atomu vodíku.', 'Hermite polynomials $H_n$ give the quantum oscillator wavefunctions $\\psi_n \\propto H_n(x)e^{-x^2/2}$; Laguerre polynomials the radial part of hydrogen.'),
      widget('paramPlot', {
        view: [-5, 5, -1.1, 1.1], params: [{ k: 'n', label: 'n', min: 0, max: 8, value: 2, int: true, step: 1 }], play: 'n', interval: 900,
        curves: [{ f: (x, P) => { let f = 1; for (let k = 2; k <= P.n; k++) f *= k; const N = 1 / Math.sqrt(2 ** P.n * f * Math.sqrt(Math.PI)); return 1.6 * N * hermite(P.n, x) * Math.exp(-x * x / 2); }, label: P => `\\psi_{${P.n}}(x)` }, { f: x => x * x / 10 - .95, color: 'var(--ink-3)', thin: true, dash: true }],
        info: (P) => `E_{${P.n}} = \\left(${P.n} + \\tfrac12\\right)\\hbar\\omega`,
      }),
      check(mcq(D('$H_1(x) = ?$', '$H_1(x) = ?$'), ['$2x$', '$x$', '$4x^2 - 2$', '$1$'], 0, D('Rekurence $H_{n+1} = 2xH_n - 2nH_{n-1}$.', 'Recurrence $H_{n+1} = 2xH_n - 2nH_{n-1}$.'))),
    ]),
    step('18.10–18.12', D('Funkce gama a hypergeometrické funkce', 'Gamma and hypergeometric functions'), 'sparkles', [
      math('\\Gamma(z) = \\int_0^\\infty t^{z-1}e^{-t}dt,\\qquad \\Gamma(n + 1) = n!,\\qquad \\Gamma\\left(\\tfrac12\\right) = \\sqrt\\pi'),
      p('Funkce gama rozšiřuje faktoriál na necelá čísla. Příbuzné jsou funkce beta $B(m, n) = \\frac{\\Gamma(m)\\Gamma(n)}{\\Gamma(m+n)}$ a chybová funkce $\\mathrm{erf}(x)$ z normálního rozdělení.', 'The gamma function extends the factorial to non-integers. Relatives: the beta function $B(m, n) = \\frac{\\Gamma(m)\\Gamma(n)}{\\Gamma(m+n)}$ and the error function $\\mathrm{erf}(x)$ of the normal distribution.'),
      tip('Hypergeometrická funkce $F(a, b; c; z)$ je „mateřská" funkce – Legendreovy, Čebyševovy i další jsou jejími speciálními případy.', 'The hypergeometric function $F(a, b; c; z)$ is a “parent” – Legendre, Chebyshev and others are special cases.'),
      check(num(D('$\\Gamma(5) = ?$', '$\\Gamma(5) = ?$'), 24, D('$\\Gamma(5) = 4! = 24$.', '$\\Gamma(5) = 4! = 24$.'))),
    ]),
  ],
  quiz: [
    mcq(D('$P_1(x) = ?$', '$P_1(x) = ?$'), ['$x$', '$1$', '$x^2$', '$\\frac12(3x^2 - 1)$'], 0, D('První Legendreův polynom.', 'The first Legendre polynomial.')),
    num(D('$\\int_{-1}^{1} P_2(x)^2dx \\cdot 5 = ?$', '$5\\int_{-1}^{1} P_2(x)^2dx = ?$'), 2, D('$\\frac{2}{2\\ell + 1} = \\frac25$.', '$\\frac{2}{2\\ell + 1} = \\frac25$.')),
    mcq(D('Kvantový harmonický oscilátor používá…', 'The quantum harmonic oscillator uses…'), [D('Hermitovy polynomy', 'Hermite polynomials'), D('Besselovy funkce', 'Bessel functions'), D('Čebyševovy polynomy', 'Chebyshev polynomials'), D('funkce beta', 'beta functions')], 0, D('$\\psi_n \\propto H_n e^{-x^2/2}$.', '$\\psi_n \\propto H_n e^{-x^2/2}$.')),
    num(D('$\\Gamma(1/2)^2$ děleno $\\pi$?', '$\\Gamma(1/2)^2$ divided by $\\pi$?'), 1, D('$\\Gamma(1/2) = \\sqrt\\pi$.', '$\\Gamma(1/2) = \\sqrt\\pi$.')),
    mcq(D('Tóny kruhového bubnu určují…', 'The tones of a circular drum are set by…'), [D('nulové body Besselových funkcí', 'zeros of Bessel functions'), D('Legendreovy polynomy', 'Legendre polynomials'), D('funkce gama', 'the gamma function'), D('prvočísla', 'prime numbers')], 0, D('Okraj bubnu je pevný → $J_n(ka) = 0$.', 'The rim is fixed → $J_n(ka) = 0$.')),
    tf(D('$T_n(\\cos\\theta) = \\cos n\\theta$.', '$T_n(\\cos\\theta) = \\cos n\\theta$.'), true, D('Definice Čebyševových polynomů.', 'Definition of Chebyshev polynomials.')),
    mcq(D('Energie kvantového oscilátoru jsou…', 'Energies of the quantum oscillator are…'), ['$(n + \\frac12)\\hbar\\omega$', '$n\\hbar\\omega$', '$n^2\\hbar\\omega$', '$\\hbar\\omega/n$'], 0, D('I v základním stavu je energie $\\frac12\\hbar\\omega$.', 'Even the ground state has $\\frac12\\hbar\\omega$.')),
  ],
  glossary: [
    term('Legendreovy polynomy', 'Legendre polynomials', D('Řešení Legendreovy rovnice, ortogonální na $[-1, 1]$.', 'Solutions of Legendre’s equation, orthogonal on $[-1, 1]$.'), 'P_\\ell(x)'),
    term('kulové funkce', 'spherical harmonics', D('Úhlová řešení Laplaceovy rovnice.', 'Angular solutions of Laplace’s equation.'), 'Y_\\ell^m'),
    term('Besselovy funkce', 'Bessel functions', D('Řešení Besselovy rovnice; válcová symetrie.', 'Solutions of Bessel’s equation; cylindrical symmetry.'), 'J_\\nu(x)'),
    term('Hermitovy polynomy', 'Hermite polynomials', D('Vlnové funkce kvantového oscilátoru.', 'Quantum oscillator wavefunctions.'), 'H_n(x)'),
    term('Laguerrovy polynomy', 'Laguerre polynomials', D('Radiální část atomu vodíku.', 'Radial part of the hydrogen atom.'), 'L_n(x)'),
    term('funkce gama', 'gamma function', D('Zobecnění faktoriálu.', 'Generalised factorial.'), '\\Gamma(z)'),
    term('vytvořující funkce', 'generating function', D('Funkce, jejíž rozvoj dává celou rodinu polynomů.', 'A function whose expansion yields a whole family.'), ''),
    term('Rodriguesův vzorec', 'Rodrigues’ formula', D('Vyjádření polynomu pomocí $n$-té derivace.', 'A polynomial written via an $n$th derivative.'), ''),
  ],
};
