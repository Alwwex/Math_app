import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Rovnice, ve kterých vystupuje jen první derivace. Naučíš se poznat typ rovnice a vybrat metodu: separace, integrační faktor, úplné rovnice, Bernoulli.',
    'Equations with only the first derivative. Learn to recognise the type and pick the method: separation, integrating factor, exact equations, Bernoulli.'),
  steps: [
    step('14.1', D('Obecné řešení', 'The general solution'), 'hourglass', [
      lead('**Řád** rovnice je nejvyšší derivace, **stupeň** je mocnina, ve které ta derivace vystupuje. Obecné řešení rovnice $n$-tého řádu má $n$ libovolných konstant.', 'The **order** is the highest derivative, the **degree** the power to which it appears. The general solution of an $n$th-order ODE has $n$ arbitrary constants.'),
      p('Geometricky: rovnice $y\' = f(x, y)$ předepisuje v každém bodě sklon. Řešení jsou křivky, které se těchto sklonů drží – klepni do pole a nakresli je:', 'Geometrically: $y\' = f(x, y)$ prescribes a slope at each point. Solutions are curves following these slopes – tap the field to draw them:'),
      widget('slopeField'),
      check(num(D('Kolik konstant má obecné řešení rovnice 1. řádu?', 'How many constants are in the general solution of a 1st-order ODE?'), 1, D('Jedna – určí ji počáteční podmínka.', 'One – fixed by the initial condition.'))),
    ]),
    step('14.2', D('Separace proměnných', 'Separable equations'), 'puzzle', [
      lead('Když jde rovnice zapsat jako $\\dfrac{dy}{dx} = f(x)\\,g(y)$, přeneseme všechno s $y$ na jednu stranu a integrujeme.', 'If the equation can be written $\\dfrac{dy}{dx} = f(x)\\,g(y)$, move everything with $y$ to one side and integrate.'),
      math('\\int\\dfrac{dy}{g(y)} = \\int f(x)\\,dx'),
      example(D('Logistický růst', 'Logistic growth'), D('Vyřeš $y\' = y(1 - y)$.', 'Solve $y\' = y(1 - y)$.'),
        [D('$\\int\\frac{dy}{y(1-y)} = \\int dx$; parciální zlomky $\\frac1y + \\frac{1}{1-y}$.', '$\\int\\frac{dy}{y(1-y)} = \\int dx$; partial fractions $\\frac1y + \\frac{1}{1-y}$.'),
         D('$\\ln\\frac{y}{1-y} = x + C$ → $y = \\dfrac{1}{1 + Ae^{-x}}$.', '$\\ln\\frac{y}{1-y} = x + C$ → $y = \\dfrac{1}{1 + Ae^{-x}}$.')], D('logistická křivka – roste a ustálí se na 1', 'the logistic curve – grows and levels off at 1')),
      widget('slopeField', { preset: 'logistic' }),
      check(mcq(D('Která rovnice je separovatelná?', 'Which equation is separable?'), ["$y' = xy^2$", "$y' = x + y$", "$y' = \\sin(xy)$", "$y' = x^2 + y^2$"], 0, D('$y\' = x\\cdot y^2$ je součin funkce $x$ a funkce $y$.', '$y\' = x\\cdot y^2$ is a product of a function of $x$ and of $y$.'))),
    ]),
    step('14.2', D('Lineární rovnice a integrační faktor', 'Linear equations and the integrating factor'), 'link', [
      math("\\dfrac{dy}{dx} + P(x)\\,y = Q(x),\\qquad \\mu(x) = e^{\\int P\\,dx}"),
      p('Vynásobením $\\mu$ se levá strana stane derivací součinu: $(\\mu y)\' = \\mu Q$. Stačí integrovat.', 'Multiplying by $\\mu$ turns the left side into a product derivative: $(\\mu y)\' = \\mu Q$. Just integrate.'),
      example(D('Integrační faktor', 'Integrating factor'), D("Vyřeš $y' + y = x$.", "Solve $y' + y = x$."),
        [D('$\\mu = e^x$, takže $(e^x y)\' = x e^x$.', '$\\mu = e^x$, so $(e^x y)\' = x e^x$.'), D('$e^x y = (x - 1)e^x + C$.', '$e^x y = (x - 1)e^x + C$.')], '$y = x - 1 + Ce^{-x}$'),
      tip('**Bernoulliho rovnice** $y\' + Py = Qy^n$ se substitucí $v = y^{1-n}$ změní na lineární. **Úplná rovnice** $A\\,dx + B\\,dy = 0$ s $A_y = B_x$ má řešení $U(x, y) = C$.', 'The **Bernoulli equation** $y\' + Py = Qy^n$ becomes linear with $v = y^{1-n}$. An **exact equation** $A\\,dx + B\\,dy = 0$ with $A_y = B_x$ has solution $U(x, y) = C$.'),
      check(mcq(D("Integrační faktor pro $y' + \\frac{2}{x}y = x$ je…", "The integrating factor for $y' + \\frac{2}{x}y = x$ is…"), ['$x^2$', '$e^{2x}$', '$2x$', '$1/x^2$'], 0, D('$e^{\\int 2/x\\,dx} = e^{2\\ln x} = x^2$.', '$e^{\\int 2/x\\,dx} = e^{2\\ln x} = x^2$.'))),
    ]),
    step('14.3', D('Rovnice vyššího stupně', 'Higher-degree equations'), 'gem', [
      lead('Když je derivace $p = y\'$ v mocnině vyšší než první, zkusíme rovnici vyřešit vzhledem k $p$, $x$ nebo $y$.', 'When the derivative $p = y\'$ appears to a higher power, try solving the equation for $p$, $x$ or $y$.'),
      def(D('Clairautova rovnice', 'Clairaut’s equation'), '$y = px + F(p)$. Obecné řešení jsou přímky $y = cx + F(c)$; navíc existuje **singulární řešení** – jejich obálka.', '$y = px + F(p)$. The general solution is the family of lines $y = cx + F(c)$; there is also a **singular solution** – their envelope.'),
      check(tf(D('Singulární řešení nelze dostat dosazením žádné hodnoty konstanty do obecného řešení.', 'A singular solution cannot be obtained by choosing a value of the constant in the general solution.'), true, D('Proto se mu říká singulární – je to obálka rodiny.', 'Hence “singular” – it is the envelope of the family.'))),
    ]),
  ],
  quiz: [
    mcq(D("Řešení $y' = ky$ je…", "The solution of $y' = ky$ is…"), ['$Ce^{kx}$', '$kx + C$', '$Ce^{-kx}$', '$C\\sin kx$'], 0, D('Separace: $\\ln y = kx + C$.', 'Separation: $\\ln y = kx + C$.')),
    num(D("$y' = 2x$, $y(0) = 1$. Kolik je $y(3)$?", "$y' = 2x$, $y(0) = 1$. What is $y(3)$?"), 10, D('$y = x^2 + 1$.', '$y = x^2 + 1$.')),
    mcq(D("Integrační faktor pro $y' - 3y = e^x$ je…", "The integrating factor for $y' - 3y = e^x$ is…"), ['$e^{-3x}$', '$e^{3x}$', '$e^x$', '$3x$'], 0, D('$P = -3$.', '$P = -3$.')),
    tf(D("Rovnice $y' = x + y$ je separovatelná.", "$y' = x + y$ is separable."), false, D('Je lineární, ne separovatelná.', 'It is linear, not separable.')),
    mcq(D('Bernoulliho rovnici převádí na lineární substituce…', 'The Bernoulli equation becomes linear via…'), ['$v = y^{1-n}$', '$v = y/x$', '$v = y\'$', '$v = \\ln y$'], 0, D('Standardní substituce.', 'The standard substitution.')),
    mcq(D('Řád rovnice $(y\')^3 + y = x$ je…', 'The order of $(y\')^3 + y = x$ is…'), ['1', '3', '2', '0'], 0, D('Nejvyšší derivace je první (stupeň je 3).', 'Highest derivative is first (degree 3).')),
    num(D('Logistická rovnice $y\' = y(1 - y)$: k jaké hodnotě jde $y$ pro $y(0) = 0{,}1$?', 'Logistic $y\' = y(1 - y)$: what does $y$ tend to for $y(0) = 0.1$?'), 1, D('Stabilní rovnováha $y = 1$.', 'Stable equilibrium $y = 1$.')),
  ],
  glossary: [
    term('obyčejná diferenciální rovnice', 'ordinary differential equation', D('Rovnice pro neznámou funkci jedné proměnné a její derivace.', 'An equation for a function of one variable and its derivatives.'), ''),
    term('řád rovnice', 'order', D('Nejvyšší derivace v rovnici.', 'The highest derivative present.'), ''),
    term('stupeň rovnice', 'degree', D('Mocnina nejvyšší derivace.', 'The power of the highest derivative.'), ''),
    term('separace proměnných', 'separation of variables', D('Rozdělení $x$ a $y$ na různé strany rovnice.', 'Putting $x$ and $y$ on different sides.'), ''),
    term('integrační faktor', 'integrating factor', D('Funkce, která udělá z levé strany derivaci součinu.', 'A factor turning the left side into a product derivative.'), '\\mu = e^{\\int P}'),
    term('počáteční podmínka', 'initial condition', D('Hodnota řešení v daném bodě.', 'The value of the solution at a given point.'), 'y(0) = y_0'),
    term('směrové pole', 'slope field', D('Předepsaný sklon v každém bodě.', 'Prescribed slope at every point.'), ''),
    term('singulární řešení', 'singular solution', D('Řešení mimo obecnou rodinu – obálka.', 'A solution outside the family – the envelope.'), ''),
  ],
};
