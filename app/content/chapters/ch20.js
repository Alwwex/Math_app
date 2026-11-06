import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Parciální diferenciální rovnice fyziky – vlnová, difúzní, Laplaceova, Poissonova, Schrödingerova. Jak vypadá jejich obecné řešení a kdy je úloha dobře položená.',
    'The PDEs of physics – wave, diffusion, Laplace, Poisson, Schrödinger. What their general solutions look like and when a problem is well posed.'),
  steps: [
    step('20.1', D('Důležité parciální rovnice', 'Important PDEs'), 'fire', [
      lead('Pět rovnic, které uvidíš všude:', 'Five equations you will meet everywhere:'),
      list(D('$\\nabla^2 u = \\dfrac{1}{c^2}\\dfrac{\\partial^2 u}{\\partial t^2}$ – vlnová rovnice', '$\\nabla^2 u = \\dfrac{1}{c^2}\\dfrac{\\partial^2 u}{\\partial t^2}$ – the wave equation'),
        D('$\\nabla^2 u = \\dfrac{1}{\\kappa}\\dfrac{\\partial u}{\\partial t}$ – difuze / vedení tepla', '$\\nabla^2 u = \\dfrac{1}{\\kappa}\\dfrac{\\partial u}{\\partial t}$ – diffusion / heat flow'),
        D('$\\nabla^2 u = 0$ – Laplaceova rovnice (ustálený stav, elektrostatika)', '$\\nabla^2 u = 0$ – Laplace’s equation (steady state, electrostatics)'),
        D('$\\nabla^2 u = \\rho$ – Poissonova rovnice (se zdroji)', '$\\nabla^2 u = \\rho$ – Poisson’s equation (with sources)'),
        D('$-\\dfrac{\\hbar^2}{2m}\\nabla^2\\psi + V\\psi = i\\hbar\\dfrac{\\partial\\psi}{\\partial t}$ – Schrödingerova rovnice', '$-\\dfrac{\\hbar^2}{2m}\\nabla^2\\psi + V\\psi = i\\hbar\\dfrac{\\partial\\psi}{\\partial t}$ – Schrödinger’s equation')),
      lang('wave equation = vlnová rovnice, diffusion equation = rovnice difuze (vedení tepla), boundary condition = okrajová podmínka.', 'vlnová rovnice = wave equation, rovnice difuze = diffusion equation, okrajová podmínka = boundary condition.'),
      check(mcq(D('Ustálené rozložení teploty bez zdrojů splňuje…', 'A steady temperature distribution without sources satisfies…'), [D('Laplaceovu rovnici', 'Laplace’s equation'), D('vlnovou rovnici', 'the wave equation'), D('Schrödingerovu rovnici', 'Schrödinger’s equation'), D('Poissonovu se zdrojem', 'Poisson with a source')], 0, D('$\\partial_t u = 0$ → $\\nabla^2 u = 0$.', '$\\partial_t u = 0$ → $\\nabla^2 u = 0$.'))),
    ]),
    step('20.2–20.3', D('Obecné a partikulární řešení', 'General and particular solutions'), 'puzzle', [
      lead('Obecné řešení PDR neobsahuje libovolné **konstanty**, ale libovolné **funkce**. Teprve okrajové a počáteční podmínky z nich vyberou jedno.', 'The general solution of a PDE contains arbitrary **functions**, not constants. Boundary and initial conditions then select one.'),
      example(D('Transportní rovnice', 'Transport equation'), D('Najdi obecné řešení $\\dfrac{\\partial u}{\\partial t} + c\\dfrac{\\partial u}{\\partial x} = 0$.', 'Find the general solution of $\\dfrac{\\partial u}{\\partial t} + c\\dfrac{\\partial u}{\\partial x} = 0$.'),
        [D('Zkus $u = f(p)$ s $p = x - ct$: $u_t = -cf\'$, $u_x = f\'$.', 'Try $u = f(p)$ with $p = x - ct$: $u_t = -cf\'$, $u_x = f\'$.'), D('Dosazením $-cf\' + cf\' = 0$ – platí pro libovolné $f$.', 'Substituting: $-cf\' + cf\' = 0$ – any $f$ works.')], D('$u = f(x - ct)$ – profil se posouvá rychlostí $c$', '$u = f(x - ct)$ – the profile moves at speed $c$')),
      check(tf(D('Obecné řešení PDR prvního řádu obsahuje libovolnou funkci.', 'The general solution of a first-order PDE contains an arbitrary function.'), true, D('Na rozdíl od ODR (konstanta).', 'Unlike an ODE (a constant).'))),
    ]),
    step('20.4', D('Vlnová rovnice', 'The wave equation'), 'wave', [
      math('u(x, t) = f(x - ct) + g(x + ct)'),
      p('**d\'Alembertovo řešení**: libovolný tvar se rozdělí na dvě vlny běžící doleva a doprava. Pro počáteční výchylku $u_0(x)$ a nulovou rychlost je $u = \\frac12[u_0(x - ct) + u_0(x + ct)]$.', '**d’Alembert’s solution**: any shape splits into two waves moving left and right. For initial displacement $u_0(x)$ at rest, $u = \\frac12[u_0(x - ct) + u_0(x + ct)]$.'),
      widget('paramPlot', {
        view: [-10, 10, -.2, 1.15], xlabel: 'x', ylabel: 'u', params: [{ k: 't', min: 0, max: 8, value: 0, step: .01 }], play: 't', duration: 5,
        curves: [{ f: (x, P) => .5 * (Math.exp(-((x - P.t) ** 2)) + Math.exp(-((x + P.t) ** 2))), label: 'u(x, t)' }, { f: x => Math.exp(-x * x), color: 'var(--ink-3)', dash: true, thin: true, label: 'u(x, 0)' }],
        info: (P, T) => `t = ${P.t.toFixed(2)}\n\\text{${T('dvě poloviční vlny', 'two half-height waves')}}\\ (c = 1)`,
      }),
      check(mcq(D('Rychlost šíření vln v rovnici $u_{tt} = 9u_{xx}$ je…', 'The wave speed in $u_{tt} = 9u_{xx}$ is…'), ['$3$', '$9$', '$81$', '$1/3$'], 0, D('$c^2 = 9$.', '$c^2 = 9$.'))),
    ]),
    step('20.5', D('Rovnice difuze', 'The diffusion equation'), 'fire', [
      lead('Teplo nebo koncentrace se rozplývá: bodový zdroj se rozšíří do gaussovky, jejíž šířka roste jako $\\sqrt{t}$.', 'Heat or concentration spreads: a point source becomes a Gaussian whose width grows like $\\sqrt{t}$.'),
      math('u(x, t) = \\dfrac{1}{\\sqrt{4\\pi\\kappa t}}\\exp\\left(-\\dfrac{x^2}{4\\kappa t}\\right)'),
      widget('paramPlot', {
        view: [-8, 8, -.05, 1.3], xlabel: 'x', ylabel: 'u', params: [{ k: 't', min: .05, max: 8, value: .2, step: .01 }], play: 't', duration: 6,
        curves: [{ f: (x, P) => Math.exp(-x * x / (4 * P.t)) / Math.sqrt(4 * Math.PI * P.t), label: 'u(x, t)', color: 'var(--red)' }],
        info: (P, T) => `\\sigma = \\sqrt{2\\kappa t} = ${Math.sqrt(2 * P.t).toFixed(2)}\n\\text{${T('plocha (teplo) zůstává', 'area (heat) is conserved')}} = 1`,
      }),
      warn('Na rozdíl od vln je difuze nevratná – časem se vše jen rozmazává.', 'Unlike waves, diffusion is irreversible – things only smooth out.'),
      check(mcq(D('Když se čas zčtyřnásobí, šířka teplotního profilu se…', 'If time quadruples, the width of the temperature profile…'), [D('zdvojnásobí', 'doubles'), D('zčtyřnásobí', 'quadruples'), D('nezmění', 'stays the same'), D('zmenší', 'shrinks')], 0, D('Šířka $\\propto \\sqrt t$.', 'Width $\\propto \\sqrt t$.'))),
    ]),
    step('20.6–20.7', D('Typy rovnic a jednoznačnost', 'Types of equation and uniqueness'), 'target', [
      lead('Rovnici druhého řádu $Au_{xx} + Bu_{xy} + Cu_{yy} + \\dots = 0$ klasifikujeme podle diskriminantu $B^2 - 4AC$ – stejně jako kuželosečky.', 'A second-order equation $Au_{xx} + Bu_{xy} + Cu_{yy} + \\dots = 0$ is classified by $B^2 - 4AC$ – just like conics.'),
      list(D('$B^2 - 4AC > 0$: **hyperbolická** (vlnová),', '$B^2 - 4AC > 0$: **hyperbolic** (wave),'), D('$= 0$: **parabolická** (difúzní),', '$= 0$: **parabolic** (diffusion),'), D('$< 0$: **eliptická** (Laplaceova).', '$< 0$: **elliptic** (Laplace).')),
      p('Typ rozhoduje, jaké podmínky dávají jediné řešení: eliptické rovnice chtějí okrajové podmínky na celé uzavřené hranici (Dirichletovy – hodnoty, nebo Neumannovy – normálové derivace).', 'The type decides which conditions give a unique solution: elliptic equations need boundary conditions on a whole closed boundary (Dirichlet – values, or Neumann – normal derivatives).'),
      check(mcq(D('Vlnová rovnice $u_{tt} - c^2u_{xx} = 0$ je…', 'The wave equation $u_{tt} - c^2u_{xx} = 0$ is…'), [D('hyperbolická', 'hyperbolic'), D('eliptická', 'elliptic'), D('parabolická', 'parabolic'), D('nelineární', 'nonlinear')], 0, D('$B^2 - 4AC = 4c^2 > 0$.', '$B^2 - 4AC = 4c^2 > 0$.'))),
    ]),
  ],
  quiz: [
    mcq(D('Laplaceova rovnice je…', 'Laplace’s equation is…'), [D('eliptická', 'elliptic'), D('hyperbolická', 'hyperbolic'), D('parabolická', 'parabolic'), D('prvního řádu', 'first order')], 0, D('$u_{xx} + u_{yy} = 0$: $B^2 - 4AC = -4$.', '$u_{xx} + u_{yy} = 0$: $B^2 - 4AC = -4$.')),
    tf(D('$u = \\sin(x - 2t)$ řeší $u_{tt} = 4u_{xx}$.', '$u = \\sin(x - 2t)$ solves $u_{tt} = 4u_{xx}$.'), true, D('$c = 2$.', '$c = 2$.')),
    mcq(D('Obecné řešení vlnové rovnice v 1D je…', 'The general solution of the 1D wave equation is…'), ['$f(x - ct) + g(x + ct)$', '$Ae^{-kt}$', '$f(x)g(t)$ vždy', '$x^2 - c^2t^2$'], 0, D('d\'Alembert.', 'd’Alembert.')),
    mcq(D('Šířka difúzního profilu roste jako…', 'The width of a diffusion profile grows as…'), ['$\\sqrt t$', '$t$', '$t^2$', '$\\ln t$'], 0, D('$\\sigma = \\sqrt{2\\kappa t}$.', '$\\sigma = \\sqrt{2\\kappa t}$.')),
    mcq(D('Dirichletova okrajová podmínka předepisuje…', 'A Dirichlet boundary condition prescribes…'), [D('hodnotu funkce na hranici', 'the value on the boundary'), D('normálovou derivaci', 'the normal derivative'), D('počáteční rychlost', 'initial velocity'), D('nic', 'nothing')], 0, D('Neumannova by předepisovala derivaci.', 'Neumann would prescribe the derivative.')),
    tf(D('Difúzní rovnice je časově vratná.', 'The diffusion equation is time-reversible.'), false, D('První derivace v čase – obrácení času změní znaménko.', 'First derivative in time – reversing time flips the sign.')),
  ],
  glossary: [
    term('parciální diferenciální rovnice', 'partial differential equation', D('Rovnice pro funkci více proměnných a její parciální derivace.', 'An equation for a multivariable function and its partial derivatives.'), ''),
    term('vlnová rovnice', 'wave equation', D('$\\nabla^2u = c^{-2}u_{tt}$.', '$\\nabla^2u = c^{-2}u_{tt}$.'), ''),
    term('rovnice difuze', 'diffusion equation', D('$\\nabla^2u = \\kappa^{-1}u_t$.', '$\\nabla^2u = \\kappa^{-1}u_t$.'), ''),
    term('Laplaceova rovnice', 'Laplace’s equation', D('$\\nabla^2 u = 0$.', '$\\nabla^2 u = 0$.'), ''),
    term('okrajová podmínka', 'boundary condition', D('Předpis na hranici oblasti.', 'A condition on the boundary.'), ''),
    term('charakteristiky', 'characteristics', D('Křivky, podél kterých se šíří informace.', 'Curves along which information travels.'), ''),
    term('hyperbolická rovnice', 'hyperbolic equation', D('Typ s $B^2 - 4AC > 0$ (vlny).', 'Type with $B^2 - 4AC > 0$ (waves).'), ''),
    term('eliptická rovnice', 'elliptic equation', D('Typ s $B^2 - 4AC < 0$ (Laplace).', 'Type with $B^2 - 4AC < 0$ (Laplace).'), ''),
  ],
};
