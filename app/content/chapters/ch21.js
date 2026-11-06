import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Hlavní pracovní nástroj na PDR: separace proměnných. Řešení složíme z jednoduchých součinů, superpozicí splníme podmínky. Plus polární souřadnice, transformace a Greenovy funkce.',
    'The main workhorse for PDEs: separation of variables. Build solutions from simple products and match conditions by superposition. Plus polar coordinates, transforms and Green’s functions.'),
  steps: [
    step('21.1–21.2', D('Separace proměnných a superpozice', 'Separation of variables and superposition'), 'drum', [
      lead('Zkusíme $u(x, t) = X(x)\\,T(t)$. Po dosazení a vydělení $XT$ závisí jedna strana jen na $x$, druhá jen na $t$ – obě se tedy rovnají konstantě.', 'Try $u(x, t) = X(x)\\,T(t)$. After dividing by $XT$ one side depends only on $x$, the other only on $t$ – so both equal a constant.'),
      math('\\dfrac{X\'\'}{X} = \\dfrac{1}{c^2}\\dfrac{T\'\'}{T} = -k^2'),
      p('Pro strunu s pevnými konci ($X(0) = X(L) = 0$) dostaneme módy $\\sin\\frac{n\\pi x}{L}\\cos\\frac{n\\pi ct}{L}$. Obecný kmit je jejich součet – a koeficienty dá Fourierova řada počátečního tvaru.', 'For a string with fixed ends ($X(0) = X(L) = 0$) we get modes $\\sin\\frac{n\\pi x}{L}\\cos\\frac{n\\pi ct}{L}$. A general vibration is their sum, with coefficients from the Fourier series of the initial shape.'),
      widget('paramPlot', {
        view: [0, 1, -1.2, 1.2], xlabel: 'x', ylabel: 'u', params: [{ k: 'n', label: 'n', min: 1, max: 6, value: 2, int: true, step: 1 }, { k: 't', min: 0, max: 2, value: 0, step: .005 }], play: 't', duration: 4,
        curves: [{ f: (x, P) => Math.sin(P.n * Math.PI * x) * Math.cos(P.n * Math.PI * P.t), label: P => `u_${P.n}(x, t)` }, { f: (x, P) => Math.sin(P.n * Math.PI * x), color: 'var(--ink-3)', dash: true, thin: true }, { f: (x, P) => -Math.sin(P.n * Math.PI * x), color: 'var(--ink-3)', dash: true, thin: true }],
        points: P => Array.from({ length: P.n + 1 }, (_, k) => ({ x: k / P.n, y: 0, color: 'var(--red)', r: 5 })),
        info: (P, T) => `\\omega_n = \\dfrac{n\\pi c}{L}\n\\text{${T('uzlů (červeně)', 'nodes (red)')}}: ${P.n + 1}`,
      }),
      check(mcq(D('Frekvence $n$-tého módu struny je…', 'The frequency of the $n$th string mode is…'), [D('$n$-násobek základní', '$n$ times the fundamental'), D('$n^2$-násobek', '$n^2$ times'), D('stejná pro všechny', 'the same for all'), D('$\\sqrt n$-násobek', '$\\sqrt n$ times')], 0, D('Harmonická řada tónů – proto struny znějí libozvučně.', 'Harmonic overtones – why strings sound pleasant.'))),
    ]),
    step('21.3', D('Separace v polárních souřadnicích', 'Separation in polar coordinates'), 'galaxy', [
      lead('V kulových souřadnicích dá Laplaceova rovnice řešení $r^\\ell P_\\ell(\\cos\\theta)$ a $r^{-(\\ell+1)}P_\\ell(\\cos\\theta)$; ve válcových se objeví Besselovy funkce.', 'In spherical coordinates Laplace’s equation gives $r^\\ell P_\\ell(\\cos\\theta)$ and $r^{-(\\ell+1)}P_\\ell(\\cos\\theta)$; in cylindrical ones Bessel functions appear.'),
      phys('Vodivá koule ve vnějším homogenním poli: potenciál je $-E_0\\left(r - \\frac{a^3}{r^2}\\right)\\cos\\theta$ – stačí jediný člen $\\ell = 1$.', 'A conducting sphere in a uniform field: the potential is $-E_0\\left(r - \\frac{a^3}{r^2}\\right)\\cos\\theta$ – just the $\\ell = 1$ term.'),
      widget('paramPlot', {
        view: [0, 16, -.45, 1.05], xlabel: 'r', params: [{ k: 'm', label: 'm', min: 1, max: 4, value: 1, int: true, step: 1 }],
        curves: [{ f: (x, P) => { const zeros = [2.405, 5.520, 8.654, 11.792]; const k = zeros[P.m - 1] / 12; let s = 0; const N = 120; for (let j = 0; j < N; j++) { const tt = Math.PI * (j + .5) / N; s += Math.cos(-k * x * Math.sin(tt)); } return x <= 12 ? s / N : NaN; }, label: (P, T) => `J_0(k_{0${P.m}}r)\\ \\text{${T('na bubnu poloměru 12', 'on a drum of radius 12')}}` }],
        info: (P, T) => `\\text{${T('mód s', 'mode with')}}\\ ${P.m - 1}\\ \\text{${T('uzlovými kružnicemi', 'nodal circles')}}`,
      }),
      check(tf(D('Úhlové řešení Laplaceovy rovnice v kulových souřadnicích tvoří Legendreovy polynomy (kulové funkce).', 'The angular solutions of Laplace’s equation in spherical polars are Legendre polynomials (spherical harmonics).'), true, D('Viz kapitola 18.', 'See chapter 18.'))),
    ]),
    step('21.4', D('Metody integrálních transformací', 'Integral transform methods'), 'antenna', [
      lead('Na nekonečném intervalu nahradíme Fourierovu řadu Fourierovou transformací. Derivace v $x$ se změní na násobení $ik$ a PDR na ODR v čase.', 'On an infinite domain, replace the Fourier series by the Fourier transform. $x$-derivatives become multiplication by $ik$ and the PDE becomes an ODE in time.'),
      example(D('Teplo na nekonečné tyči', 'Heat on an infinite rod'), D('Řeš $u_t = \\kappa u_{xx}$ s $u(x, 0) = \\delta(x)$.', 'Solve $u_t = \\kappa u_{xx}$ with $u(x, 0) = \\delta(x)$.'),
        [D('Transformace v $x$: $\\tilde u_t = -\\kappa k^2\\tilde u$.', 'Transform in $x$: $\\tilde u_t = -\\kappa k^2\\tilde u$.'), D('$\\tilde u = \\tilde u(k, 0)e^{-\\kappa k^2 t}$ – gaussovka v $k$.', '$\\tilde u = \\tilde u(k, 0)e^{-\\kappa k^2 t}$ – a Gaussian in $k$.'), D('Zpětná transformace dá gaussovku v $x$.', 'Inverting gives a Gaussian in $x$.')], '$u = \\dfrac{1}{\\sqrt{4\\pi\\kappa t}}e^{-x^2/4\\kappa t}$'),
      check(mcq(D('Fourierova transformace v $x$ převede $u_{xx}$ na…', 'A Fourier transform in $x$ turns $u_{xx}$ into…'), ['$-k^2\\tilde u$', '$ik\\tilde u$', '$k^2\\tilde u$', '$\\tilde u/k$'], 0, D('$(ik)^2 = -k^2$.', '$(ik)^2 = -k^2$.'))),
    ]),
    step('21.5', D('Greenovy funkce a metoda zrcadlení', 'Green’s functions and the method of images'), 'target', [
      lead('Řešení Poissonovy rovnice $\\nabla^2 u = \\rho$ je superpozice odezev na bodové zdroje: $u = \\int G(\\mathbf r, \\mathbf r_0)\\rho(\\mathbf r_0)\\,dV_0$.', 'The solution of Poisson’s equation $\\nabla^2 u = \\rho$ is a superposition of point-source responses: $u = \\int G(\\mathbf r, \\mathbf r_0)\\rho(\\mathbf r_0)\\,dV_0$.'),
      math('G(\\mathbf r, \\mathbf r_0) = -\\dfrac{1}{4\\pi|\\mathbf r - \\mathbf r_0|}'),
      p('**Metoda zrcadlení**: okrajovou podmínku na rovině splníme fiktivním „zrcadlovým" nábojem za rovinou. Náboj nad uzemněnou deskou se chová, jako by pod ní byl opačný náboj.', '**Method of images**: satisfy a boundary condition on a plane with a fictitious mirror charge behind it. A charge above a grounded plate behaves as if there were an opposite charge below.'),
      check(tf(D('Zrcadlový náboj u uzemněné roviny má opačné znaménko.', 'The image charge for a grounded plane has the opposite sign.'), true, D('Aby byl potenciál na rovině nulový.', 'So the potential vanishes on the plane.'))),
    ]),
  ],
  quiz: [
    mcq(D('Separační ansatz pro $u(x, t)$ je…', 'The separation ansatz for $u(x, t)$ is…'), ['$X(x)T(t)$', '$X(x) + T(t)$', '$f(x - t)$', '$e^{x + t}$'], 0, D('Součin funkcí jedné proměnné.', 'A product of single-variable functions.')),
    mcq(D('Mód struny s $n = 3$ má uvnitř kolik uzlů (bez konců)?', 'How many interior nodes does the $n = 3$ string mode have?'), ['2', '3', '1', '4'], 0, D('$\\sin 3\\pi x$ je nula v $1/3$ a $2/3$.', '$\\sin 3\\pi x$ vanishes at $1/3$ and $2/3$.')),
    tf(D('Superpozicí módů lze splnit libovolný rozumný počáteční tvar struny.', 'Superposing modes can match any reasonable initial string shape.'), true, D('Fourierova řada.', 'Fourier series.')),
    mcq(D('Ve válcových souřadnicích vedou radiální rovnice na…', 'In cylindrical coordinates the radial equation leads to…'), [D('Besselovy funkce', 'Bessel functions'), D('Hermitovy polynomy', 'Hermite polynomials'), D('Legendreovy polynomy', 'Legendre polynomials'), D('exponenciály', 'exponentials')], 0, D('Kruhová symetrie.', 'Circular symmetry.')),
    mcq(D('Greenova funkce 3D Laplaceova operátoru je úměrná…', 'The 3D Laplacian Green’s function is proportional to…'), ['$1/|\\mathbf r - \\mathbf r_0|$', '$|\\mathbf r - \\mathbf r_0|$', '$\\ln|\\mathbf r - \\mathbf r_0|$', '$e^{-r}$'], 0, D('Coulombův potenciál.', 'Coulomb potential.')),
    tf(D('Separační konstanta může záviset na $x$.', 'The separation constant may depend on $x$.'), false, D('Je to konstanta – nezávisí na žádné proměnné.', 'It is a constant – independent of all variables.')),
  ],
  glossary: [
    term('separace proměnných', 'separation of variables', D('Řešení ve tvaru součinu funkcí jedné proměnné.', 'Solutions as products of single-variable functions.'), 'u = XT'),
    term('separační konstanta', 'separation constant', D('Konstanta, na kterou se obě strany rovnají.', 'The constant both sides must equal.'), ''),
    term('superpozice', 'superposition', D('Součet řešení lineární rovnice je opět řešení.', 'Sums of solutions of a linear equation are solutions.'), ''),
    term('mód', 'mode', D('Jednotlivé separované řešení.', 'A single separated solution.'), ''),
    term('uzel', 'node', D('Bod, který se při kmitání nehýbe.', 'A point that does not move.'), ''),
    term('metoda zrcadlení', 'method of images', D('Okrajové podmínky splněné fiktivními zdroji.', 'Boundary conditions met by fictitious sources.'), ''),
    term('Poissonova rovnice', 'Poisson’s equation', D('$\\nabla^2 u = \\rho$.', '$\\nabla^2 u = \\rho$.'), ''),
  ],
};
