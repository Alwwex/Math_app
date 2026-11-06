import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Funkce komplexní proměnné jsou nečekaně „tuhé": jedna derivace zaručí nekonečně mnoho a hodnoty uvnitř oblasti určí hranice. Vrcholem je reziduová věta – mocný nástroj na reálné integrály.',
    'Functions of a complex variable are surprisingly rigid: one derivative guarantees infinitely many, and boundary values fix the interior. The highlight is the residue theorem – a powerful tool for real integrals.'),
  steps: [
    step('24.1–24.2', D('Analytické funkce a Cauchyovy–Riemannovy podmínky', 'Analytic functions and the Cauchy–Riemann relations'), 'galaxy', [
      lead('Funkce $f(z) = u(x, y) + iv(x, y)$ je **analytická**, když má derivaci, která nezávisí na směru, ze kterého se k bodu blížíme.', 'A function $f(z) = u(x, y) + iv(x, y)$ is **analytic** if its derivative does not depend on the direction of approach.'),
      math('\\dfrac{\\partial u}{\\partial x} = \\dfrac{\\partial v}{\\partial y},\\qquad \\dfrac{\\partial u}{\\partial y} = -\\dfrac{\\partial v}{\\partial x}'),
      p('Důsledek: $u$ i $v$ splňují Laplaceovu rovnici – jsou **harmonické**. Proto se komplexní analýza tak hodí na 2D elektrostatiku a proudění.', 'Consequence: both $u$ and $v$ satisfy Laplace’s equation – they are **harmonic**. That is why complex analysis suits 2D electrostatics and flow.'),
      check(mcq(D('Která funkce NENÍ analytická?', 'Which function is NOT analytic?'), ['$z^*$', '$z^2$', '$e^z$', '$\\sin z$'], 0, D('$z^* = x - iy$: $u_x = 1 \\ne -1 = v_y$.', '$z^* = x - iy$: $u_x = 1 \\ne -1 = v_y$.'))),
    ]),
    step('24.3–24.5', D('Řady, elementární funkce a řezy', 'Series, elementary functions and branch cuts'), 'cyclone', [
      lead('Mocninná řada konverguje uvnitř kruhu – jeho poloměr je vzdálenost k nejbližší singularitě. Exponenciála, siny a kosiny jsou analytické všude.', 'A power series converges inside a disc whose radius is the distance to the nearest singularity. Exponential, sine and cosine are analytic everywhere.'),
      p('Funkce jako $\\sqrt z$ nebo $\\mathrm{Ln}\\,z$ jsou **mnohoznačné**: po oběhu kolem bodu $z = 0$ (bod větvení) se hodnota změní. Proto zavádíme **řez** – čáru, přes kterou se nesmí přejít.', 'Functions like $\\sqrt z$ or $\\mathrm{Ln}\\,z$ are **multivalued**: going once around $z = 0$ (a branch point) changes the value. So we introduce a **branch cut** that must not be crossed.'),
      widget('complexPlane', { mode: 'roots' }),
      check(tf(D('Po oběhu kolem počátku se $\\sqrt z$ změní na $-\\sqrt z$.', 'Going once around the origin turns $\\sqrt z$ into $-\\sqrt z$.'), true, D('Úhel $\\theta/2$ se zvětší o $\\pi$.', 'The angle $\\theta/2$ grows by $\\pi$.'))),
    ]),
    step('24.6–24.7', D('Singularity a konformní zobrazení', 'Singularities and conformal maps'), 'target', [
      list(D('**pól řádu $n$**: $f \\sim \\frac{c}{(z - z_0)^n}$, např. $1/z$,', '**pole of order $n$**: $f \\sim \\frac{c}{(z - z_0)^n}$, e.g. $1/z$,'), D('**podstatná singularita**: nekonečně mnoho záporných mocnin, např. $e^{1/z}$,', '**essential singularity**: infinitely many negative powers, e.g. $e^{1/z}$,'), D('**odstranitelná**: jen zdánlivá, např. $\\frac{\\sin z}{z}$ v nule.', '**removable**: only apparent, e.g. $\\frac{\\sin z}{z}$ at zero.')),
      p('Analytická funkce zachovává úhly – je **konformní**. Složité oblasti tak můžeme převést na jednoduché (polorovinu, kruh) a tam úlohu vyřešit.', 'An analytic function preserves angles – it is **conformal**. Complicated regions can be mapped to simple ones (a half-plane, a disc) and solved there.'),
      check(mcq(D('Funkce $\\frac{1}{z^2(z - 1)}$ má v $z = 0$…', '$\\frac{1}{z^2(z - 1)}$ has at $z = 0$…'), [D('pól 2. řádu', 'a pole of order 2'), D('pól 1. řádu', 'a simple pole'), D('podstatnou singularitu', 'an essential singularity'), D('nulový bod', 'a zero')], 0, D('Faktor $1/z^2$.', 'The factor $1/z^2$.'))),
    ]),
    step('24.8–24.10', D('Cauchyova věta a integrální vzorec', 'Cauchy’s theorem and integral formula'), 'link', [
      math('\\oint_C f(z)\\,dz = 0\\quad (f\\ \\text{analytická uvnitř } C),\\qquad f(z_0) = \\dfrac{1}{2\\pi i}\\oint_C \\dfrac{f(z)}{z - z_0}dz', '\\oint_C f(z)\\,dz = 0\\quad (f\\ \\text{analytic inside } C),\\qquad f(z_0) = \\dfrac{1}{2\\pi i}\\oint_C \\dfrac{f(z)}{z - z_0}dz'),
      p('Hodnoty na hranici určují hodnotu (i všechny derivace) uvnitř. Odtud Liouvilleova věta: omezená celistvá funkce je konstanta – a z ní základní věta algebry.', 'Boundary values determine the value (and all derivatives) inside. Hence Liouville: a bounded entire function is constant – and from it the fundamental theorem of algebra.'),
      example(D('Základní integrál', 'The basic integral'), D('Spočítej $\\oint_{|z|=1}\\frac{dz}{z}$.', 'Compute $\\oint_{|z|=1}\\frac{dz}{z}$.'),
        [D('$z = e^{i\\theta}$, $dz = ie^{i\\theta}d\\theta$.', '$z = e^{i\\theta}$, $dz = ie^{i\\theta}d\\theta$.'), D('$\\int_0^{2\\pi} i\\,d\\theta = 2\\pi i$.', '$\\int_0^{2\\pi} i\\,d\\theta = 2\\pi i$.')], '$2\\pi i$'),
      check(num(D('$\\oint_{|z|=2} z^3\\,dz = ?$', '$\\oint_{|z|=2} z^3\\,dz = ?$'), 0, D('$z^3$ je analytická → Cauchy.', '$z^3$ is analytic → Cauchy.'))),
    ]),
    step('24.11–24.13', D('Laurentovy řady a reziduová věta', 'Laurent series and the residue theorem'), 'sparkles', [
      lead('Kolem singularity rozvineme funkci do **Laurentovy řady** se zápornými mocninami. Koeficient $a_{-1}$ u $\\frac{1}{z - z_0}$ je **reziduum**.', 'Near a singularity, expand in a **Laurent series** with negative powers. The coefficient $a_{-1}$ of $\\frac{1}{z - z_0}$ is the **residue**.'),
      math('\\oint_C f(z)\\,dz = 2\\pi i\\sum \\operatorname{Res} f(z_k)'),
      example(D('Reálný integrál z komplexní roviny', 'A real integral via the complex plane'), D('Spočítej $\\int_{-\\infty}^{\\infty}\\frac{dx}{1 + x^2}$.', 'Compute $\\int_{-\\infty}^{\\infty}\\frac{dx}{1 + x^2}$.'),
        [D('Uzavři cestu velkým půlkruhem v horní polorovině (jeho příspěvek $\\to 0$).', 'Close with a large semicircle in the upper half-plane (its contribution $\\to 0$).'),
         D('Uvnitř je pól $z = i$; reziduum $\\frac{1}{2i}$.', 'Inside is the pole $z = i$; residue $\\frac{1}{2i}$.'),
         D('$2\\pi i\\cdot\\frac{1}{2i} = \\pi$.', '$2\\pi i\\cdot\\frac{1}{2i} = \\pi$.')], '$\\pi$'),
      tip('Reziduum v jednoduchém pólu: $\\operatorname{Res} = \\lim_{z\\to z_0}(z - z_0)f(z)$. Pro $f = g/h$ s $h(z_0) = 0$: $g(z_0)/h\'(z_0)$.', 'Residue at a simple pole: $\\operatorname{Res} = \\lim_{z\\to z_0}(z - z_0)f(z)$. For $f = g/h$ with $h(z_0) = 0$: $g(z_0)/h\'(z_0)$.'),
      check(mcq(D('Reziduum $\\frac{e^z}{z}$ v nule je…', 'The residue of $\\frac{e^z}{z}$ at zero is…'), ['$1$', '$0$', '$e$', '$2\\pi i$'], 0, D('$\\lim z\\cdot\\frac{e^z}{z} = 1$.', '$\\lim z\\cdot\\frac{e^z}{z} = 1$.'))),
    ]),
  ],
  quiz: [
    mcq(D('Cauchyovy–Riemannovy podmínky jsou…', 'The Cauchy–Riemann relations are…'), ['$u_x = v_y,\\ u_y = -v_x$', '$u_x = v_x,\\ u_y = v_y$', '$u_x = -v_y$', '$u = v$'], 0, D('Standardní tvar.', 'Standard form.')),
    tf(D('Reálná část analytické funkce splňuje Laplaceovu rovnici.', 'The real part of an analytic function satisfies Laplace’s equation.'), true, D('Je harmonická.', 'It is harmonic.')),
    num(D('$\\oint_{|z|=1}\\frac{dz}{z}$ děleno $\\pi i$?', '$\\oint_{|z|=1}\\frac{dz}{z}$ divided by $\\pi i$?'), 2, D('$2\\pi i$.', '$2\\pi i$.')),
    mcq(D('$e^{1/z}$ má v nule…', '$e^{1/z}$ has at zero…'), [D('podstatnou singularitu', 'an essential singularity'), D('pól 1. řádu', 'a simple pole'), D('odstranitelnou singularitu', 'a removable singularity'), D('nulový bod', 'a zero')], 0, D('Nekonečně mnoho záporných mocnin.', 'Infinitely many negative powers.')),
    num(D('$\\int_{-\\infty}^{\\infty}\\frac{dx}{1 + x^2}$ děleno $\\pi$?', '$\\int_{-\\infty}^{\\infty}\\frac{dx}{1 + x^2}$ divided by $\\pi$?'), 1, D('Reziduová věta, nebo $[\\arctan x]$.', 'Residue theorem, or $[\\arctan x]$.')),
    mcq(D('Konformní zobrazení zachovává…', 'A conformal map preserves…'), [D('úhly', 'angles'), D('délky', 'lengths'), D('plochy', 'areas'), D('vzdálenosti od počátku', 'distances from the origin')], 0, D('Definice konformity.', 'Definition of conformal.')),
    mcq(D('Poloměr konvergence řady $\\frac{1}{1 + z^2}$ kolem 0 je…', 'The radius of convergence of $\\frac{1}{1 + z^2}$ about 0 is…'), ['$1$', '$\\infty$', '$2$', '$0$'], 0, D('Nejbližší singularity $\\pm i$.', 'Nearest singularities at $\\pm i$.')),
  ],
  glossary: [
    term('analytická funkce', 'analytic function', D('Komplexně diferencovatelná v okolí bodu.', 'Complex differentiable in a neighbourhood.'), ''),
    term('Cauchyovy–Riemannovy podmínky', 'Cauchy–Riemann relations', D('$u_x = v_y$, $u_y = -v_x$.', '$u_x = v_y$, $u_y = -v_x$.'), ''),
    term('harmonická funkce', 'harmonic function', D('Řešení Laplaceovy rovnice.', 'A solution of Laplace’s equation.'), ''),
    term('bod větvení', 'branch point', D('Bod, jehož oběh mění hodnotu funkce.', 'A point around which the function changes value.'), ''),
    term('řez', 'branch cut', D('Čára oddělující větve mnohoznačné funkce.', 'A line separating branches of a multivalued function.'), ''),
    term('pól', 'pole', D('Singularita typu $1/(z - z_0)^n$.', 'A singularity like $1/(z - z_0)^n$.'), ''),
    term('reziduum', 'residue', D('Koeficient $a_{-1}$ Laurentovy řady.', 'The coefficient $a_{-1}$ of the Laurent series.'), '\\operatorname{Res}'),
    term('Laurentova řada', 'Laurent series', D('Řada se zápornými i kladnými mocninami.', 'A series with negative and positive powers.'), ''),
    term('konformní zobrazení', 'conformal transformation', D('Zobrazení zachovávající úhly.', 'An angle-preserving map.'), ''),
  ],
};
