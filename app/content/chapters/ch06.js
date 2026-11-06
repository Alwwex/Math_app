import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Dvojné a trojné integrály sčítají přes plochy a objemy: hmotnost, těžiště, moment setrvačnosti. Klíčem je chytrá volba souřadnic a Jacobián.',
    'Double and triple integrals add up over areas and volumes: mass, centre of mass, moment of inertia. The key is a clever choice of coordinates and the Jacobian.'),
  steps: [
    step('6.1–6.2', D('Dvojné a trojné integrály', 'Double and triple integrals'), 'package', [
      lead('Dvojný integrál $\\iint_R f\\,dx\\,dy$ počítáme jako dva obyčejné integrály za sebou. Nejtěžší bývá správně zapsat meze.',
        'A double integral $\\iint_R f\\,dx\\,dy$ is computed as two ordinary integrals in turn. The hard part is usually the limits.'),
      example(D('Integrál přes trojúhelník', 'Integral over a triangle'), D('Spočítej $\\iint_R xy\\,dA$ pro trojúhelník $x \\ge 0$, $y \\ge 0$, $x + y \\le 1$.', 'Compute $\\iint_R xy\\,dA$ over the triangle $x \\ge 0$, $y \\ge 0$, $x + y \\le 1$.'),
        [D('Pro pevné $x$ jde $y$ od $0$ do $1 - x$: $\\int_0^{1-x} xy\\,dy = \\frac{x(1-x)^2}{2}$.', 'For fixed $x$, $y$ runs from $0$ to $1 - x$: $\\int_0^{1-x} xy\\,dy = \\frac{x(1-x)^2}{2}$.'),
         D('$\\int_0^1 \\frac{x(1-x)^2}{2}\\,dx = \\frac12\\left(\\frac12 - \\frac23 + \\frac14\\right) = \\frac{1}{24}$.', '$\\int_0^1 \\frac{x(1-x)^2}{2}\\,dx = \\frac12\\left(\\frac12 - \\frac23 + \\frac14\\right) = \\frac{1}{24}$.')], '$\\tfrac{1}{24}$'),
      tip('Pořadí integrace jde prohodit (Fubini). Někdy je jedno pořadí mnohem jednodušší než druhé.', 'The order of integration can be swapped (Fubini). Sometimes one order is far easier than the other.'),
      check(num(D('$\\int_0^1\\int_0^2 xy\\,dx\\,dy = ?$', '$\\int_0^1\\int_0^2 xy\\,dx\\,dy = ?$'), 1, D('$\\int_0^2 x\\,dx = 2$, $\\int_0^1 y\\,dy = \\frac12$ → $1$.', '$\\int_0^2 x\\,dx = 2$, $\\int_0^1 y\\,dy = \\frac12$ → $1$.'))),
    ]),
    step('6.3', D('Hmotnost, těžiště, moment setrvačnosti', 'Mass, centre of mass, moment of inertia'), 'atom', [
      lead('Integrály s hustotou $\\rho$ dávají fyzikální veličiny tělesa.', 'Integrals with a density $\\rho$ give physical properties of a body.'),
      math('M = \\int \\rho\\,dV,\\qquad \\bar{\\mathbf r} = \\dfrac1M\\int \\mathbf r\\,\\rho\\,dV,\\qquad I = \\int \\rho\\,r_\\perp^2\\,dV'),
      p('**Pappovy věty**: objem rotačního tělesa = plocha útvaru × dráha jeho těžiště ($V = 2\\pi\\bar y A$). Podobně povrch = délka křivky × dráha jejího těžiště.',
        '**Pappus’ theorems**: the volume of a solid of revolution = area × distance travelled by its centroid ($V = 2\\pi\\bar y A$). Similarly surface area = curve length × distance of its centroid.'),
      phys('Moment setrvačnosti homogenní koule o hmotnosti $M$ a poloměru $a$ vůči ose je $\\frac25 Ma^2$.', 'The moment of inertia of a uniform sphere of mass $M$ and radius $a$ about an axis is $\\frac25 Ma^2$.'),
      check(mcq(D('Pappovou větou: objem toru (kružnice poloměru $a$ ve vzdálenosti $b$ od osy) je…', 'By Pappus: the volume of a torus (circle of radius $a$ at distance $b$ from the axis) is…'), ['$2\\pi^2 a^2 b$', '$\\pi a^2 b$', '$4\\pi^2 ab$', '$\\frac43\\pi a^3$'], 0, D('$A = \\pi a^2$, dráha těžiště $2\\pi b$.', '$A = \\pi a^2$, the centroid travels $2\\pi b$.'))),
    ]),
    step('6.4', D('Substituce a Jacobián', 'Change of variables and the Jacobian'), 'compass', [
      lead('Při přechodu k novým souřadnicím se plošný element natáhne o faktor $|J|$ – absolutní hodnotu **Jacobiánu**.', 'Switching to new coordinates stretches the area element by $|J|$ – the absolute value of the **Jacobian**.'),
      math('dx\\,dy = \\left|\\dfrac{\\partial(x, y)}{\\partial(u, v)}\\right| du\\,dv,\\qquad dA = \\rho\\,d\\rho\\,d\\phi,\\qquad dV = r^2\\sin\\theta\\,dr\\,d\\theta\\,d\\phi'),
      example(D('Gaussův integrál', 'The Gaussian integral'), D('Spočítej $I = \\int_{-\\infty}^{\\infty} e^{-x^2}dx$.', 'Compute $I = \\int_{-\\infty}^{\\infty} e^{-x^2}dx$.'),
        [D('Trik: $I^2 = \\iint e^{-(x^2 + y^2)}dx\\,dy$ přes celou rovinu.', 'Trick: $I^2 = \\iint e^{-(x^2 + y^2)}dx\\,dy$ over the whole plane.'),
         D('V polárních souřadnicích: $I^2 = \\int_0^{2\\pi}\\int_0^\\infty e^{-\\rho^2}\\rho\\,d\\rho\\,d\\phi = 2\\pi\\cdot\\frac12 = \\pi$.', 'In polar coordinates: $I^2 = \\int_0^{2\\pi}\\int_0^\\infty e^{-\\rho^2}\\rho\\,d\\rho\\,d\\phi = 2\\pi\\cdot\\frac12 = \\pi$.')], '$I = \\sqrt\\pi$'),
      widget('paramPlot', {
        view: [-3.5, 3.5, -.2, 1.25], params: [{ k: 'a', min: .2, max: 3.5, value: 1.5, step: .01 }],
        curves: [{ f: x => Math.exp(-x * x), label: 'e^{-x^2}' }],
        area: { f: x => Math.exp(-x * x), a: P => -P.a, b: P => P.a, color: 'var(--blue)' },
        info: (P) => { let s = 0; const n = 400; for (let i = 0; i < n; i++) { const x = -P.a + 2 * P.a * (i + .5) / n; s += Math.exp(-x * x); } s *= 2 * P.a / n; return `\\int_{-a}^{a} e^{-x^2}dx = ${s.toFixed(4)}\n\\sqrt{\\pi} = ${Math.sqrt(Math.PI).toFixed(4)}`; },
      }),
      check(mcq(D('Jacobián přechodu do polárních souřadnic je…', 'The Jacobian for polar coordinates is…'), ['$\\rho$', '$1$', '$\\rho^2$', '$\\sin\\phi$'], 0, D('$dA = \\rho\\,d\\rho\\,d\\phi$.', '$dA = \\rho\\,d\\rho\\,d\\phi$.'))),
    ]),
  ],
  quiz: [
    num(D('Plocha kruhu $\\int_0^{2\\pi}\\int_0^{2}\\rho\\,d\\rho\\,d\\phi$ děleno $\\pi$?', 'The area $\\int_0^{2\\pi}\\int_0^{2}\\rho\\,d\\rho\\,d\\phi$ divided by $\\pi$?'), 4, D('$2\\pi\\cdot\\frac{4}{2} = 4\\pi$.', '$2\\pi\\cdot\\frac{4}{2} = 4\\pi$.')),
    mcq(D('Objemový element ve sférických souřadnicích je…', 'The volume element in spherical coordinates is…'), ['$r^2\\sin\\theta\\,dr\\,d\\theta\\,d\\phi$', '$r\\,dr\\,d\\theta\\,d\\phi$', '$dr\\,d\\theta\\,d\\phi$', '$r^2\\,dr\\,d\\theta\\,d\\phi$'], 0, D('Jacobián je $r^2\\sin\\theta$.', 'The Jacobian is $r^2\\sin\\theta$.')),
    num(D('$\\int_0^1\\int_0^1\\int_0^1 (x + y + z)\\,dx\\,dy\\,dz = ?$', '$\\int_0^1\\int_0^1\\int_0^1 (x + y + z)\\,dx\\,dy\\,dz = ?$'), 1.5, D('Každý člen dá $\\frac12$.', 'Each term gives $\\frac12$.'), { tol: .001 }),
    mcq(D('$\\int_{-\\infty}^\\infty e^{-x^2}dx = ?$', '$\\int_{-\\infty}^\\infty e^{-x^2}dx = ?$'), ['$\\sqrt\\pi$', '$\\pi$', '$1$', '$\\sqrt{2\\pi}$'], 0, D('Gaussův integrál.', 'The Gaussian integral.')),
    tf(D('Pořadí integrace v dvojném integrálu nikdy nejde prohodit.', 'The order of integration in a double integral can never be swapped.'), false, D('Pro rozumné funkce jde (Fubiniho věta), jen se změní meze.', 'For reasonable functions it can (Fubini), with adjusted limits.')),
    mcq(D('Těžiště homogenního půlkruhu poloměru $a$ leží ve výšce…', 'The centroid of a uniform half-disc of radius $a$ lies at height…'), ['$\\frac{4a}{3\\pi}$', '$\\frac a2$', '$\\frac{a}{\\pi}$', '$\\frac{2a}{3}$'], 0, D('Pappus: koule $\\frac43\\pi a^3 = 2\\pi\\bar y\\cdot\\frac{\\pi a^2}{2}$.', 'Pappus: sphere $\\frac43\\pi a^3 = 2\\pi\\bar y\\cdot\\frac{\\pi a^2}{2}$.')),
    mcq(D('Moment setrvačnosti tenké tyče délky $L$ kolem středu je…', 'The moment of inertia of a thin rod of length $L$ about its centre is…'), ['$\\frac{1}{12}ML^2$', '$\\frac13 ML^2$', '$\\frac12 ML^2$', '$ML^2$'], 0, D('$\\int_{-L/2}^{L/2} \\frac ML x^2 dx = \\frac{ML^2}{12}$.', '$\\int_{-L/2}^{L/2} \\frac ML x^2 dx = \\frac{ML^2}{12}$.')),
  ],
  glossary: [
    term('dvojný integrál', 'double integral', D('Integrál přes plochu.', 'An integral over an area.'), '\\iint f\\,dA'),
    term('trojný integrál', 'triple integral', D('Integrál přes objem.', 'An integral over a volume.'), '\\iiint f\\,dV'),
    term('Jacobián', 'Jacobian', D('Determinant parciálních derivací – měřítko plochy/objemu při substituci.', 'Determinant of partial derivatives – the area/volume scale factor.'), '\\frac{\\partial(x,y)}{\\partial(u,v)}'),
    term('těžiště', 'centre of mass', D('Průměrná poloha hmoty.', 'The mass-weighted average position.'), '\\bar{\\mathbf r}'),
    term('moment setrvačnosti', 'moment of inertia', D('$\\int \\rho r_\\perp^2 dV$ – „setrvačnost" při otáčení.', '$\\int \\rho r_\\perp^2 dV$ – rotational inertia.'), 'I'),
    term('polární souřadnice', 'polar coordinates', D('$x = \\rho\\cos\\phi$, $y = \\rho\\sin\\phi$.', '$x = \\rho\\cos\\phi$, $y = \\rho\\sin\\phi$.'), ''),
    term('sférické souřadnice', 'spherical polar coordinates', D('Poloha dána $r, \\theta, \\phi$.', 'Position given by $r, \\theta, \\phi$.'), ''),
  ],
};
