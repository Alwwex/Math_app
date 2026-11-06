import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Integrály podél křivek, přes plochy a objemy – a velké věty, které je spojují: Greenova, Gaussova a Stokesova. Základ elektrodynamiky a hydrodynamiky.',
    'Integrals along curves, over surfaces and volumes – and the great theorems linking them: Green, Gauss (divergence) and Stokes. The backbone of electrodynamics and fluid dynamics.'),
  steps: [
    step('11.1–11.2', D('Křivkové integrály', 'Line integrals'), 'wave', [
      lead('Křivkový integrál $\\int_C \\mathbf a\\cdot d\\mathbf r$ sčítá průmět pole do směru pohybu – například práci síly po dráze.', 'The line integral $\\int_C \\mathbf a\\cdot d\\mathbf r$ adds up the component of a field along the path – e.g. the work done by a force.'),
      example(D('Práce po čtvrtkružnici', 'Work along a quarter circle'), D('Spočítej $\\int_C (-y\\,dx + x\\,dy)$ po jednotkové kružnici od $(1,0)$ do $(0,1)$.', 'Compute $\\int_C (-y\\,dx + x\\,dy)$ along the unit circle from $(1,0)$ to $(0,1)$.'),
        [D('Parametrizace $x = \\cos t$, $y = \\sin t$, $t \\in [0, \\pi/2]$.', 'Parametrise $x = \\cos t$, $y = \\sin t$, $t \\in [0, \\pi/2]$.'), D('$-y\\,dx + x\\,dy = (\\sin^2 t + \\cos^2 t)\\,dt = dt$.', '$-y\\,dx + x\\,dy = (\\sin^2 t + \\cos^2 t)\\,dt = dt$.')], '$\\pi/2$'),
      p('Oblast je **jednoduše souvislá**, když v ní jde každou uzavřenou křivku stáhnout do bodu. Mezikruží souvislé jednoduše není – to bude důležité u potenciálů.', 'A region is **simply connected** if every closed curve in it can be shrunk to a point. An annulus is not – which matters for potentials.'),
      check(mcq(D('Křivkový integrál gradientu $\\int_A^B \\nabla\\phi\\cdot d\\mathbf r$ je…', 'The line integral of a gradient $\\int_A^B \\nabla\\phi\\cdot d\\mathbf r$ equals…'), ['$\\phi(B) - \\phi(A)$', D('závislý na cestě', 'path dependent'), '$0$', '$\\phi(A)\\phi(B)$'], 0, D('Základní věta pro gradient.', 'The fundamental theorem for gradients.'))),
    ]),
    step('11.3–11.4', D('Greenova věta a konzervativní pole', 'Green’s theorem and conservative fields'), 'puzzle', [
      math('\\oint_C (P\\,dx + Q\\,dy) = \\iint_R \\left(\\dfrac{\\partial Q}{\\partial x} - \\dfrac{\\partial P}{\\partial y}\\right)dx\\,dy'),
      p('Pole je **konzervativní**, když integrál nezávisí na cestě. Ekvivalentně: $\\nabla\\times\\mathbf a = 0$ (v jednoduše souvislé oblasti), nebo existuje potenciál $\\mathbf a = \\nabla\\phi$.', 'A field is **conservative** if the integral is path independent. Equivalently $\\nabla\\times\\mathbf a = 0$ (in a simply connected region), or there is a potential $\\mathbf a = \\nabla\\phi$.'),
      widget('field', { preset: 'rot' }),
      tip('Greenova věta dává plochu oblasti: $A = \\frac12\\oint (x\\,dy - y\\,dx)$. Na tom principu funguje planimetr.', 'Green’s theorem gives area: $A = \\frac12\\oint (x\\,dy - y\\,dx)$ – the principle of the planimeter.'),
      check(tf(D('Gravitační pole Země je konzervativní.', 'Earth’s gravitational field is conservative.'), true, D('Má potenciál $-GM/r$.', 'It has the potential $-GM/r$.'))),
    ]),
    step('11.5–11.6', D('Plošné a objemové integrály', 'Surface and volume integrals'), 'package', [
      lead('**Tok** pole plochou $\\iint_S \\mathbf a\\cdot d\\mathbf S$ měří, kolik „protéká" plochou. Vektor $d\\mathbf S = \\hat{\\mathbf n}\\,dS$ míří kolmo ven.', 'The **flux** $\\iint_S \\mathbf a\\cdot d\\mathbf S$ measures how much flows through a surface. $d\\mathbf S = \\hat{\\mathbf n}\\,dS$ points outward.'),
      example(D('Tok sférou', 'Flux through a sphere'), D('Tok pole $\\mathbf r$ koulí poloměru $a$.', 'Flux of $\\mathbf r$ through a sphere of radius $a$.'),
        [D('Na sféře $\\mathbf r\\cdot\\hat{\\mathbf n} = a$.', 'On the sphere $\\mathbf r\\cdot\\hat{\\mathbf n} = a$.'), D('$\\Phi = a\\cdot 4\\pi a^2$.', '$\\Phi = a\\cdot 4\\pi a^2$.')], '$4\\pi a^3$'),
      check(num(D('Tok konstantního pole $(0, 0, 3)$ čtvercem $1\\times1$ v rovině $z = 0$ (normála $+z$)?', 'Flux of the constant field $(0, 0, 3)$ through a $1\\times1$ square in $z = 0$ (normal $+z$)?'), 3, D('$3\\cdot 1$.', '$3\\cdot 1$.'))),
    ]),
    step('11.8', D('Gaussova (divergenční) věta', 'The divergence theorem'), 'atom', [
      math('\\iiint_V \\nabla\\cdot\\mathbf a\\,dV = \\oiint_S \\mathbf a\\cdot d\\mathbf S'),
      p('Co vyteče hranicí, muselo vzniknout uvnitř. Ověř na předchozím příkladu: $\\nabla\\cdot\\mathbf r = 3$, objem koule $\\frac43\\pi a^3$, součin $4\\pi a^3$ ✓.', 'What flows out through the boundary must be produced inside. Check with the previous example: $\\nabla\\cdot\\mathbf r = 3$, ball volume $\\frac43\\pi a^3$, product $4\\pi a^3$ ✓.'),
      phys('Odtud Gaussův zákon: tok elektrického pole uzavřenou plochou = náboj uvnitř / $\\varepsilon_0$.', 'Hence Gauss’s law: the electric flux through a closed surface = enclosed charge / $\\varepsilon_0$.'),
      check(num(D('Tok pole $(x, y, z)$ povrchem jednotkové krychle?', 'Flux of $(x, y, z)$ out of the unit cube?'), 3, D('$\\nabla\\cdot = 3$, objem 1.', '$\\nabla\\cdot = 3$, volume 1.'))),
    ]),
    step('11.9', D('Stokesova věta', 'Stokes’ theorem'), 'tornado', [
      math('\\iint_S (\\nabla\\times\\mathbf a)\\cdot d\\mathbf S = \\oint_C \\mathbf a\\cdot d\\mathbf r'),
      p('Cirkulace po okraji plochy = tok rotace plochou. Nezáleží na tom, jakou plochu napneme na danou křivku – jen na okraji.', 'Circulation around the edge = flux of the curl through the surface. Any surface spanning the curve gives the same result.'),
      phys('Ampérův zákon: $\\oint \\mathbf B\\cdot d\\mathbf r = \\mu_0 I$ je Stokesova věta aplikovaná na $\\nabla\\times\\mathbf B = \\mu_0\\mathbf J$.', 'Ampère’s law $\\oint \\mathbf B\\cdot d\\mathbf r = \\mu_0 I$ is Stokes applied to $\\nabla\\times\\mathbf B = \\mu_0\\mathbf J$.'),
      check(mcq(D('Greenova věta je speciální případ…', 'Green’s theorem is a special case of…'), [D('Stokesovy věty', 'Stokes’ theorem'), D('věty o střední hodnotě', 'the mean value theorem'), D('Pappovy věty', 'Pappus’ theorem'), D('Rolleovy věty', 'Rolle’s theorem')], 0, D('Stokes v rovině.', 'Stokes in the plane.'))),
    ]),
  ],
  quiz: [
    mcq(D('Pole $\\mathbf a$ je konzervativní (v jednoduše souvislé oblasti), právě když…', 'A field is conservative (in a simply connected region) iff…'), ['$\\nabla\\times\\mathbf a = 0$', '$\\nabla\\cdot\\mathbf a = 0$', '$\\mathbf a = 0$', '$|\\mathbf a| = 1$'], 0, D('Nevírové pole má potenciál.', 'An irrotational field has a potential.')),
    num(D('$\\oint (x\\,dy - y\\,dx)/2$ po kružnici poloměru 1, děleno $\\pi$?', '$\\oint (x\\,dy - y\\,dx)/2$ around the unit circle, divided by $\\pi$?'), 1, D('Je to plocha kruhu $\\pi$.', 'It is the disc area $\\pi$.')),
    mcq(D('Divergenční věta převádí objemový integrál na…', 'The divergence theorem converts a volume integral into…'), [D('plošný integrál přes hranici', 'a surface integral over the boundary'), D('křivkový integrál', 'a line integral'), D('derivaci', 'a derivative'), D('součet řady', 'a series')], 0, D('$\\iiint \\nabla\\cdot\\mathbf a\\,dV = \\oiint \\mathbf a\\cdot d\\mathbf S$.', '$\\iiint \\nabla\\cdot\\mathbf a\\,dV = \\oiint \\mathbf a\\cdot d\\mathbf S$.')),
    tf(D('Podle Stokese závisí výsledek na tvaru plochy, ne jen na okraji.', 'By Stokes the result depends on the shape of the surface, not only on its edge.'), false, D('Záleží jen na okrajové křivce.', 'Only the boundary curve matters.')),
    num(D('Tok pole $\\mathbf r/r^3$ libovolnou sférou kolem počátku, děleno $\\pi$?', 'Flux of $\\mathbf r/r^3$ through any sphere around the origin, divided by $\\pi$?'), 4, D('$\\frac{1}{a^2}\\cdot 4\\pi a^2 = 4\\pi$ – nezávisí na poloměru.', '$\\frac{1}{a^2}\\cdot 4\\pi a^2 = 4\\pi$ – independent of radius.')),
    mcq(D('Mezikruží je…', 'An annulus is…'), [D('souvislé, ale ne jednoduše souvislé', 'connected but not simply connected'), D('jednoduše souvislé', 'simply connected'), D('nesouvislé', 'disconnected'), D('prázdné', 'empty')], 0, D('Smyčku kolem otvoru nelze stáhnout.', 'A loop around the hole cannot be shrunk.')),
  ],
  glossary: [
    term('křivkový integrál', 'line integral', D('Integrál pole podél křivky.', 'Integral of a field along a curve.'), '\\int_C \\mathbf a\\cdot d\\mathbf r'),
    term('tok', 'flux', D('Plošný integrál $\\iint \\mathbf a\\cdot d\\mathbf S$.', 'The surface integral $\\iint \\mathbf a\\cdot d\\mathbf S$.'), ''),
    term('cirkulace', 'circulation', D('Křivkový integrál po uzavřené křivce.', 'A line integral around a closed curve.'), '\\oint'),
    term('konzervativní pole', 'conservative field', D('Integrál nezávisí na cestě.', 'Path-independent line integrals.'), ''),
    term('potenciál', 'potential', D('Funkce $\\phi$ s $\\mathbf a = \\nabla\\phi$.', 'A function $\\phi$ with $\\mathbf a = \\nabla\\phi$.'), ''),
    term('Greenova věta', 'Green’s theorem', D('Spojuje křivkový a dvojný integrál v rovině.', 'Links line and double integrals in the plane.'), ''),
    term('Gaussova věta', 'divergence theorem', D('Objem divergence = tok hranicí.', 'Volume of divergence = flux through the boundary.'), ''),
    term('Stokesova věta', 'Stokes’ theorem', D('Tok rotace = cirkulace po okraji.', 'Flux of curl = circulation around the edge.'), ''),
    term('jednoduše souvislá oblast', 'simply connected region', D('Každá smyčka jde stáhnout do bodu.', 'Every loop can shrink to a point.'), ''),
  ],
};
