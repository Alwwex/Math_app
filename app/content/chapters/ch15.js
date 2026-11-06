import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Rovnice druhého a vyšších řádů – kmity, obvody, mechanika. Nejdřív s konstantními koeficienty (charakteristická rovnice), pak s proměnnými (Wronskián, variace konstant, Greenovy funkce).',
    'Second- and higher-order equations – oscillations, circuits, mechanics. First with constant coefficients (auxiliary equation), then variable ones (Wronskian, variation of parameters, Green’s functions).'),
  steps: [
    step('15.1', D('Konstantní koeficienty: charakteristická rovnice', 'Constant coefficients: the auxiliary equation'), 'bell', [
      lead('Pro $a y\'\' + b y\' + c y = 0$ zkusíme $y = e^{\\lambda x}$. Dostaneme **charakteristickou rovnici** $a\\lambda^2 + b\\lambda + c = 0$.', 'For $a y\'\' + b y\' + c y = 0$ try $y = e^{\\lambda x}$. This gives the **auxiliary equation** $a\\lambda^2 + b\\lambda + c = 0$.'),
      list(D('dva reálné kořeny: $y = Ae^{\\lambda_1x} + Be^{\\lambda_2x}$,', 'two real roots: $y = Ae^{\\lambda_1x} + Be^{\\lambda_2x}$,'),
        D('dvojnásobný kořen: $y = (A + Bx)e^{\\lambda x}$,', 'a repeated root: $y = (A + Bx)e^{\\lambda x}$,'),
        D('komplexní $\\alpha \\pm i\\beta$: $y = e^{\\alpha x}(A\\cos\\beta x + B\\sin\\beta x)$.', 'complex $\\alpha \\pm i\\beta$: $y = e^{\\alpha x}(A\\cos\\beta x + B\\sin\\beta x)$.')),
      p('Tlumený oscilátor $\\ddot x + 2\\gamma\\dot x + \\omega_0^2 x = 0$ ukazuje všechny tři případy. Měň tlumení:', 'The damped oscillator $\\ddot x + 2\\gamma\\dot x + \\omega_0^2 x = 0$ shows all three cases. Vary the damping:'),
      widget('paramPlot', {
        view: [0, 12, -1.1, 1.2], xlabel: 't', ylabel: 'x', params: [{ k: 'g', label: '\\gamma', min: 0, max: 2.5, value: .2, step: .01 }],
        curves: [{ f: (t, P) => { const w0 = 1, g = P.g; if (g < w0 - 1e-3) { const w = Math.sqrt(w0 * w0 - g * g); return Math.exp(-g * t) * (Math.cos(w * t) + g / w * Math.sin(w * t)); } if (g > w0 + 1e-3) { const r = Math.sqrt(g * g - w0 * w0), l1 = -g + r, l2 = -g - r; const A = -l2 / (l1 - l2), B = l1 / (l1 - l2); return A * Math.exp(l1 * t) + B * Math.exp(l2 * t); } return (1 + g * t) * Math.exp(-g * t); }, label: 'x(t)' },
          { f: (t, P) => Math.exp(-P.g * t), color: 'var(--ink-3)', dash: true, thin: true, show: P => P.g < 1 }],
        info: (P, T) => P.g < .999 ? `\\gamma < \\omega_0:\\ \\text{${T('podkritické – kmitá', 'underdamped – oscillates')}}` : P.g > 1.001 ? `\\gamma > \\omega_0:\\ \\text{${T('nadkritické – plíží se', 'overdamped – creeps back')}}` : `\\gamma = \\omega_0:\\ \\text{${T('kritické – nejrychlejší návrat', 'critical – fastest return')}}`,
      }),
      check(mcq(D("Obecné řešení $y'' + 4y = 0$ je…", "The general solution of $y'' + 4y = 0$ is…"), ['$A\\cos 2x + B\\sin 2x$', '$Ae^{2x} + Be^{-2x}$', '$(A + Bx)e^{2x}$', '$A\\cos 4x$'], 0, D('$\\lambda^2 + 4 = 0$ → $\\lambda = \\pm 2i$.', '$\\lambda^2 + 4 = 0$ → $\\lambda = \\pm 2i$.'))),
    ]),
    step('15.1', D('Partikulární řešení a rezonance', 'Particular integrals and resonance'), 'guitar', [
      lead('Řešení nehomogenní rovnice = obecné řešení homogenní (komplementární funkce) + jedno partikulární řešení.', 'Solution of the inhomogeneous equation = complementary function + one particular integral.'),
      p('Partikulární řešení odhadneme ve tvaru pravé strany: pro $e^{kx}$ zkus $Ce^{kx}$, pro $\\cos\\omega x$ zkus $C\\cos\\omega x + D\\sin\\omega x$, pro polynom polynom. Když je odhad už řešením homogenní rovnice, vynásob ho $x$.', 'Guess the particular integral in the form of the right-hand side: for $e^{kx}$ try $Ce^{kx}$, for $\\cos\\omega x$ try $C\\cos\\omega x + D\\sin\\omega x$, for a polynomial a polynomial. If the guess already solves the homogeneous equation, multiply by $x$.'),
      widget('paramPlot', {
        view: [.2, 2, 0, 6], xlabel: '\\omega', ylabel: 'A', params: [{ k: 'g', label: '\\gamma', min: .05, max: 1, value: .15, step: .01 }],
        curves: [{ f: (w, P) => 1 / Math.sqrt((1 - w * w) ** 2 + 4 * P.g * P.g * w * w), label: 'A(\\omega)' }],
        info: (P, T) => `\\text{${T('rezonance u', 'resonance at')}}\\ \\omega \\approx \\omega_0\nA_{\\max} \\approx \\dfrac{1}{2\\gamma} = ${(1 / (2 * P.g)).toFixed(1)}`,
      }),
      phys('Rezonance: buzení na vlastní frekvenci tlumeného oscilátoru dává obří amplitudu – proto vojáci nepochodují po mostě v kroku.', 'Resonance: driving near the natural frequency gives a huge amplitude – that is why soldiers break step on bridges.'),
      check(mcq(D("Odhad partikulárního řešení pro $y'' - y = e^{x}$:", "Trial particular integral for $y'' - y = e^{x}$:"), ['$Cxe^x$', '$Ce^x$', '$Ce^{-x}$', '$C$'], 0, D('$e^x$ už řeší homogenní rovnici, proto násobíme $x$.', '$e^x$ already solves the homogeneous equation, so multiply by $x$.'))),
    ]),
    step('15.2', D('Proměnné koeficienty', 'Variable coefficients'), 'link', [
      lead('U rovnic s proměnnými koeficienty obecný recept není. Pomohou ale tyto nástroje:', 'There is no general recipe for variable coefficients, but these tools help:'),
      list(D('**Eulerova (Legendreova) rovnice** $x^2y\'\' + bxy\' + cy = 0$ – zkus $y = x^m$,', '**Euler (Legendre) equation** $x^2y\'\' + bxy\' + cy = 0$ – try $y = x^m$,'),
        D('**Wronskián** $W = y_1y_2\' - y_1\'y_2 \\ne 0$ ověří nezávislost řešení,', 'the **Wronskian** $W = y_1y_2\' - y_1\'y_2 \\ne 0$ checks independence,'),
        D('**variace konstant** – známe-li homogenní řešení, najdeme partikulární,', '**variation of parameters** – from homogeneous solutions to a particular one,'),
        D('**Greenova funkce** – odezva na jednotkový impuls $\\delta(x - z)$, řešení pak je $y = \\int G(x, z)f(z)\\,dz$.', 'the **Green’s function** – response to a unit impulse $\\delta(x - z)$; then $y = \\int G(x, z)f(z)\\,dz$.')),
      example(D('Eulerova rovnice', 'Euler equation'), D("Vyřeš $x^2y'' - 2y = 0$.", "Solve $x^2y'' - 2y = 0$."),
        [D('$y = x^m$: $m(m-1) - 2 = 0$ → $m = 2$ nebo $-1$.', '$y = x^m$: $m(m-1) - 2 = 0$ → $m = 2$ or $-1$.')], '$y = Ax^2 + Bx^{-1}$'),
      check(num(D('Wronskián $\\cos x$ a $\\sin x$?', 'Wronskian of $\\cos x$ and $\\sin x$?'), 1, D('$\\cos^2 x + \\sin^2 x = 1$.', '$\\cos^2 x + \\sin^2 x = 1$.'))),
    ]),
    step('15.3', D('Obecné rovnice vyššího řádu', 'General higher-order equations'), 'gem', [
      lead('Některé nelineární rovnice snížíme o řád substitucí.', 'Some non-linear equations can be reduced in order by substitution.'),
      list(D('chybí $y$: polož $p = y\'$,', '$y$ absent: set $p = y\'$,'), D('chybí $x$: polož $p = y\'$ a $y\'\' = p\\,dp/dy$,', '$x$ absent: set $p = y\'$ and $y\'\' = p\\,dp/dy$,'), D('rovnice je úplná derivace – integruj jednou.', 'the equation is an exact derivative – integrate once.')),
      phys('Rovnice kyvadla $\\ddot\\theta + \\omega^2\\sin\\theta = 0$ nemá $t$ – substituce $p = \\dot\\theta$ dá zákon zachování energie.', 'The pendulum $\\ddot\\theta + \\omega^2\\sin\\theta = 0$ lacks $t$ – substituting $p = \\dot\\theta$ yields energy conservation.'),
      check(tf(D("V rovnici $y'' = f(x, y')$ pomůže substituce $p = y'$.", "For $y'' = f(x, y')$ the substitution $p = y'$ helps."), true, D('Dostaneme rovnici prvního řádu pro $p$.', 'We get a first-order equation for $p$.'))),
    ]),
  ],
  quiz: [
    mcq(D("Charakteristická rovnice $y'' - 3y' + 2y = 0$ má kořeny…", "The auxiliary equation of $y'' - 3y' + 2y = 0$ has roots…"), ['$1, 2$', '$-1, -2$', '$\\pm i$', '$3, 2$'], 0, D('$\\lambda^2 - 3\\lambda + 2 = (\\lambda - 1)(\\lambda - 2)$.', '$\\lambda^2 - 3\\lambda + 2 = (\\lambda - 1)(\\lambda - 2)$.')),
    mcq(D("Řešení $y'' + 2y' + y = 0$ je…", "The solution of $y'' + 2y' + y = 0$ is…"), ['$(A + Bx)e^{-x}$', '$Ae^{-x} + Be^{x}$', '$A\\cos x + B\\sin x$', '$Ae^{-2x}$'], 0, D('Dvojnásobný kořen $-1$.', 'Double root $-1$.')),
    tf(D('Kriticky tlumený oscilátor se vrací do rovnováhy nejrychleji bez překmitu.', 'A critically damped oscillator returns to equilibrium fastest without overshoot.'), true, D('Proto se tak ladí tlumiče aut.', 'That is how car shock absorbers are tuned.')),
    mcq(D('Řešení nehomogenní lineární rovnice je…', 'The solution of an inhomogeneous linear equation is…'), [D('komplementární funkce + partikulární řešení', 'complementary function + particular integral'), D('jen partikulární řešení', 'only the particular integral'), D('součin obou', 'the product of both'), D('nula', 'zero')], 0, D('Princip superpozice.', 'Superposition.')),
    num(D("Eulerova rovnice $x^2y'' + xy' - 4y = 0$: kladný exponent $m$?", "Euler equation $x^2y'' + xy' - 4y = 0$: the positive exponent $m$?"), 2, D('$m(m-1) + m - 4 = m^2 - 4 = 0$.', '$m(m-1) + m - 4 = m^2 - 4 = 0$.')),
    mcq(D('Greenova funkce je odezva soustavy na…', 'A Green’s function is the response to…'), [D('jednotkový impuls (delta funkci)', 'a unit impulse (delta function)'), D('konstantní sílu', 'a constant force'), D('nulovou sílu', 'zero force'), D('sinusovou sílu', 'a sinusoidal force')], 0, D('$LG = \\delta(x - z)$.', '$LG = \\delta(x - z)$.')),
    mcq(D('Wronskián dvou lineárně závislých řešení je…', 'The Wronskian of two linearly dependent solutions is…'), ['$0$', '$1$', D('kladný', 'positive'), D('nekonečný', 'infinite')], 0, D('Nenulový Wronskián = nezávislost.', 'Non-zero Wronskian = independence.')),
  ],
  glossary: [
    term('charakteristická rovnice', 'auxiliary equation', D('Algebraická rovnice pro $\\lambda$ z $y = e^{\\lambda x}$.', 'Algebraic equation for $\\lambda$ from $y = e^{\\lambda x}$.'), ''),
    term('komplementární funkce', 'complementary function', D('Obecné řešení homogenní rovnice.', 'General solution of the homogeneous equation.'), ''),
    term('partikulární řešení', 'particular integral', D('Jakékoli jedno řešení nehomogenní rovnice.', 'Any one solution of the inhomogeneous equation.'), ''),
    term('tlumení', 'damping', D('Člen úměrný rychlosti, který odebírá energii.', 'A velocity term that removes energy.'), '2\\gamma\\dot x'),
    term('rezonance', 'resonance', D('Velká odezva při buzení blízko vlastní frekvence.', 'Large response near the natural frequency.'), ''),
    term('Wronskián', 'Wronskian', D('Determinant řešení a jejich derivací.', 'Determinant of solutions and their derivatives.'), 'W'),
    term('variace konstant', 'variation of parameters', D('Metoda hledání partikulárního řešení.', 'A method for finding a particular integral.'), ''),
    term('Greenova funkce', 'Green’s function', D('Odezva na bodový zdroj.', 'Response to a point source.'), 'G(x, z)'),
  ],
};
