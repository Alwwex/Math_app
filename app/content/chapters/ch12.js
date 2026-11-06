import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

const square = (x, N) => { let s = 0; for (let k = 0; k < N; k++) { const n = 2 * k + 1; s += Math.sin(n * x) / n; } return 4 / Math.PI * s; };
const sq = x => { const m = ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); return m < Math.PI ? 1 : -1; };

export default {
  intro: D('Každý rozumný periodický signál je součet sinů a kosinů. Fourierovy řady jsou základ akustiky, zpracování signálu a řešení parciálních diferenciálních rovnic.',
    'Any reasonable periodic signal is a sum of sines and cosines. Fourier series underpin acoustics, signal processing and solving PDEs.'),
  steps: [
    step('12.1–12.2', D('Fourierovy koeficienty', 'The Fourier coefficients'), 'music', [
      lead('Periodickou funkci s periodou $L$ rozložíme na harmonické složky. Dirichletovy podmínky (konečně mnoho skoků a extrémů) zaručí, že to funguje.', 'A function of period $L$ splits into harmonics. The Dirichlet conditions (finitely many jumps and extrema) guarantee it works.'),
      math('f(x) = \\dfrac{a_0}{2} + \\sum_{r=1}^{\\infty}\\left[a_r\\cos\\dfrac{2\\pi rx}{L} + b_r\\sin\\dfrac{2\\pi rx}{L}\\right]'),
      math('a_r = \\dfrac2L\\int_{x_0}^{x_0+L} f(x)\\cos\\dfrac{2\\pi rx}{L}dx,\\qquad b_r = \\dfrac2L\\int_{x_0}^{x_0+L} f(x)\\sin\\dfrac{2\\pi rx}{L}dx'),
      p('Koeficienty vyjdou tak jednoduše díky **ortogonalitě**: integrál součinu dvou různých harmonických přes periodu je nula.', 'The coefficients come out so simply thanks to **orthogonality**: the integral of a product of two different harmonics over a period is zero.'),
      check(mcq(D('$\\int_{-\\pi}^{\\pi}\\sin 2x\\,\\sin 3x\\,dx = ?$', '$\\int_{-\\pi}^{\\pi}\\sin 2x\\,\\sin 3x\\,dx = ?$'), ['$0$', '$\\pi$', '$2\\pi$', '$1$'], 0, D('Různé harmonické jsou ortogonální.', 'Different harmonics are orthogonal.'))),
    ]),
    step('12.3–12.4', D('Symetrie, skoky a Gibbsův jev', 'Symmetry, jumps and the Gibbs phenomenon'), 'wave', [
      lead('**Lichá** funkce má jen siny, **sudá** jen kosiny – polovinu koeficientů nemusíš počítat.', 'An **odd** function has only sines, an **even** one only cosines – half the coefficients vanish for free.'),
      p('Obdélníkový signál $\\pm1$ je lichý: $f(x) = \\frac4\\pi\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\dots\\right)$. Přidávej členy:', 'The $\\pm1$ square wave is odd: $f(x) = \\frac4\\pi\\left(\\sin x + \\frac{\\sin 3x}{3} + \\frac{\\sin 5x}{5} + \\dots\\right)$. Add terms:'),
      widget('paramPlot', {
        view: [-7, 7, -1.6, 1.6], params: [{ k: 'N', label: 'N', min: 1, max: 40, value: 3, int: true, step: 1 }], play: 'N', interval: 450,
        curves: [{ f: x => sq(x), label: 'f(x)', color: 'var(--ink-3)', width: 2 }, { f: (x, P) => square(x, P.N), label: (P, T) => `\\text{${P.N} ${T('harmonických', 'harmonics')}}` }],
        info: (P, T) => `\\text{${T('překmit u skoku', 'overshoot at the jump')}} \\approx 9\\,\\%\n\\text{${T('nezmizí ani pro', 'never disappears, even for')}}\\ N\\to\\infty`,
      }),
      warn('**Gibbsův jev**: u skoku řada vždy překmitne o asi 9 % výšky skoku. Ve skoku samotném konverguje k průměru hodnot zleva a zprava.', '**Gibbs phenomenon**: at a jump the series always overshoots by about 9 % of the jump. At the jump itself it converges to the average of the left and right values.'),
      check(tf(D('Fourierova řada sudé funkce obsahuje jen kosiny (a konstantu).', 'The Fourier series of an even function has only cosines (and a constant).'), true, D('$b_r = 0$, protože $f(x)\\sin(\\dots)$ je lichá.', '$b_r = 0$ because $f(x)\\sin(\\dots)$ is odd.'))),
    ]),
    step('12.5–12.6', D('Neperiodické funkce, derivace a integrace', 'Non-periodic functions, differentiation and integration'), 'link', [
      lead('Funkci danou jen na intervalu můžeme periodicky prodloužit – sudě (kosinová řada) nebo liše (sinová řada). Tomu se říká **řada na polovičním intervalu**.', 'A function given only on an interval can be extended periodically – evenly (cosine series) or oddly (sine series). This is a **half-range series**.'),
      p('Řadu lze integrovat člen po členu vždy; derivovat jen opatrně, protože derivace zhorší konvergenci (koeficienty se násobí $r$).', 'A series may always be integrated term by term; differentiate with care, as it worsens convergence (coefficients get multiplied by $r$).'),
      tip('Pro řešení vedení tepla v tyči s nulovými konci se hodí sinová řada – splní okrajové podmínky automaticky.', 'For heat flow in a rod with zero ends a sine series is natural – it satisfies the boundary conditions automatically.'),
      check(mcq(D('Které prodloužení dá čistou sinovou řadu?', 'Which extension gives a pure sine series?'), [D('liché', 'odd'), D('sudé', 'even'), D('nulové', 'zero'), D('jakékoli', 'any')], 0, D('Lichá funkce = jen siny.', 'Odd function = sines only.'))),
    ]),
    step('12.7–12.8', D('Komplexní tvar a Parsevalova věta', 'Complex form and Parseval’s theorem'), 'sparkles', [
      math('f(x) = \\sum_{r=-\\infty}^{\\infty} c_r\\,e^{2\\pi irx/L},\\qquad c_r = \\dfrac1L\\int_{x_0}^{x_0+L} f(x)\\,e^{-2\\pi irx/L}dx'),
      def(D('Parsevalova věta', 'Parseval’s theorem'), 'Střední hodnota $|f|^2$ přes periodu je součet čtverců koeficientů: $$\\dfrac1L\\int |f|^2dx = \\sum_r |c_r|^2.$$ Energie signálu se rozdělí mezi harmonické.', 'The mean of $|f|^2$ over a period equals the sum of squared coefficients: $$\\dfrac1L\\int |f|^2dx = \\sum_r |c_r|^2.$$ Signal energy is shared among the harmonics.'),
      example(D('Basilejský problém', 'The Basel problem'), D('Pomocí řady pro $f(x) = x$ na $(-\\pi, \\pi)$ sečti $\\sum 1/n^2$.', 'Use the series of $f(x) = x$ on $(-\\pi, \\pi)$ to sum $\\sum 1/n^2$.'),
        [D('$x = 2\\sum (-1)^{n+1}\\frac{\\sin nx}{n}$, tedy $b_n = \\frac{2(-1)^{n+1}}{n}$.', '$x = 2\\sum (-1)^{n+1}\\frac{\\sin nx}{n}$, so $b_n = \\frac{2(-1)^{n+1}}{n}$.'),
         D('Parseval: $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}x^2dx = \\frac12\\sum b_n^2$, tj. $\\frac{\\pi^2}{3} = \\frac12\\sum\\frac{4}{n^2}$.', 'Parseval: $\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}x^2dx = \\frac12\\sum b_n^2$, i.e. $\\frac{\\pi^2}{3} = \\frac12\\sum\\frac{4}{n^2}$.')],
        '$\\sum_{n=1}^\\infty \\dfrac{1}{n^2} = \\dfrac{\\pi^2}{6}$'),
      check(mcq(D('Komplexní koeficienty reálné funkce splňují…', 'Complex coefficients of a real function satisfy…'), ['$c_{-r} = c_r^*$', '$c_{-r} = c_r$', '$c_r = 0$', '$c_{-r} = -c_r$'], 0, D('Aby se imaginární části vyrušily.', 'So that imaginary parts cancel.'))),
    ]),
  ],
  quiz: [
    mcq(D('Obdélníkový lichý signál obsahuje…', 'An odd square wave contains…'), [D('jen liché sinové harmonické', 'only odd sine harmonics'), D('všechny kosiny', 'all cosines'), D('jen konstantu', 'only a constant'), D('sudé siny', 'even sines')], 0, D('$\\sin x, \\sin 3x, \\sin 5x, \\dots$', '$\\sin x, \\sin 3x, \\sin 5x, \\dots$')),
    num(D('Kolik % zhruba činí Gibbsův překmit?', 'Roughly what % is the Gibbs overshoot?'), 9, D('Asi 9 % výšky skoku.', 'About 9 % of the jump.'), { tol: 1 }),
    tf(D('V místě skoku konverguje Fourierova řada k průměru hodnot zleva a zprava.', 'At a jump the Fourier series converges to the average of the left and right values.'), true, D('Dirichletova věta.', 'Dirichlet’s theorem.')),
    mcq(D('Koeficient $a_0/2$ je…', 'The coefficient $a_0/2$ is…'), [D('střední hodnota funkce', 'the mean value of the function'), D('maximum', 'the maximum'), D('perioda', 'the period'), D('amplituda první harmonické', 'the first harmonic amplitude')], 0, D('$\\frac{a_0}{2} = \\frac1L\\int f\\,dx$.', '$\\frac{a_0}{2} = \\frac1L\\int f\\,dx$.')),
    mcq(D('$\\sum_{n=1}^\\infty 1/n^2 = ?$', '$\\sum_{n=1}^\\infty 1/n^2 = ?$'), ['$\\pi^2/6$', '$\\pi/4$', '$1$', '$\\infty$'], 0, D('Basilejský problém, Euler.', 'The Basel problem, Euler.')),
    tf(D('Fourierovu řadu lze vždy bez obav derivovat člen po členu.', 'A Fourier series can always be differentiated term by term without care.'), false, D('Derivace zhoršuje konvergenci, může selhat.', 'Differentiation worsens convergence and can fail.')),
    mcq(D('Parsevalova věta vyjadřuje…', 'Parseval’s theorem expresses…'), [D('rozdělení energie mezi harmonické', 'how energy is shared among harmonics'), D('derivaci řady', 'the derivative of a series'), D('Gibbsův jev', 'the Gibbs phenomenon'), D('periodu', 'the period')], 0, D('$\\langle |f|^2\\rangle = \\sum |c_r|^2$.', '$\\langle |f|^2\\rangle = \\sum |c_r|^2$.')),
  ],
  glossary: [
    term('Fourierova řada', 'Fourier series', D('Rozklad periodické funkce na siny a kosiny.', 'Expansion of a periodic function in sines and cosines.'), ''),
    term('harmonická složka', 'harmonic', D('Člen s frekvencí rovnou násobku základní.', 'A term at a multiple of the fundamental frequency.'), ''),
    term('Dirichletovy podmínky', 'Dirichlet conditions', D('Podmínky, za nichž Fourierova řada konverguje.', 'Conditions guaranteeing convergence.'), ''),
    term('Gibbsův jev', 'Gibbs phenomenon', D('Překmit řady u skoku (~9 %).', 'Overshoot at a jump (~9 %).'), ''),
    term('ortogonalita', 'orthogonality', D('Integrál součinu různých funkcí je nula.', 'The integral of a product of different functions vanishes.'), ''),
    term('Parsevalova věta', 'Parseval’s theorem', D('Energie = součet čtverců koeficientů.', 'Energy = sum of squared coefficients.'), ''),
    term('řada na polovičním intervalu', 'half-range series', D('Sinová/kosinová řada pro funkci na $[0, L]$.', 'Sine/cosine series for a function on $[0, L]$.'), ''),
  ],
};
