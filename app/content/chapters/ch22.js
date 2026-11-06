import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Místo bodu, kde je funkce nejmenší, hledáme celou **křivku**, pro kterou je nějaký integrál nejmenší: nejkratší cestu, nejrychlejší skluzavku, tvar řetězu. Odtud Lagrangeova mechanika.',
    'Instead of the point minimising a function, find the whole **curve** minimising an integral: the shortest path, the fastest slide, the shape of a hanging chain. Hence Lagrangian mechanics.'),
  steps: [
    step('22.1', D('Eulerova–Lagrangeova rovnice', 'The Euler–Lagrange equation'), 'coaster', [
      lead('Hledáme $y(x)$, pro které je **funkcionál** $I = \\int_a^b F(y, y\', x)\\,dx$ stacionární (malá změna křivky nezmění $I$ v prvním řádu).', 'We seek $y(x)$ for which the **functional** $I = \\int_a^b F(y, y\', x)\\,dx$ is stationary (small changes of the curve do not change $I$ to first order).'),
      math('\\dfrac{d}{dx}\\left(\\dfrac{\\partial F}{\\partial y\'}\\right) - \\dfrac{\\partial F}{\\partial y} = 0'),
      example(D('Nejkratší spojnice', 'Shortest path'), D('Najdi nejkratší křivku mezi dvěma body v rovině.', 'Find the shortest curve between two points in the plane.'),
        [D('Délka $I = \\int\\sqrt{1 + y\'^2}\\,dx$, tedy $F$ nezávisí na $y$.', 'Length $I = \\int\\sqrt{1 + y\'^2}\\,dx$, so $F$ does not depend on $y$.'), D('Pak $\\partial F/\\partial y\' = \\frac{y\'}{\\sqrt{1 + y\'^2}} = $ konst. → $y\' = $ konst.', 'Then $\\partial F/\\partial y\' = \\frac{y\'}{\\sqrt{1 + y\'^2}} = $ const → $y\' = $ const.')], D('přímka – jak jinak', 'a straight line – of course')),
      check(mcq(D('Když $F$ nezávisí na $y$, pak je konstantní…', 'If $F$ does not depend on $y$, then constant is…'), ['$\\partial F/\\partial y\'$', '$F$', '$y$', '$y\'\'$'], 0, D('E–L rovnice se zredukuje na $\\frac{d}{dx}F_{y\'} = 0$.', 'E–L reduces to $\\frac{d}{dx}F_{y\'} = 0$.'))),
    ]),
    step('22.2', D('Speciální případy a brachistochrona', 'Special cases and the brachistochrone'), 'coaster', [
      lead('Když $F$ nezávisí na $x$, platí **Beltramiho identita** $F - y\'\\dfrac{\\partial F}{\\partial y\'} = $ konst. To stačí na slavnou úlohu o brachistochroně.', 'If $F$ does not depend on $x$, the **Beltrami identity** $F - y\'\\dfrac{\\partial F}{\\partial y\'} = $ const holds. Enough for the famous brachistochrone.'),
      p('Po jaké křivce sjede kulička z $A$ do $B$ nejrychleji? Čas je $T = \\int \\frac{\\sqrt{1 + y\'^2}}{\\sqrt{2gy}}dx$. Řešením je **cykloida** – křivka, kterou opisuje bod na kutálejícím se kole. Pusť závod:', 'Along which curve does a bead slide from $A$ to $B$ fastest? The time is $T = \\int \\frac{\\sqrt{1 + y\'^2}}{\\sqrt{2gy}}dx$. The answer is a **cycloid** – traced by a point on a rolling wheel. Start the race:'),
      widget('brachistochrone'),
      check(tf(D('Nejrychlejší dráha je zároveň nejkratší.', 'The fastest path is also the shortest.'), false, D('Přímka je nejkratší, ale cykloida rychlejší – na začátku víc zrychlí.', 'The line is shortest but the cycloid is faster – it accelerates more early on.'))),
    ]),
    step('22.3–22.4', D('Rozšíření a vazby', 'Extensions and constraints'), 'link', [
      lead('Pro více funkcí dostaneme jednu E–L rovnici pro každou. Vazbu ve tvaru integrálu $J = \\int G\\,dx = $ konst. zahrneme Lagrangeovým multiplikátorem: variujeme $F - \\lambda G$.', 'With several functions we get one E–L equation each. An integral constraint $J = \\int G\\,dx = $ const is handled with a Lagrange multiplier: vary $F - \\lambda G$.'),
      list(D('**řetězovka** – visící řetěz minimalizuje potenciální energii při pevné délce: $y = a\\cosh(x/a)$,', '**catenary** – a hanging chain minimises potential energy at fixed length: $y = a\\cosh(x/a)$,'),
        D('**izoperimetrická úloha** – největší plochu při daném obvodu má kružnice.', '**isoperimetric problem** – the largest area for a given perimeter is a circle.')),
      check(mcq(D('Tvar visícího řetězu je…', 'The shape of a hanging chain is…'), [D('řetězovka $\\cosh$', 'a catenary $\\cosh$'), D('parabola', 'a parabola'), D('kružnice', 'a circle'), D('cykloida', 'a cycloid')], 0, D('$y = a\\cosh(x/a)$.', '$y = a\\cosh(x/a)$.'))),
    ]),
    step('22.5', D('Fyzikální variační principy', 'Physical variational principles'), 'atom', [
      lead('Příroda „optimalizuje". Světlo jde po dráze nejkratšího času (**Fermatův princip**) – odtud Snellův zákon lomu. Mechanika plyne z **Hamiltonova principu**.', 'Nature optimises. Light follows the path of least time (**Fermat’s principle**) – hence Snell’s law. Mechanics follows from **Hamilton’s principle**.'),
      math('S = \\int (T - V)\\,dt\\ \\text{stacionární}\\quad\\Rightarrow\\quad \\dfrac{d}{dt}\\dfrac{\\partial L}{\\partial\\dot q} - \\dfrac{\\partial L}{\\partial q} = 0', 'S = \\int (T - V)\\,dt\\ \\text{stationary}\\quad\\Rightarrow\\quad \\dfrac{d}{dt}\\dfrac{\\partial L}{\\partial\\dot q} - \\dfrac{\\partial L}{\\partial q} = 0'),
      example(D('Newton z Lagrange', 'Newton from Lagrange'), D('Odvoď pohybovou rovnici pro $L = \\frac12m\\dot x^2 - V(x)$.', 'Derive the equation of motion for $L = \\frac12m\\dot x^2 - V(x)$.'),
        [D('$\\partial L/\\partial\\dot x = m\\dot x$, $\\partial L/\\partial x = -V\'$.', '$\\partial L/\\partial\\dot x = m\\dot x$, $\\partial L/\\partial x = -V\'$.')], '$m\\ddot x = -V\'(x)$'),
      check(mcq(D('Lagrangeova funkce je…', 'The Lagrangian is…'), ['$T - V$', '$T + V$', '$TV$', '$V - T$'], 0, D('Kinetická minus potenciální.', 'Kinetic minus potential.'))),
    ]),
    step('22.6–22.8', D('Odhad vlastních čísel', 'Estimating eigenvalues'), 'target', [
      lead('Vlastní čísla Sturmovy–Liouvilleovy úlohy jsou stacionární hodnoty Rayleighova podílu. Dosadíme rozumnou zkušební funkci s parametrem a minimalizujeme – dostaneme horní odhad nejnižšího vlastního čísla.', 'Sturm–Liouville eigenvalues are stationary values of the Rayleigh quotient. Insert a sensible trial function with a parameter and minimise – this gives an upper bound on the lowest eigenvalue.'),
      math('\\lambda_0 \\le \\dfrac{\\int (p\\,y\'^2 - q\\,y^2)\\,dx}{\\int \\rho\\,y^2\\,dx}'),
      phys('Variační metoda v kvantové mechanice: zkušební vlnová funkce dá horní odhad energie základního stavu – tak se počítá třeba atom helia.', 'The variational method in QM: a trial wavefunction gives an upper bound on the ground-state energy – used e.g. for helium.'),
      check(num(D('Zkušební funkce $y = x(1 - x)$ pro $-y\'\' = \\lambda y$, $y(0) = y(1) = 0$ dá $\\lambda \\approx$? (přesně $\\pi^2 \\approx 9{,}87$)', 'Trial $y = x(1 - x)$ for $-y\'\' = \\lambda y$, $y(0) = y(1) = 0$ gives $\\lambda \\approx$? (exact $\\pi^2 \\approx 9.87$)'), 10, D('$\\int y\'^2 = \\frac13$, $\\int y^2 = \\frac{1}{30}$ → $10$. Chyba jen 1,3 %.', '$\\int y\'^2 = \\frac13$, $\\int y^2 = \\frac{1}{30}$ → $10$. Only 1.3 % off.'), { tol: .05 })),
    ]),
  ],
  quiz: [
    mcq(D('Řešením úlohy o brachistochroně je…', 'The brachistochrone is…'), [D('cykloida', 'a cycloid'), D('přímka', 'a straight line'), D('parabola', 'a parabola'), D('kružnice', 'a circle')], 0, D('Johann Bernoulli, 1696.', 'Johann Bernoulli, 1696.')),
    tf(D('Eulerova–Lagrangeova rovnice je podmínka stacionarity funkcionálu.', 'The Euler–Lagrange equation is the stationarity condition of a functional.'), true, D('Analog $f\'(x) = 0$.', 'The analogue of $f\'(x) = 0$.')),
    mcq(D('Fermatův princip říká, že světlo jde po dráze…', 'Fermat’s principle says light takes the path of…'), [D('nejkratšího (stacionárního) času', 'least (stationary) time'), D('nejkratší délky', 'shortest length'), D('nejvyšší rychlosti', 'highest speed'), D('nejmenší energie', 'least energy')], 0, D('Odtud zákon lomu.', 'Hence Snell’s law.')),
    mcq(D('Pro $F = y\'^2$ je E–L rovnice…', 'For $F = y\'^2$ the E–L equation is…'), ["$y'' = 0$", "$y' = 0$", "$y = 0$", "$y'' = y$"], 0, D('$\\frac{d}{dx}(2y\') = 0$.', '$\\frac{d}{dx}(2y\') = 0$.')),
    mcq(D('Největší plochu při daném obvodu uzavírá…', 'The largest area for a given perimeter is enclosed by…'), [D('kružnice', 'a circle'), D('čtverec', 'a square'), D('rovnostranný trojúhelník', 'an equilateral triangle'), D('elipsa', 'an ellipse')], 0, D('Izoperimetrická úloha.', 'The isoperimetric problem.')),
    tf(D('Rayleighova–Ritzova metoda dává dolní odhad nejnižšího vlastního čísla.', 'Rayleigh–Ritz gives a lower bound on the lowest eigenvalue.'), false, D('Horní odhad.', 'An upper bound.')),
  ],
  glossary: [
    term('funkcionál', 'functional', D('Zobrazení, které funkci přiřadí číslo (integrál).', 'A map from functions to numbers (an integral).'), 'I[y]'),
    term('Eulerova–Lagrangeova rovnice', 'Euler–Lagrange equation', D('Podmínka stacionarity funkcionálu.', 'Stationarity condition of a functional.'), ''),
    term('brachistochrona', 'brachistochrone', D('Křivka nejrychlejšího sklouznutí – cykloida.', 'The curve of fastest descent – a cycloid.'), ''),
    term('řetězovka', 'catenary', D('Tvar visícího řetězu $y = a\\cosh(x/a)$.', 'Shape of a hanging chain $y = a\\cosh(x/a)$.'), ''),
    term('Hamiltonův princip', 'Hamilton’s principle', D('Akce $\\int (T - V)dt$ je stacionární.', 'The action $\\int (T - V)dt$ is stationary.'), ''),
    term('Lagrangeova funkce', 'Lagrangian', D('$L = T - V$.', '$L = T - V$.'), 'L'),
    term('izoperimetrická úloha', 'isoperimetric problem', D('Extrém s vazbou na délku/obvod.', 'An extremum with a length constraint.'), ''),
    term('zkušební funkce', 'trial function', D('Odhad tvaru řešení ve variační metodě.', 'A guessed solution in the variational method.'), ''),
  ],
};
