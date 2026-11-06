import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Když analytické řešení neexistuje, počítá počítač. Kapitola ukazuje hledání kořenů, soustavy rovnic, numerickou integraci a řešení diferenciálních rovnic – a jak odhadnout chybu.',
    'When no analytic solution exists, the computer takes over: root finding, linear systems, numerical integration and differential equations – and how to estimate the error.'),
  steps: [
    step('27.1–27.2', D('Kořeny rovnic', 'Roots of equations'), 'laptop', [
      lead('**Půlení intervalu** je pomalé, ale jisté. **Newtonova–Raphsonova metoda** je rychlá: každý krok jde po tečně k ose $x$.', '**Bisection** is slow but safe. **Newton–Raphson** is fast: each step follows the tangent to the $x$-axis.'),
      widget('newton'),
      p('**Řád konvergence**: chyba v dalším kroku $\\epsilon_{n+1} \\approx C\\epsilon_n^p$. Půlení má $p = 1$ (chyba se jen půlí), Newton $p = 2$ – počet platných číslic se zdvojnásobí.', '**Order of convergence**: $\\epsilon_{n+1} \\approx C\\epsilon_n^p$. Bisection has $p = 1$ (the error halves), Newton $p = 2$ – correct digits double.'),
      warn('Newton může selhat, když je derivace blízko nuly nebo start leží daleko od kořene – iterace pak „uletí".', 'Newton can fail when the derivative is near zero or the start is far away – the iteration then shoots off.'),
      check(mcq(D('Newtonova iterace je…', 'The Newton iteration is…'), ["$x_{n+1} = x_n - f(x_n)/f'(x_n)$", "$x_{n+1} = (x_n + f(x_n))/2$", "$x_{n+1} = f(x_n)$", "$x_{n+1} = x_n f'(x_n)$"], 0, D('Průsečík tečny s osou.', 'Where the tangent meets the axis.'))),
    ]),
    step('27.3', D('Soustavy lineárních rovnic', 'Simultaneous linear equations'), 'numbers', [
      lead('**Gaussova eliminace** převede matici na trojúhelníkovou a pak dosazuje zpětně. Pro stabilitu se vybírá největší prvek jako pivot.', '**Gaussian elimination** reduces the matrix to triangular form and back-substitutes. For stability the largest element is chosen as pivot.'),
      p('Pro velké řídké soustavy jsou lepší **iterační metody**: Jacobiho nebo Gaussova–Seidelova. Konvergují například u diagonálně dominantních matic.', 'For large sparse systems **iterative methods** are better: Jacobi or Gauss–Seidel. They converge e.g. for diagonally dominant matrices.'),
      check(tf(D('Gaussova–Seidelova metoda vždy konverguje.', 'Gauss–Seidel always converges.'), false, D('Jen za určitých podmínek (např. diagonální dominance).', 'Only under conditions such as diagonal dominance.'))),
    ]),
    step('27.4', D('Numerická integrace', 'Numerical integration'), 'chart', [
      lead('Lichoběžníkové pravidlo nahrazuje funkci úsečkami, Simpsonovo parabolami. Chyba Simpsona klesá s krokem jako $h^4$.', 'The trapezium rule replaces the function by segments, Simpson by parabolas. Simpson’s error falls like $h^4$.'),
      widget('riemann', { method: 'simp' }),
      math('\\int_a^b f\\,dx \\approx \\dfrac h3\\left[f_0 + 4f_1 + 2f_2 + 4f_3 + \\dots + f_N\\right]'),
      tip('**Gaussova kvadratura** volí i body, ve kterých se funkce vyhodnotí – s $n$ body přesně integruje polynomy stupně $2n - 1$. Ve vysokých dimenzích vítězí **Monte Carlo**.', '**Gaussian quadrature** also chooses the sample points – $n$ points integrate polynomials of degree $2n - 1$ exactly. In high dimensions **Monte Carlo** wins.'),
      check(mcq(D('Když zmenšíš krok na polovinu, chyba Simpsonova pravidla klesne asi…', 'Halving the step reduces Simpson’s error by about…'), ['16×', '2×', '4×', '8×'], 0, D('$h^4$: $2^4 = 16$.', '$h^4$: $2^4 = 16$.'))),
    ]),
    step('27.5–27.7', D('Diferenciální rovnice', 'Differential equations'), 'hourglass', [
      lead('**Eulerova metoda** $y_{n+1} = y_n + hf(x_n, y_n)$ je nejjednodušší, ale nepřesná. **Runge–Kutta 4. řádu** vyhodnotí sklon čtyřikrát a chyba klesá jako $h^4$.', '**Euler’s method** $y_{n+1} = y_n + hf(x_n, y_n)$ is simplest but crude. **4th-order Runge–Kutta** samples the slope four times and its error falls like $h^4$.'),
      widget('slopeField', { preset: 'riccati' }),
      p('Rovnice vyššího řádu převedeme na soustavu rovnic prvního řádu: $y\'\' = f$ se stane dvojicí $y\' = v$, $v\' = f$.', 'Higher-order equations are rewritten as first-order systems: $y\'\' = f$ becomes $y\' = v$, $v\' = f$.'),
      check(mcq(D('Řád přesnosti Eulerovy metody je…', 'The order of accuracy of Euler’s method is…'), ['1', '2', '4', '0'], 0, D('Globální chyba $\\propto h$.', 'Global error $\\propto h$.'))),
    ]),
    step('27.8', D('Parciální diferenciální rovnice', 'Partial differential equations'), 'fire', [
      lead('Prostor i čas rozdělíme na mřížku a derivace nahradíme diferencemi, např. $u_{xx} \\approx \\frac{u_{i+1} - 2u_i + u_{i-1}}{h^2}$.', 'Space and time are put on a grid and derivatives replaced by differences, e.g. $u_{xx} \\approx \\frac{u_{i+1} - 2u_i + u_{i-1}}{h^2}$.'),
      warn('Explicitní schéma pro difuzi je stabilní jen pro $\\kappa\\,\\Delta t/h^2 \\le \\frac12$. Jinak chyby exponenciálně narostou.', 'The explicit diffusion scheme is stable only for $\\kappa\\,\\Delta t/h^2 \\le \\frac12$. Otherwise errors grow exponentially.'),
      check(tf(D('Zmenšení prostorového kroku $h$ v explicitním schématu vyžaduje i menší časový krok.', 'Reducing the spatial step $h$ in the explicit scheme also requires a smaller time step.'), true, D('$\\Delta t \\le h^2/2\\kappa$.', '$\\Delta t \\le h^2/2\\kappa$.'))),
    ]),
  ],
  quiz: [
    mcq(D('Newtonova metoda konverguje (blízko jednoduchého kořene)…', 'Near a simple root Newton’s method converges…'), [D('kvadraticky', 'quadratically'), D('lineárně', 'linearly'), D('vůbec', 'not at all'), D('kubicky', 'cubically')], 0, D('$p = 2$.', '$p = 2$.')),
    num(D('Kolik kroků půlení zmenší interval délky 1 pod $10^{-3}$?', 'How many bisection steps shrink an interval of length 1 below $10^{-3}$?'), 10, D('$2^{10} = 1024$.', '$2^{10} = 1024$.')),
    mcq(D('Simpsonovo pravidlo je přesné pro polynomy stupně až…', 'Simpson’s rule is exact for polynomials up to degree…'), ['3', '2', '1', '4'], 0, D('Překvapivě i pro kubiky.', 'Surprisingly even cubics.')),
    mcq(D('RK4 vyhodnotí v jednom kroku sklon…', 'RK4 evaluates the slope per step…'), ['4×', '1×', '2×', '8×'], 0, D('$k_1, \\dots, k_4$.', '$k_1, \\dots, k_4$.')),
    tf(D('Monte Carlo integrace se hodí hlavně pro mnoho dimenzí.', 'Monte Carlo integration is mainly useful in many dimensions.'), true, D('Chyba $\\propto 1/\\sqrt N$ nezávisle na dimenzi.', 'Error $\\propto 1/\\sqrt N$ regardless of dimension.')),
    mcq(D('Druhá diference $\\frac{u_{i+1} - 2u_i + u_{i-1}}{h^2}$ aproximuje…', 'The second difference $\\frac{u_{i+1} - 2u_i + u_{i-1}}{h^2}$ approximates…'), ["$u''$", "$u'$", '$u$', '$\\int u$'], 0, D('Centrální diference.', 'Central difference.')),
  ],
  glossary: [
    term('Newtonova–Raphsonova metoda', 'Newton–Raphson method', D('Iterace po tečnách ke kořeni.', 'Iterating along tangents to a root.'), ''),
    term('metoda půlení intervalu', 'bisection', D('Opakované půlení intervalu se změnou znaménka.', 'Repeatedly halving an interval with a sign change.'), ''),
    term('řád konvergence', 'order of convergence', D('Exponent $p$ v $\\epsilon_{n+1} \\approx C\\epsilon_n^p$.', 'The exponent $p$ in $\\epsilon_{n+1} \\approx C\\epsilon_n^p$.'), ''),
    term('Gaussova eliminace', 'Gaussian elimination', D('Převod soustavy na trojúhelníkový tvar.', 'Reducing a system to triangular form.'), ''),
    term('Simpsonovo pravidlo', 'Simpson’s rule', D('Integrace pomocí parabol.', 'Integration using parabolas.'), ''),
    term('Runge–Kutta', 'Runge–Kutta', D('Rodina přesných metod pro ODR.', 'A family of accurate ODE solvers.'), ''),
    term('konečné diference', 'finite differences', D('Náhrada derivací rozdíly na mřížce.', 'Replacing derivatives with grid differences.'), ''),
    term('stabilita', 'stability', D('Chyby během výpočtu nenarůstají.', 'Errors do not grow during the computation.'), ''),
  ],
};
