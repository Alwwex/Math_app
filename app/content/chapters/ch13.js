import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Fourierova a Laplaceova transformace převádějí derivace na násobení. Diferenciální rovnice se tak mění v algebru. Bonus: Diracova delta funkce a konvoluce.',
    'Fourier and Laplace transforms turn derivatives into multiplication, so differential equations become algebra. Bonus: the Dirac delta and convolution.'),
  steps: [
    step('13.1', D('Fourierova transformace', 'The Fourier transform'), 'antenna', [
      lead('Neperiodickou funkci rozložíme na spojité spektrum frekvencí. Kniha používá symetrickou konvenci s $1/\\sqrt{2\\pi}$.', 'A non-periodic function is decomposed into a continuous spectrum. The book uses the symmetric convention with $1/\\sqrt{2\\pi}$.'),
      math('\\tilde f(\\omega) = \\dfrac{1}{\\sqrt{2\\pi}}\\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\omega t}dt,\\qquad f(t) = \\dfrac{1}{\\sqrt{2\\pi}}\\int_{-\\infty}^{\\infty}\\tilde f(\\omega)\\,e^{i\\omega t}d\\omega'),
      p('Gaussovka se transformuje opět na gaussovku – ale čím užší je v čase, tím širší je ve frekvencích. To je matematické jádro **relace neurčitosti**.', 'A Gaussian transforms into a Gaussian – the narrower in time, the wider in frequency. That is the mathematical core of the **uncertainty principle**.'),
      widget('paramPlot', {
        view: [-6, 6, -.05, 1.45], params: [{ k: 's', label: '\\sigma', min: .3, max: 2.5, value: 1, step: .01 }],
        curves: [{ f: (x, P) => Math.exp(-x * x / (2 * P.s * P.s)), label: 'f(t) = e^{-t^2/2\\sigma^2}' }, { f: (x, P) => P.s * Math.exp(-x * x * P.s * P.s / 2), label: '\\tilde f(\\omega) = \\sigma e^{-\\omega^2\\sigma^2/2}', color: 'var(--orange)' }],
        info: (P, T) => `\\Delta t \\sim \\sigma = ${P.s.toFixed(2)}\n\\Delta\\omega \\sim 1/\\sigma = ${(1 / P.s).toFixed(2)}\n\\Delta t\\,\\Delta\\omega \\approx 1`,
      }),
      check(tf(D('Velmi krátký impuls má velmi široké frekvenční spektrum.', 'A very short pulse has a very broad spectrum.'), true, D('Šířka v čase × šířka ve frekvenci ≈ konst.', 'Width in time × width in frequency ≈ const.'))),
    ]),
    step('13.1', D('Diracova delta funkce', 'The Dirac delta function'), 'target', [
      lead('$\\delta(t)$ je „nekonečně úzký impuls jednotkové plochy". Není to obyčejná funkce, ale definuje ji její účinek v integrálu.', '$\\delta(t)$ is an “infinitely narrow spike of unit area”. Not an ordinary function – it is defined by what it does inside integrals.'),
      math('\\int_{-\\infty}^{\\infty} f(t)\\,\\delta(t - a)\\,dt = f(a),\\qquad \\delta(t) = \\dfrac{1}{2\\pi}\\int_{-\\infty}^{\\infty} e^{i\\omega t}d\\omega'),
      tip('Užitečné: $\\delta(at) = \\delta(t)/|a|$ a $\\delta(g(x)) = \\sum_i \\delta(x - x_i)/|g\'(x_i)|$ přes nulové body $g$.', 'Useful: $\\delta(at) = \\delta(t)/|a|$ and $\\delta(g(x)) = \\sum_i \\delta(x - x_i)/|g\'(x_i)|$ over the zeros of $g$.'),
      phys('Hustota bodového náboje $q$ v místě $\\mathbf r_0$ je $\\rho = q\\,\\delta^3(\\mathbf r - \\mathbf r_0)$.', 'The density of a point charge $q$ at $\\mathbf r_0$ is $\\rho = q\\,\\delta^3(\\mathbf r - \\mathbf r_0)$.'),
      check(num(D('$\\int_{-\\infty}^{\\infty} (t^2 + 1)\\,\\delta(t - 2)\\,dt = ?$', '$\\int_{-\\infty}^{\\infty} (t^2 + 1)\\,\\delta(t - 2)\\,dt = ?$'), 5, D('Delta „vybere" hodnotu v $t = 2$.', 'The delta picks the value at $t = 2$.'))),
    ]),
    step('13.1', D('Konvoluce', 'Convolution'), 'link', [
      lead('Konvoluce $h = f * g$ popisuje „rozmazání" signálu přístrojem. Transformace z ní udělá obyčejný součin.', 'The convolution $h = f * g$ describes how an instrument smears a signal. The transform turns it into an ordinary product.'),
      math('h(z) = \\int f(x)\\,g(z - x)\\,dx,\\qquad \\tilde h(k) = \\sqrt{2\\pi}\\,\\tilde f(k)\\,\\tilde g(k)'),
      p('Proto se v optice a zpracování obrazu filtruje ve frekvenční oblasti: transformuj, vynásob, transformuj zpět.', 'That is why optics and image processing filter in frequency space: transform, multiply, transform back.'),
      check(mcq(D('Fourierova transformace konvoluce je…', 'The Fourier transform of a convolution is…'), [D('(úměrná) součinu transformací', '(proportional to) the product of transforms'), D('součet transformací', 'the sum of transforms'), D('konvoluce transformací', 'the convolution of transforms'), D('nula', 'zero')], 0, D('Konvoluční věta.', 'The convolution theorem.'))),
    ]),
    step('13.2', D('Laplaceova transformace', 'The Laplace transform'), 'hourglass', [
      lead('Pro úlohy s počáteční podmínkou v čase $t = 0$ je ideální Laplaceova transformace.', 'For initial-value problems starting at $t = 0$ the Laplace transform is ideal.'),
      math('\\bar f(s) = \\int_0^\\infty f(t)\\,e^{-st}dt,\\qquad \\mathcal L[f\'] = s\\bar f - f(0)'),
      list('$\\mathcal L[1] = 1/s$, $\\quad\\mathcal L[e^{at}] = 1/(s - a)$', '$\\mathcal L[\\sin\\omega t] = \\omega/(s^2 + \\omega^2)$, $\\quad\\mathcal L[\\cos\\omega t] = s/(s^2 + \\omega^2)$', '$\\mathcal L[t^n] = n!/s^{n+1}$'),
      example(D('Rovnice rozpadu', 'Decay equation'), D('Vyřeš $y\' + 2y = 0$, $y(0) = 3$.', 'Solve $y\' + 2y = 0$, $y(0) = 3$.'),
        [D('Transformuj: $s\\bar y - 3 + 2\\bar y = 0$.', 'Transform: $s\\bar y - 3 + 2\\bar y = 0$.'), D('$\\bar y = \\dfrac{3}{s + 2}$ → zpětně $y = 3e^{-2t}$.', '$\\bar y = \\dfrac{3}{s + 2}$ → inverse $y = 3e^{-2t}$.')], '$y = 3e^{-2t}$'),
      check(mcq(D('$\\mathcal L[e^{3t}] = ?$', '$\\mathcal L[e^{3t}] = ?$'), ['$\\frac{1}{s - 3}$', '$\\frac{1}{s + 3}$', '$\\frac{3}{s}$', '$\\frac{s}{s^2 + 9}$'], 0, D('$\\int_0^\\infty e^{-(s-3)t}dt$.', '$\\int_0^\\infty e^{-(s-3)t}dt$.'))),
    ]),
  ],
  quiz: [
    mcq(D('Fourierova transformace derivace $f\'(t)$ je…', 'The Fourier transform of $f\'(t)$ is…'), ['$i\\omega\\tilde f(\\omega)$', '$\\tilde f\'(\\omega)$', '$\\omega^2\\tilde f$', '$\\tilde f/i\\omega$'], 0, D('Derivace → násobení $i\\omega$.', 'Derivative → multiply by $i\\omega$.')),
    num(D('$\\int_{-\\infty}^\\infty \\cos t\\,\\delta(t)\\,dt = ?$', '$\\int_{-\\infty}^\\infty \\cos t\\,\\delta(t)\\,dt = ?$'), 1, D('$\\cos 0 = 1$.', '$\\cos 0 = 1$.')),
    mcq(D('$\\mathcal L[\\sin 2t] = ?$', '$\\mathcal L[\\sin 2t] = ?$'), ['$\\frac{2}{s^2 + 4}$', '$\\frac{s}{s^2 + 4}$', '$\\frac{1}{s - 2}$', '$\\frac{2}{s^2 - 4}$'], 0, D('$\\omega/(s^2 + \\omega^2)$ s $\\omega = 2$.', '$\\omega/(s^2 + \\omega^2)$ with $\\omega = 2$.')),
    tf(D('Užší gaussovka v čase má užší spektrum.', 'A narrower Gaussian in time has a narrower spectrum.'), false, D('Naopak – širší.', 'The opposite – broader.')),
    mcq(D('$\\mathcal L[f\']$ = ?', '$\\mathcal L[f\']$ = ?'), ['$s\\bar f - f(0)$', '$s\\bar f$', '$\\bar f/s$', '$\\bar f - sf(0)$'], 0, D('Per partes.', 'Integration by parts.')),
    num(D('$\\mathcal L[t^2]$ v bodě $s = 1$?', '$\\mathcal L[t^2]$ at $s = 1$?'), 2, D('$2!/s^3 = 2$.', '$2!/s^3 = 2$.')),
    tf(D('Diracova delta je obyčejná funkce s hodnotou $\\infty$ v nule.', 'The Dirac delta is an ordinary function equal to $\\infty$ at zero.'), false, D('Je to distribuce definovaná integrálem.', 'It is a distribution defined via integrals.')),
  ],
  glossary: [
    term('Fourierova transformace', 'Fourier transform', D('Rozklad funkce na spojité spektrum frekvencí.', 'Decomposition into a continuous frequency spectrum.'), '\\tilde f(\\omega)'),
    term('Laplaceova transformace', 'Laplace transform', D('$\\int_0^\\infty f e^{-st}dt$ – pro počáteční úlohy.', '$\\int_0^\\infty f e^{-st}dt$ – for initial-value problems.'), '\\bar f(s)'),
    term('Diracova delta funkce', 'Dirac delta function', D('Jednotkový impuls nulové šířky.', 'A unit impulse of zero width.'), '\\delta(t)'),
    term('konvoluce', 'convolution', D('$\\int f(x)g(z - x)\\,dx$.', '$\\int f(x)g(z - x)\\,dx$.'), 'f * g'),
    term('spektrum', 'spectrum', D('Rozložení signálu do frekvencí.', 'How a signal is distributed in frequency.'), ''),
    term('relace neurčitosti', 'uncertainty principle', D('$\\Delta t\\,\\Delta\\omega \\gtrsim 1$.', '$\\Delta t\\,\\Delta\\omega \\gtrsim 1$.'), ''),
    term('přenosová funkce', 'transfer function', D('Poměr transformací výstupu a vstupu.', 'Ratio of output and input transforms.'), ''),
  ],
};
