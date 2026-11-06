import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Když řešení nejde zapsat elementárními funkcemi, hledáme ho jako mocninnou řadu. Tak vznikají Legendreovy polynomy, Besselovy funkce a další speciální funkce.',
    'When the solution cannot be written with elementary functions, look for it as a power series. This is how Legendre polynomials, Bessel functions and other special functions arise.'),
  steps: [
    step('16.1', D('Regulární a singulární body', 'Ordinary and singular points'), 'link', [
      lead('Rovnici zapíšeme jako $y\'\' + p(x)y\' + q(x)y = 0$. Bod $z_0$ je **regulární** (obyčejný), když $p$ i $q$ jsou v něm analytické.', 'Write the equation as $y\'\' + p(x)y\' + q(x)y = 0$. The point $z_0$ is **ordinary** if $p$ and $q$ are analytic there.'),
      p('Když ne, ale $(z - z_0)p$ a $(z - z_0)^2q$ analytické jsou, je bod **regulární singulární** – i tam řešení řadou funguje (Frobeniova metoda). Jinak je singularita **iregulární** a řešení řadou obecně selže.', 'If not, but $(z - z_0)p$ and $(z - z_0)^2q$ are analytic, the point is a **regular singular point** – a series still works (Frobenius). Otherwise it is an **irregular** singularity and series methods generally fail.'),
      check(mcq(D("Pro Besselovu rovnici $x^2y'' + xy' + (x^2 - \\nu^2)y = 0$ je $x = 0$…", "For Bessel’s equation $x^2y'' + xy' + (x^2 - \\nu^2)y = 0$, $x = 0$ is…"), [D('regulární singulární bod', 'a regular singular point'), D('regulární (obyčejný) bod', 'an ordinary point'), D('iregulární singulární bod', 'an irregular singular point'), D('nic z toho', 'none of these')], 0, D('$p = 1/x$, $q = 1 - \\nu^2/x^2$; $xp$ a $x^2q$ jsou analytické.', '$p = 1/x$, $q = 1 - \\nu^2/x^2$; $xp$ and $x^2q$ are analytic.'))),
    ]),
    step('16.2', D('Řešení řadou kolem regulárního bodu', 'Series about an ordinary point'), 'infinity', [
      lead('Dosadíme $y = \\sum a_n x^n$ a porovnáme koeficienty u stejných mocnin. Dostaneme **rekurentní vztah** pro $a_n$.', 'Substitute $y = \\sum a_n x^n$ and compare coefficients of equal powers. This gives a **recurrence relation** for $a_n$.'),
      example(D('Kmity z řady', 'Oscillations from a series'), D("Řeš $y'' + y = 0$ řadou.", "Solve $y'' + y = 0$ by a series."),
        [D('$y\'\' = \\sum (n+2)(n+1)a_{n+2}x^n$, takže $(n+2)(n+1)a_{n+2} + a_n = 0$.', '$y\'\' = \\sum (n+2)(n+1)a_{n+2}x^n$, so $(n+2)(n+1)a_{n+2} + a_n = 0$.'),
         D('$a_{n+2} = -\\dfrac{a_n}{(n+2)(n+1)}$: ze sudých $a_0$ vznikne $\\cos x$, z lichých $a_1$ vznikne $\\sin x$.', '$a_{n+2} = -\\dfrac{a_n}{(n+2)(n+1)}$: the even terms from $a_0$ give $\\cos x$, the odd ones from $a_1$ give $\\sin x$.')],
        '$y = a_0\\cos x + a_1\\sin x$'),
      widget('paramPlot', {
        view: [-10, 10, -2.2, 2.2], params: [{ k: 'N', label: 'N', min: 1, max: 30, value: 4, int: true, step: 1 }], play: 'N', interval: 500,
        curves: [{ f: x => Math.cos(x), label: '\\cos x', color: 'var(--ink-3)', width: 6 }, { f: (x, P) => { let a = 1, s = 0; for (let n = 0; n < 2 * P.N; n += 2) { s += a * x ** n; a = -a / ((n + 2) * (n + 1)); } return s; }, label: (P, T) => `\\text{${P.N} ${T('členů z rekurence', 'terms from the recurrence')}}` }],
        info: () => 'a_{n+2} = -\\dfrac{a_n}{(n+2)(n+1)}',
      }),
      check(num(D('Z rekurence $a_{n+2} = -a_n/((n+2)(n+1))$ a $a_0 = 1$: kolik je $a_2$?', 'From $a_{n+2} = -a_n/((n+2)(n+1))$ with $a_0 = 1$: what is $a_2$?'), -0.5, D('$-1/(2\\cdot1)$.', '$-1/(2\\cdot1)$.'), { tol: .001 })),
    ]),
    step('16.3', D('Frobeniova metoda', 'The Frobenius method'), 'violin', [
      lead('Kolem regulárního singulárního bodu hledáme řešení $y = x^\\sigma\\sum a_n x^n$. Exponent $\\sigma$ určí **určující (indicial) rovnice**.', 'About a regular singular point try $y = x^\\sigma\\sum a_n x^n$. The exponent $\\sigma$ comes from the **indicial equation**.'),
      p('Když se kořeny $\\sigma_1, \\sigma_2$ neliší o celé číslo, dostaneme dvě nezávislá řešení. Když ano, může se druhé řešení „rozbít" a objeví se logaritmus.', 'If the roots $\\sigma_1, \\sigma_2$ do not differ by an integer we get two independent solutions. If they do, the second solution may break and a logarithm appears.'),
      phys('Besselova rovnice popisuje kmity bubnu, vedení tepla ve válci i šíření vln ve vlnovodu.', 'Bessel’s equation describes drum vibrations, heat flow in cylinders and waveguides.'),
      check(mcq(D('Pro Besselovu rovnici řádu $\\nu$ má určující rovnice kořeny…', 'For Bessel’s equation of order $\\nu$ the indicial roots are…'), ['$\\pm\\nu$', '$0, 1$', '$\\nu, \\nu + 1$', '$\\pm i\\nu$'], 0, D('$\\sigma^2 - \\nu^2 = 0$.', '$\\sigma^2 - \\nu^2 = 0$.'))),
    ]),
    step('16.4–16.5', D('Druhé řešení a polynomiální řešení', 'A second solution and polynomial solutions'), 'gem', [
      lead('Druhé řešení najdeme z Wronskiánu: $y_2 = y_1\\int\\dfrac{W}{y_1^2}dx$, kde $W = Ce^{-\\int p\\,dx}$.', 'Find a second solution from the Wronskian: $y_2 = y_1\\int\\dfrac{W}{y_1^2}dx$ with $W = Ce^{-\\int p\\,dx}$.'),
      p('Někdy se řada sama **ukončí** – když rekurence dá $a_n = 0$ od jistého $n$. Pak je řešení polynom. Legendreova rovnice $(1 - x^2)y\'\' - 2xy\' + \\ell(\\ell + 1)y = 0$ má pro celé $\\ell$ polynomiální řešení $P_\\ell(x)$.', 'Sometimes the series **terminates** – the recurrence gives $a_n = 0$ from some $n$ on. Then the solution is a polynomial. Legendre’s equation $(1 - x^2)y\'\' - 2xy\' + \\ell(\\ell + 1)y = 0$ has polynomial solutions $P_\\ell(x)$ for integer $\\ell$.'),
      tip('Proto jsou kvantová čísla celá: řada musí skončit, jinak řešení na pólu ($x = \\pm1$) diverguje.', 'This is why quantum numbers are integers: the series must terminate, otherwise the solution blows up at the poles ($x = \\pm1$).'),
      check(tf(D('Legendreova rovnice má polynomiální řešení jen pro celé nezáporné $\\ell$.', 'Legendre’s equation has polynomial solutions only for non-negative integer $\\ell$.'), true, D('Jinak se řada neukončí.', 'Otherwise the series does not terminate.'))),
    ]),
  ],
  quiz: [
    mcq(D('Bod je obyčejný, když…', 'A point is ordinary when…'), [D('$p$ a $q$ jsou v něm analytické', '$p$ and $q$ are analytic there'), D('$p = q = 0$', '$p = q = 0$'), D('řešení je nulové', 'the solution is zero'), D('rovnice je lineární', 'the equation is linear')], 0, D('Definice.', 'Definition.')),
    tf(D('Kolem obyčejného bodu má rovnice dvě nezávislá řešení ve tvaru mocninných řad.', 'Around an ordinary point there are two independent power-series solutions.'), true, D('Fuchsova věta.', 'Fuchs’ theorem.')),
    mcq(D('Frobeniův ansatz je…', 'The Frobenius ansatz is…'), ['$x^\\sigma\\sum a_nx^n$', '$\\sum a_nx^n$', '$e^{\\lambda x}$', '$x^m$'], 0, D('Mocnina krát řada.', 'A power times a series.')),
    mcq(D('Když se kořeny určující rovnice liší o celé číslo, druhé řešení může obsahovat…', 'If the indicial roots differ by an integer, the second solution may contain…'), ['$\\ln x$', '$e^x$', '$\\sin x$', D('nic navíc', 'nothing extra')], 0, D('Logaritmický člen.', 'A logarithmic term.')),
    num(D('Rekurence $a_{n+2} = -a_n/((n+2)(n+1))$, $a_1 = 1$: kolik je $a_3 \\cdot 6$?', 'Recurrence $a_{n+2} = -a_n/((n+2)(n+1))$, $a_1 = 1$: what is $6a_3$?'), -1, D('$a_3 = -1/6$.', '$a_3 = -1/6$.')),
    tf(D('Legendreovy polynomy vznikají ukončením řady.', 'Legendre polynomials arise when the series terminates.'), true, D('Pro celé $\\ell$.', 'For integer $\\ell$.')),
  ],
  glossary: [
    term('obyčejný bod', 'ordinary point', D('Bod, kde jsou koeficienty analytické.', 'A point where the coefficients are analytic.'), ''),
    term('regulární singulární bod', 'regular singular point', D('Mírná singularita, kde funguje Frobenius.', 'A mild singularity where Frobenius works.'), ''),
    term('rekurentní vztah', 'recurrence relation', D('Vzorec pro $a_n$ pomocí předchozích koeficientů.', 'A formula for $a_n$ in terms of earlier ones.'), ''),
    term('Frobeniova metoda', 'Frobenius method', D('Řešení ve tvaru $x^\\sigma\\sum a_nx^n$.', 'Solutions of the form $x^\\sigma\\sum a_nx^n$.'), ''),
    term('určující rovnice', 'indicial equation', D('Rovnice pro exponent $\\sigma$.', 'The equation for the exponent $\\sigma$.'), ''),
    term('Besselova rovnice', 'Bessel’s equation', D('$x^2y\'\' + xy\' + (x^2 - \\nu^2)y = 0$.', '$x^2y\'\' + xy\' + (x^2 - \\nu^2)y = 0$.'), ''),
    term('Legendreova rovnice', 'Legendre’s equation', D('$(1 - x^2)y\'\' - 2xy\' + \\ell(\\ell+1)y = 0$.', '$(1 - x^2)y\'\' - 2xy\' + \\ell(\\ell+1)y = 0$.'), ''),
  ],
};
