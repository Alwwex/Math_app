import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

const fact = n => { let f = 1; for (let k = 2; k <= n; k++) f *= k; return f; };

export default {
  intro: D('Pravděpodobnost od Vennových diagramů po centrální limitní větu: podmíněná pravděpodobnost, Bayes, kombinatorika, náhodné veličiny, důležitá rozdělení a sdružená rozdělení.',
    'Probability from Venn diagrams to the central limit theorem: conditional probability, Bayes, combinatorics, random variables, key distributions and joint distributions.'),
  steps: [
    step('30.1–30.2', D('Pravděpodobnost a Bayesova věta', 'Probability and Bayes’ theorem'), 'die', [
      lead('Pravděpodobnosti jevů se sčítají podle Vennových diagramů: $\\Pr(A\\cup B) = \\Pr(A) + \\Pr(B) - \\Pr(A\\cap B)$.', 'Probabilities follow Venn diagrams: $\\Pr(A\\cup B) = \\Pr(A) + \\Pr(B) - \\Pr(A\\cap B)$.'),
      math('\\Pr(A\\,|\\,B) = \\dfrac{\\Pr(A\\cap B)}{\\Pr(B)},\\qquad \\Pr(A\\,|\\,B) = \\dfrac{\\Pr(B\\,|\\,A)\\,\\Pr(A)}{\\Pr(B)}'),
      example(D('Falešně pozitivní test', 'A false positive'), D('Nemoc má 1 % lidí. Test je pozitivní u 99 % nemocných a u 5 % zdravých. Jaká je pravděpodobnost nemoci při pozitivním testu?', '1 % of people have a disease. The test is positive for 99 % of the sick and 5 % of the healthy. What is the chance of disease given a positive test?'),
        [D('$\\Pr(+) = 0{,}99\\cdot0{,}01 + 0{,}05\\cdot0{,}99 = 0{,}0594$.', '$\\Pr(+) = 0.99\\cdot0.01 + 0.05\\cdot0.99 = 0.0594$.'), D('$\\Pr(N|+) = \\frac{0{,}0099}{0{,}0594} \\approx 0{,}17$.', '$\\Pr(D|+) = \\frac{0.0099}{0.0594} \\approx 0.17$.')],
        D('jen asi 17 % – většina pozitivních je zdravá', 'only about 17 % – most positives are healthy')),
      check(num(D('Pravděpodobnost, že na dvou kostkách padne součet 7?', 'Probability of rolling a sum of 7 with two dice?'), 1 / 6, D('6 příznivých z 36.', '6 favourable out of 36.'), { tol: .005 })),
    ]),
    step('30.3', D('Permutace a kombinace', 'Permutations and combinations'), 'cards', [
      math('{}^nP_k = \\dfrac{n!}{(n-k)!},\\qquad {}^nC_k = \\binom nk = \\dfrac{n!}{k!(n-k)!}'),
      p('Permutace: záleží na pořadí. Kombinace: nezáleží. Pozor na **narozeninový paradox** – ve skupině 23 lidí je šance na shodné narozeniny přes 50 %.', 'Permutations: order matters. Combinations: it does not. Beware the **birthday paradox** – in a group of 23 the chance of a shared birthday exceeds 50 %.'),
      check(num(D('Kolika způsoby vybereš 3 lidi z 10 (nezáleží na pořadí)?', 'How many ways to choose 3 people from 10 (order irrelevant)?'), 120, D('$\\binom{10}{3} = 120$.', '$\\binom{10}{3} = 120$.'))),
    ]),
    step('30.4–30.7', D('Náhodné veličiny, střední hodnota a rozptyl', 'Random variables, mean and variance'), 'chart', [
      lead('Náhodná veličina má rozdělení: diskrétní $\\Pr(X = x_i)$, nebo spojité s hustotou $f(x)$.', 'A random variable has a distribution: discrete $\\Pr(X = x_i)$, or continuous with density $f(x)$.'),
      math('\\mu = E[X] = \\int x f(x)\\,dx,\\qquad \\sigma^2 = V[X] = E[(X - \\mu)^2] = E[X^2] - \\mu^2'),
      p('**Vytvořující funkce** $G(t) = E[t^X]$ (pro diskrétní) a $M(t) = E[e^{tX}]$ zabalí celé rozdělení do jedné funkce; momenty dostaneme derivováním.', '**Generating functions** $G(t) = E[t^X]$ (discrete) and $M(t) = E[e^{tX}]$ pack a whole distribution into one function; moments come from differentiation.'),
      check(num(D('Rozptyl hodu spravedlivou kostkou (zaokrouhli na 2 desetinná místa)?', 'Variance of a fair die roll (2 decimals)?'), 2.92, D('$E[X^2] = 91/6$, $\\mu = 3{,}5$ → $91/6 - 12{,}25 = 35/12$.', '$E[X^2] = 91/6$, $\\mu = 3.5$ → $91/6 - 12.25 = 35/12$.'), { tol: .01 })),
    ]),
    step('30.8–30.9', D('Důležitá rozdělení', 'Important distributions'), 'barchart', [
      list(D('**binomické** $\\binom nk p^k(1-p)^{n-k}$: počet úspěchů z $n$ pokusů, $\\mu = np$,', '**binomial** $\\binom nk p^k(1-p)^{n-k}$: successes in $n$ trials, $\\mu = np$,'),
        D('**Poissonovo** $e^{-\\lambda}\\lambda^k/k!$: vzácné jevy (rozpady, fotony), $\\mu = \\sigma^2 = \\lambda$,', '**Poisson** $e^{-\\lambda}\\lambda^k/k!$: rare events (decays, photons), $\\mu = \\sigma^2 = \\lambda$,'),
        D('**normální (Gaussovo)** $\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/2\\sigma^2}$,', '**normal (Gaussian)** $\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/2\\sigma^2}$,'),
        D('**exponenciální** $\\lambda e^{-\\lambda x}$: doba čekání na další jev.', '**exponential** $\\lambda e^{-\\lambda x}$: waiting time to the next event.')),
      widget('paramPlot', {
        view: [-.5, 20.5, 0, .42], xlabel: 'k', ylabel: 'P', step: 2, ystep: .1, params: [{ k: 'l', label: '\\lambda', min: .5, max: 12, value: 3, step: .1 }],
        curves: [{ f: (x, P) => { const k = Math.round(x); return Math.abs(x - k) < .32 && k >= 0 ? Math.exp(-P.l) * P.l ** k / fact(k) : NaN; }, label: '\\text{Poisson}', width: 7 }, { f: (x, P) => Math.exp(-((x - P.l) ** 2) / (2 * P.l)) / Math.sqrt(2 * Math.PI * P.l), label: '\\text{Gauss}\\ (\\mu = \\sigma^2 = \\lambda)', color: 'var(--orange)', dash: true, thin: true }],
        info: (P, T) => `\\mu = \\sigma^2 = \\lambda = ${P.l.toFixed(1)}\n\\text{${T('pro velké λ se blíží Gaussovi', 'approaches a Gaussian for large λ')}}`,
      }),
      check(mcq(D('Pro Poissonovo rozdělení platí…', 'For the Poisson distribution…'), ['$\\mu = \\sigma^2$', '$\\mu = \\sigma$', '$\\sigma = 1$', '$\\mu = 0$'], 0, D('Obojí je $\\lambda$.', 'Both equal $\\lambda$.'))),
    ]),
    step('30.10–30.15', D('Centrální limitní věta a sdružená rozdělení', 'The central limit theorem and joint distributions'), 'target', [
      lead('Součet mnoha nezávislých náhodných veličin má přibližně **normální rozdělení** – skoro bez ohledu na to, jaké rozdělení měly jednotlivé sčítance. Proto je Gaussova křivka všude.', 'The sum of many independent random variables is approximately **normal** – almost regardless of their individual distributions. That is why the Gaussian is everywhere.'),
      widget('galton'),
      p('U dvou veličin popisuje vztah **kovariance** $\\mathrm{Cov}[X, Y] = E[XY] - E[X]E[Y]$ a **korelace** $\\rho = \\mathrm{Cov}/(\\sigma_X\\sigma_Y) \\in [-1, 1]$.', 'For two variables the relationship is measured by the **covariance** $\\mathrm{Cov}[X, Y] = E[XY] - E[X]E[Y]$ and the **correlation** $\\rho = \\mathrm{Cov}/(\\sigma_X\\sigma_Y) \\in [-1, 1]$.'),
      warn('Nulová korelace neznamená nezávislost (např. $Y = X^2$ pro symetrické $X$).', 'Zero correlation does not imply independence (e.g. $Y = X^2$ for symmetric $X$).'),
      check(tf(D('Rozptyl součtu nezávislých veličin je součet rozptylů.', 'The variance of a sum of independent variables is the sum of variances.'), true, D('Kovariance je nulová.', 'The covariance vanishes.'))),
    ]),
  ],
  quiz: [
    num(D('$\\Pr(A\\cup B)$, když $\\Pr(A) = 0{,}5$, $\\Pr(B) = 0{,}4$, $\\Pr(A\\cap B) = 0{,}2$?', '$\\Pr(A\\cup B)$ if $\\Pr(A) = 0.5$, $\\Pr(B) = 0.4$, $\\Pr(A\\cap B) = 0.2$?'), .7, D('$0{,}5 + 0{,}4 - 0{,}2$.', '$0.5 + 0.4 - 0.2$.'), { tol: .001 }),
    num(D('Kolika způsoby lze seřadit 5 knih?', 'How many ways to order 5 books?'), 120, D('$5! = 120$.', '$5! = 120$.')),
    mcq(D('Střední hodnota binomického rozdělení je…', 'The mean of the binomial distribution is…'), ['$np$', '$np(1-p)$', '$p$', '$n$'], 0, D('$n$ pokusů × pravděpodobnost $p$.', '$n$ trials × probability $p$.')),
    mcq(D('Doba čekání na radioaktivní rozpad má rozdělení…', 'The waiting time for a radioactive decay is…'), [D('exponenciální', 'exponential'), D('normální', 'normal'), D('rovnoměrné', 'uniform'), D('binomické', 'binomial')], 0, D('Bez paměti.', 'Memoryless.')),
    tf(D('Nulová korelace vždy znamená nezávislost.', 'Zero correlation always implies independence.'), false, D('Protipříklad $Y = X^2$.', 'Counterexample $Y = X^2$.')),
    mcq(D('Centrální limitní věta říká, že součet mnoha nezávislých veličin…', 'The central limit theorem says a sum of many independent variables…'), [D('má přibližně normální rozdělení', 'is approximately normal'), D('je konstantní', 'is constant'), D('má Poissonovo rozdělení', 'is Poisson'), D('diverguje', 'diverges')], 0, D('Gaussova křivka.', 'The bell curve.')),
    num(D('$V[X] = E[X^2] - \\mu^2$. Pro $E[X^2] = 10$, $\\mu = 3$?', '$V[X] = E[X^2] - \\mu^2$. For $E[X^2] = 10$, $\\mu = 3$?'), 1, D('$10 - 9$.', '$10 - 9$.')),
  ],
  glossary: [
    term('pravděpodobnost', 'probability', D('Míra možnosti jevu mezi 0 a 1.', 'A measure between 0 and 1 of how likely an event is.'), '\\Pr(A)'),
    term('podmíněná pravděpodobnost', 'conditional probability', D('$\\Pr(A|B) = \\Pr(A\\cap B)/\\Pr(B)$.', '$\\Pr(A|B) = \\Pr(A\\cap B)/\\Pr(B)$.'), ''),
    term('Bayesova věta', 'Bayes’ theorem', D('Obrácení podmíněné pravděpodobnosti.', 'Reversing a conditional probability.'), ''),
    term('náhodná veličina', 'random variable', D('Veličina s náhodnou hodnotou a rozdělením.', 'A quantity with a random value and a distribution.'), 'X'),
    term('střední hodnota', 'mean (expectation)', D('Průměr přes rozdělení.', 'The average over the distribution.'), 'E[X]'),
    term('rozptyl', 'variance', D('Střední kvadratická odchylka od průměru.', 'Mean squared deviation.'), '\\sigma^2'),
    term('normální rozdělení', 'normal distribution', D('Gaussova křivka.', 'The bell curve.'), ''),
    term('Poissonovo rozdělení', 'Poisson distribution', D('Počty vzácných jevů.', 'Counts of rare events.'), ''),
    term('kovariance', 'covariance', D('$E[XY] - E[X]E[Y]$.', '$E[XY] - E[X]E[Y]$.'), ''),
    term('centrální limitní věta', 'central limit theorem', D('Součty se blíží normálnímu rozdělení.', 'Sums tend to a normal distribution.'), ''),
  ],
};
