import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Statistika jde opačně než pravděpodobnost: z naměřených dat odhaduje neznámé parametry a rozhoduje o hypotézách. Výběrové charakteristiky, odhady, maximální věrohodnost, nejmenší čtverce a testy.',
    'Statistics runs the other way from probability: from measured data it estimates unknown parameters and decides on hypotheses. Sample statistics, estimators, maximum likelihood, least squares and tests.'),
  steps: [
    step('31.1–31.2', D('Výběr a výběrové charakteristiky', 'Samples and sample statistics'), 'barchart', [
      lead('Z celé **populace** máme jen **výběr** $x_1, \\dots, x_N$. Popíšeme ho výběrovým průměrem a rozptylem.', 'From the whole **population** we only have a **sample** $x_1, \\dots, x_N$. Describe it by the sample mean and variance.'),
      math('\\bar x = \\dfrac1N\\sum x_i,\\qquad s^2 = \\dfrac{1}{N-1}\\sum (x_i - \\bar x)^2'),
      warn('Dělíme $N - 1$, ne $N$: jinak bychom rozptyl populace systematicky podhodnocovali (průměr spočítaný z týchž dat je k nim „blíž").', 'Divide by $N - 1$, not $N$: otherwise we systematically underestimate the population variance (the mean from the same data sits “closer” to them).'),
      check(num(D('Průměr dat $2, 4, 6, 8$?', 'Mean of $2, 4, 6, 8$?'), 5, D('$20/4$.', '$20/4$.'))),
    ]),
    step('31.3–31.4', D('Odhady a intervaly spolehlivosti', 'Estimators and confidence intervals'), 'target', [
      lead('Dobrý **odhad** je **nestranný** (v průměru trefí), **konzistentní** (s rostoucím $N$ se zpřesňuje) a **eficientní** (má malý rozptyl).', 'A good **estimator** is **unbiased** (right on average), **consistent** (improves with $N$) and **efficient** (small variance).'),
      math('\\text{směrodatná chyba průměru: } \\sigma_{\\bar x} = \\dfrac{\\sigma}{\\sqrt N}', '\\text{standard error of the mean: } \\sigma_{\\bar x} = \\dfrac{\\sigma}{\\sqrt N}'),
      p('95% interval spolehlivosti pro průměr je zhruba $\\bar x \\pm 1{,}96\\,\\sigma/\\sqrt N$. Chceš-li chybu poloviční, potřebuješ **čtyřikrát** víc měření.', 'A 95 % confidence interval for the mean is roughly $\\bar x \\pm 1.96\\,\\sigma/\\sqrt N$. To halve the error you need **four times** as many measurements.'),
      check(num(D('Kolikrát víc měření sníží chybu průměru 3×?', 'How many times more measurements cut the error of the mean 3×?'), 9, D('Chyba $\\propto 1/\\sqrt N$.', 'Error $\\propto 1/\\sqrt N$.'))),
    ]),
    step('31.5', D('Metoda maximální věrohodnosti', 'Maximum likelihood'), 'magnifier', [
      lead('Zvolíme parametr $\\theta$ tak, aby naměřená data byla co **nejpravděpodobnější**. Věrohodnost je součin hustot.', 'Choose the parameter $\\theta$ that makes the observed data most **probable**. The likelihood is a product of densities.'),
      math('L(\\theta) = \\prod_i f(x_i\\,|\\,\\theta),\\qquad \\dfrac{\\partial\\ln L}{\\partial\\theta} = 0'),
      example(D('Průměr normálního rozdělení', 'Mean of a normal distribution'), D('Data z $N(\\mu, \\sigma^2)$ se známým $\\sigma$. Jaký je ML odhad $\\mu$?', 'Data from $N(\\mu, \\sigma^2)$ with known $\\sigma$. What is the ML estimate of $\\mu$?'),
        [D('$\\ln L = -\\sum \\frac{(x_i - \\mu)^2}{2\\sigma^2} + $ konst.', '$\\ln L = -\\sum \\frac{(x_i - \\mu)^2}{2\\sigma^2} + $ const.'), D('$\\partial_\\mu \\ln L = \\sum \\frac{x_i - \\mu}{\\sigma^2} = 0$.', '$\\partial_\\mu \\ln L = \\sum \\frac{x_i - \\mu}{\\sigma^2} = 0$.')], '$\\hat\\mu = \\bar x$'),
      check(tf(D('ML odhad průměru normálního rozdělení je výběrový průměr.', 'The ML estimate of a normal mean is the sample mean.'), true, D('Viz příklad.', 'See the example.'))),
    ]),
    step('31.6', D('Metoda nejmenších čtverců', 'The method of least squares'), 'straight_ruler', [
      lead('Přímku (nebo jiný model) proložíme daty tak, aby součet čtverců odchylek byl minimální. Pro normální chyby je to totéž jako maximální věrohodnost.', 'Fit a line (or other model) so that the sum of squared deviations is minimal. For normal errors this equals maximum likelihood.'),
      widget('regression'),
      math('\\chi^2 = \\sum_i \\dfrac{(y_i - a - bx_i)^2}{\\sigma_i^2}'),
      tip('Hodnota $\\chi^2$ na jeden stupeň volnosti kolem 1 znamená, že model i odhad chyb sedí.', 'A $\\chi^2$ per degree of freedom around 1 means the model and error estimates are consistent.'),
      check(mcq(D('Regresní přímka vždy prochází bodem…', 'The regression line always passes through…'), ['$(\\bar x, \\bar y)$', '$(0, 0)$', D('prvním bodem', 'the first point'), D('nejvyšším bodem', 'the highest point')], 0, D('Těžištěm dat.', 'The centroid of the data.'))),
    ]),
    step('31.7', D('Testování hypotéz', 'Hypothesis testing'), 'check', [
      lead('Formulujeme **nulovou hypotézu** $H_0$ (např. „lék nepůsobí") a spočítáme, jak nepravděpodobná by naměřená data byla, kdyby platila – to je **p-hodnota**.', 'State a **null hypothesis** $H_0$ (e.g. “the drug has no effect”) and compute how unlikely the data would be if it held – the **p-value**.'),
      list(D('$p < \\alpha$ (hladina významnosti, typicky 0,05): $H_0$ zamítáme,', '$p < \\alpha$ (significance level, typically 0.05): reject $H_0$,'), D('**chyba 1. druhu**: zamítneme pravdivou $H_0$,', '**type I error**: rejecting a true $H_0$,'), D('**chyba 2. druhu**: nezamítneme nepravdivou $H_0$.', '**type II error**: failing to reject a false $H_0$.')),
      p('Studentův **t-test** porovnává průměry při malém počtu měření, **$\\chi^2$-test** shodu dat s modelem, **F-test** rozptyly.', 'Student’s **t-test** compares means for small samples, the **$\\chi^2$ test** model fit, the **F-test** variances.'),
      warn('Nezamítnutí $H_0$ neznamená, že $H_0$ platí – jen že data nestačí na její vyvrácení.', 'Not rejecting $H_0$ does not prove it – the data just are not enough to refute it.'),
      check(mcq(D('Chyba prvního druhu je…', 'A type I error is…'), [D('zamítnutí pravdivé nulové hypotézy', 'rejecting a true null hypothesis'), D('přijetí nepravdivé hypotézy', 'accepting a false hypothesis'), D('chyba měření', 'a measurement error'), D('špatný výpočet průměru', 'a wrong mean')], 0, D('„Falešný poplach".', 'A “false alarm”.'))),
    ]),
  ],
  quiz: [
    num(D('Výběrový rozptyl (s $N - 1$) dat $1, 2, 3$?', 'Sample variance (with $N - 1$) of $1, 2, 3$?'), 1, D('$\\frac{1 + 0 + 1}{2}$.', '$\\frac{1 + 0 + 1}{2}$.')),
    mcq(D('Směrodatná chyba průměru klesá jako…', 'The standard error of the mean falls as…'), ['$1/\\sqrt N$', '$1/N$', '$1/N^2$', '$\\ln N$'], 0, D('$\\sigma/\\sqrt N$.', '$\\sigma/\\sqrt N$.')),
    tf(D('Nestranný odhad v průměru trefí skutečnou hodnotu.', 'An unbiased estimator equals the true value on average.'), true, D('Definice nestrannosti.', 'Definition of unbiasedness.')),
    mcq(D('Metoda maximální věrohodnosti maximalizuje…', 'Maximum likelihood maximises…'), [D('pravděpodobnost naměřených dat', 'the probability of the observed data'), D('rozptyl', 'the variance'), D('počet měření', 'the number of measurements'), D('p-hodnotu', 'the p-value')], 0, D('$L(\\theta)$.', '$L(\\theta)$.')),
    mcq(D('Když $p = 0{,}01$ a $\\alpha = 0{,}05$, pak…', 'If $p = 0.01$ and $\\alpha = 0.05$, then…'), [D('$H_0$ zamítáme', 'we reject $H_0$'), D('$H_0$ přijímáme jako dokázanou', 'we accept $H_0$ as proven'), D('test je neplatný', 'the test is invalid'), D('nic nevíme', 'we know nothing')], 0, D('$p < \\alpha$.', '$p < \\alpha$.')),
    mcq(D('Pro porovnání průměrů malých výběrů se používá…', 'For comparing means of small samples use…'), [D('t-test', 'the t-test'), D('F-test', 'the F-test'), D('Stirlingův vzorec', 'Stirling’s formula'), D('Fourierova transformace', 'the Fourier transform')], 0, D('Studentovo t-rozdělení.', 'Student’s t-distribution.')),
    tf(D('$\\chi^2$ na stupeň volnosti výrazně větší než 1 naznačuje špatný model nebo podceněné chyby.', 'A $\\chi^2$ per degree of freedom much larger than 1 suggests a bad model or underestimated errors.'), true, D('Data se od modelu odchylují víc, než odpovídá chybám.', 'The data deviate more than the errors allow.')),
  ],
  glossary: [
    term('populace', 'population', D('Celý soubor, o kterém chceme něco vědět.', 'The whole set we want to learn about.'), ''),
    term('výběr', 'sample', D('Naměřená část populace.', 'The measured part of the population.'), ''),
    term('výběrový průměr', 'sample mean', D('$\\bar x = \\frac1N\\sum x_i$.', '$\\bar x = \\frac1N\\sum x_i$.'), '\\bar x'),
    term('odhad', 'estimator', D('Pravidlo pro výpočet parametru z dat.', 'A rule computing a parameter from data.'), '\\hat\\theta'),
    term('nestranný odhad', 'unbiased estimator', D('V průměru se rovná skutečné hodnotě.', 'Equals the true value on average.'), ''),
    term('interval spolehlivosti', 'confidence interval', D('Rozsah, ve kterém s danou pravděpodobností leží parametr.', 'A range containing the parameter with given probability.'), ''),
    term('věrohodnost', 'likelihood', D('Pravděpodobnost dat jako funkce parametru.', 'Probability of the data as a function of the parameter.'), 'L(\\theta)'),
    term('metoda nejmenších čtverců', 'least squares', D('Minimalizace součtu čtverců odchylek.', 'Minimising the sum of squared deviations.'), ''),
    term('nulová hypotéza', 'null hypothesis', D('Výchozí tvrzení, které testujeme.', 'The default claim being tested.'), 'H_0'),
    term('p-hodnota', 'p-value', D('Pravděpodobnost tak extrémních dat při platnosti $H_0$.', 'Probability of data this extreme under $H_0$.'), ''),
    term('hladina významnosti', 'significance level', D('Práh $\\alpha$ pro zamítnutí $H_0$.', 'The threshold $\\alpha$ for rejecting $H_0$.'), '\\alpha'),
  ],
};
