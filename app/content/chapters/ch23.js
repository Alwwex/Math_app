import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Neznámá funkce může stát i pod integrálem. Integrální rovnice vznikají z diferenciálních rovnic s okrajovými podmínkami a v teorii rozptylu.',
    'The unknown function can sit under an integral. Integral equations arise from differential equations with boundary conditions and in scattering theory.'),
  steps: [
    step('23.1–23.2', D('Typy integrálních rovnic', 'Types of integral equation'), 'puzzle', [
      lead('Obecný tvar: $y(x) = f(x) + \\lambda\\int K(x, z)\\,y(z)\\,dz$. Funkce $K$ je **jádro**.', 'General form: $y(x) = f(x) + \\lambda\\int K(x, z)\\,y(z)\\,dz$. The function $K$ is the **kernel**.'),
      list(D('**Fredholmova** – pevné meze $a, b$,', '**Fredholm** – fixed limits $a, b$,'), D('**Volterrova** – horní mez je $x$,', '**Volterra** – the upper limit is $x$,'),
        D('**1. druhu** – $y$ jen pod integrálem; **2. druhu** – $y$ i mimo něj,', '**first kind** – $y$ only inside the integral; **second kind** – also outside,'), D('**homogenní** – $f = 0$.', '**homogeneous** – $f = 0$.')),
      example(D('Z ODR na integrální rovnici', 'From an ODE to an integral equation'), D("Převeď $y' = y$, $y(0) = 1$.", "Convert $y' = y$, $y(0) = 1$."),
        [D('Integrujeme od 0 do $x$: $y(x) - y(0) = \\int_0^x y(z)\\,dz$.', 'Integrate from 0 to $x$: $y(x) - y(0) = \\int_0^x y(z)\\,dz$.')], D('$y(x) = 1 + \\int_0^x y(z)\\,dz$ – Volterrova rovnice 2. druhu', '$y(x) = 1 + \\int_0^x y(z)\\,dz$ – a Volterra equation of the second kind')),
      check(mcq(D('Rovnice $y(x) = x + \\int_0^1 xz\\,y(z)\\,dz$ je…', 'The equation $y(x) = x + \\int_0^1 xz\\,y(z)\\,dz$ is…'), [D('Fredholmova 2. druhu', 'Fredholm, second kind'), D('Volterrova 1. druhu', 'Volterra, first kind'), D('homogenní', 'homogeneous'), D('diferenciální', 'differential')], 0, D('Pevné meze a $y$ i mimo integrál.', 'Fixed limits and $y$ outside the integral.'))),
    ]),
    step('23.3–23.4', D('Řešení v uzavřeném tvaru', 'Closed-form solutions'), 'gem', [
      lead('Když je jádro **separabilní** $K(x, z) = \\sum_i \\phi_i(x)\\psi_i(z)$, převede se rovnice na soustavu lineárních rovnic.', 'If the kernel is **separable**, $K(x, z) = \\sum_i \\phi_i(x)\\psi_i(z)$, the equation reduces to a linear system.'),
      example(D('Separabilní jádro', 'A separable kernel'), D('Řeš $y(x) = x + \\lambda\\int_0^1 xz\\,y(z)\\,dz$.', 'Solve $y(x) = x + \\lambda\\int_0^1 xz\\,y(z)\\,dz$.'),
        [D('Řešení má tvar $y = x(1 + \\lambda c)$, kde $c = \\int_0^1 z\\,y(z)\\,dz$.', 'The solution has the form $y = x(1 + \\lambda c)$ with $c = \\int_0^1 z\\,y(z)\\,dz$.'),
         D('$c = (1 + \\lambda c)\\int_0^1 z^2dz = \\frac{1 + \\lambda c}{3}$ → $c = \\dfrac{1}{3 - \\lambda}$.', '$c = (1 + \\lambda c)\\int_0^1 z^2dz = \\frac{1 + \\lambda c}{3}$ → $c = \\dfrac{1}{3 - \\lambda}$.')],
        '$y = \\dfrac{3x}{3 - \\lambda}$ ($\\lambda \\ne 3$)'),
      tip('Jádro typu $K(x - z)$ (konvoluce) se řeší Fourierovou nebo Laplaceovou transformací.', 'A kernel $K(x - z)$ (a convolution) is solved by Fourier or Laplace transforms.'),
      check(num(D('Pro které $\\lambda$ selže řešení v příkladu?', 'For which $\\lambda$ does the example fail?'), 3, D('Jmenovatel $3 - \\lambda = 0$ – vlastní číslo homogenní rovnice.', 'Denominator $3 - \\lambda = 0$ – an eigenvalue of the homogeneous equation.'))),
    ]),
    step('23.5', D('Neumannova řada', 'The Neumann series'), 'infinity', [
      lead('Iterace: dosadíme pravou stranu sama do sebe. Pro malé $\\lambda$ vznikne konvergentní řada.', 'Iteration: substitute the right-hand side into itself. For small $\\lambda$ this gives a convergent series.'),
      math('y = f + \\lambda Kf + \\lambda^2K^2f + \\dots'),
      p('Pro $y(x) = 1 + \\lambda\\int_0^x y\\,dz$ dávají iterace postupně $1$, $1 + \\lambda x$, $1 + \\lambda x + \\frac{(\\lambda x)^2}{2}$, … – Taylorova řada pro $e^{\\lambda x}$:', 'For $y(x) = 1 + \\lambda\\int_0^x y\\,dz$ the iterates are $1$, $1 + \\lambda x$, $1 + \\lambda x + \\frac{(\\lambda x)^2}{2}$, … – the Taylor series of $e^{\\lambda x}$:'),
      widget('paramPlot', {
        view: [0, 3, 0, 12], params: [{ k: 'N', label: 'N', min: 0, max: 10, value: 1, int: true, step: 1 }, { k: 'l', label: '\\lambda', min: .2, max: 1, value: .8, step: .01 }], play: 'N', interval: 700,
        curves: [{ f: (x, P) => Math.exp(P.l * x), label: 'e^{\\lambda x}', color: 'var(--ink-3)', width: 6 }, { f: (x, P) => { let s = 0, t = 1; for (let k = 0; k <= P.N; k++) { s += t; t *= P.l * x / (k + 1); } return s; }, label: (P, T) => `\\text{${P.N}. ${T('iterace', 'iterate')}}` }],
        info: () => 'y_{n+1}(x) = 1 + \\lambda\\int_0^x y_n(z)\\,dz',
      }),
      check(tf(D('Neumannova řada konverguje pro libovolně velké $\\lambda$.', 'The Neumann series converges for arbitrarily large $\\lambda$.'), false, D('Obecně jen pro dostatečně malé $|\\lambda|$ (u Volterrových rovnic ale pro všechna).', 'In general only for small enough $|\\lambda|$ (though for Volterra equations for all).'))),
    ]),
    step('23.6–23.7', D('Fredholmova a Schmidtova–Hilbertova teorie', 'Fredholm and Schmidt–Hilbert theory'), 'brain', [
      lead('**Fredholmova alternativa**: buď má nehomogenní rovnice jediné řešení, nebo má homogenní rovnice netriviální řešení – a pak řešení nehomogenní existuje jen za podmínky ortogonality.', '**Fredholm alternative**: either the inhomogeneous equation has a unique solution, or the homogeneous one has a non-trivial solution – and then the inhomogeneous one is solvable only under an orthogonality condition.'),
      p('Pro **hermitovské jádro** $K(x, z) = K^*(z, x)$ rozložíme řešení do vlastních funkcí jádra – stejně jako u hermitovských operátorů v kapitole 17.', 'For a **Hermitian kernel** $K(x, z) = K^*(z, x)$, expand the solution in the kernel’s eigenfunctions – just like Hermitian operators in Chapter 17.'),
      check(mcq(D('Fredholmova alternativa rozlišuje případy podle…', 'The Fredholm alternative distinguishes cases by…'), [D('existence řešení homogenní rovnice', 'whether the homogeneous equation has solutions'), D('typu jádra', 'kernel type'), D('meze integrálu', 'the integration limit'), D('znaménka $f$', 'the sign of $f$')], 0, D('Analogie s $\\det A = 0$ u matic.', 'Analogous to $\\det A = 0$ for matrices.'))),
    ]),
  ],
  quiz: [
    mcq(D('Volterrova rovnice má horní mez integrálu…', 'A Volterra equation has upper limit…'), ['$x$', D('pevnou', 'fixed'), '$\\infty$', '$0$'], 0, D('Definice.', 'Definition.')),
    tf(D('Separabilní jádro vede na soustavu lineárních algebraických rovnic.', 'A separable kernel leads to a system of linear algebraic equations.'), true, D('Neznámé jsou integrály $c_i$.', 'The unknowns are the integrals $c_i$.')),
    mcq(D('Rovnice $\\int_0^1 K(x,z)y(z)dz = f(x)$ je…', 'The equation $\\int_0^1 K(x,z)y(z)dz = f(x)$ is…'), [D('1. druhu', 'first kind'), D('2. druhu', 'second kind'), D('homogenní', 'homogeneous'), D('Volterrova', 'Volterra')], 0, D('$y$ je jen pod integrálem.', '$y$ only under the integral.')),
    num(D('Řešení $y = x + 2\\int_0^1 xz\\,y\\,dz$ v bodě $x = 1$?', 'Solution of $y = x + 2\\int_0^1 xz\\,y\\,dz$ at $x = 1$?'), 3, D('$y = 3x/(3 - 2) = 3x$.', '$y = 3x/(3 - 2) = 3x$.')),
    mcq(D('Neumannova řada pro $y = 1 + \\lambda\\int_0^x y$ dává…', 'The Neumann series for $y = 1 + \\lambda\\int_0^x y$ gives…'), ['$e^{\\lambda x}$', '$\\cos\\lambda x$', '$1/(1 - \\lambda x)$', '$x^\\lambda$'], 0, D('Taylorova řada exponenciály.', 'The exponential’s Taylor series.')),
    tf(D('Jádro tvaru $K(x - z)$ lze řešit transformací.', 'A kernel of the form $K(x - z)$ can be handled by transforms.'), true, D('Konvoluční věta.', 'Convolution theorem.')),
  ],
  glossary: [
    term('integrální rovnice', 'integral equation', D('Rovnice s neznámou funkcí pod integrálem.', 'An equation with the unknown under an integral.'), ''),
    term('jádro', 'kernel', D('Funkce $K(x, z)$ v integrálu.', 'The function $K(x, z)$ in the integral.'), ''),
    term('Fredholmova rovnice', 'Fredholm equation', D('Integrální rovnice s pevnými mezemi.', 'Integral equation with fixed limits.'), ''),
    term('Volterrova rovnice', 'Volterra equation', D('Integrální rovnice s proměnnou horní mezí.', 'Integral equation with a variable upper limit.'), ''),
    term('separabilní jádro', 'separable kernel', D('$K = \\sum\\phi_i(x)\\psi_i(z)$.', '$K = \\sum\\phi_i(x)\\psi_i(z)$.'), ''),
    term('Neumannova řada', 'Neumann series', D('Řešení iterací v mocninách $\\lambda$.', 'Solution by iteration in powers of $\\lambda$.'), ''),
    term('Fredholmova alternativa', 'Fredholm alternative', D('Buď jediné řešení, nebo netriviální homogenní řešení.', 'Either a unique solution or a non-trivial homogeneous one.'), ''),
  ],
};
