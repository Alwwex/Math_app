import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Komplexní analýza v akci: proudění kolem křídla, hledání kořenů, sčítání řad, inverzní Laplaceova transformace a asymptotické metody (WKB, sedlový bod, Stirlingův vzorec).',
    'Complex analysis at work: flow around a wing, locating zeros, summing series, inverting Laplace transforms and asymptotic methods (WKB, steepest descents, Stirling’s formula).'),
  steps: [
    step('25.1–25.2', D('Komplexní potenciály a proudění', 'Complex potentials and flow'), 'airplane', [
      lead('Rovinné proudění ideální tekutiny popíše jediná analytická funkce $\\Omega = \\phi + i\\psi$. Reálná část je potenciál rychlosti, imaginární **proudová funkce** – její vrstevnice jsou proudnice.', 'Ideal 2D flow is described by one analytic function $\\Omega = \\phi + i\\psi$. The real part is the velocity potential, the imaginary part the **stream function** – its contours are streamlines.'),
      list(D('$\\Omega = Vz$ – rovnoměrný proud,', '$\\Omega = Vz$ – uniform flow,'), D('$\\Omega = \\frac{m}{2\\pi}\\ln z$ – zdroj,', '$\\Omega = \\frac{m}{2\\pi}\\ln z$ – a source,'), D('$\\Omega = \\frac{i\\Gamma}{2\\pi}\\ln z$ – vír,', '$\\Omega = \\frac{i\\Gamma}{2\\pi}\\ln z$ – a vortex,'), D('$\\Omega = V\\left(z + \\frac{a^2}{z}\\right)$ – obtékání válce.', '$\\Omega = V\\left(z + \\frac{a^2}{z}\\right)$ – flow past a cylinder.')),
      widget('field', { preset: 'src' }),
      phys('Žukovského zobrazení $w = z + 1/z$ převede kružnici na profil křídla – tak se počítal vztlak prvních letadel.', 'The Joukowski map $w = z + 1/z$ turns a circle into an aerofoil – how early aircraft lift was computed.'),
      check(mcq(D('Proudnice jsou vrstevnice…', 'Streamlines are contours of…'), [D('proudové funkce $\\psi$', 'the stream function $\\psi$'), D('potenciálu $\\phi$', 'the potential $\\phi$'), D('$|\\Omega|$', '$|\\Omega|$'), D('tlaku', 'pressure')], 0, D('$\\psi = $ konst. podél proudnic.', '$\\psi = $ const along streamlines.'))),
    ]),
    step('25.3–25.5', D('Nulové body, součty řad, inverzní Laplace', 'Zeros, series sums, inverse Laplace'), 'target', [
      lead('**Princip argumentu**: $\\frac{1}{2\\pi i}\\oint \\frac{f\'}{f}dz$ = počet nulových bodů minus počet pólů uvnitř křivky. **Rouchého věta** pak dovolí nulové body spočítat bez jejich hledání.', '**Argument principle**: $\\frac{1}{2\\pi i}\\oint \\frac{f\'}{f}dz$ = number of zeros minus poles inside. **Rouché’s theorem** then counts zeros without finding them.'),
      p('Součty řad: funkce $\\pi\\cot\\pi z$ má v každém celém $n$ pól s reziduem 1. Integrál $\\oint \\pi\\cot(\\pi z)f(z)dz$ tak „posbírá" $\\sum f(n)$. Tak se dá dokázat $\\sum 1/n^2 = \\pi^2/6$.', 'Series sums: $\\pi\\cot\\pi z$ has a pole with residue 1 at each integer $n$. The integral $\\oint \\pi\\cot(\\pi z)f(z)dz$ thus collects $\\sum f(n)$ – one way to prove $\\sum 1/n^2 = \\pi^2/6$.'),
      p('**Bromwichův integrál** obrací Laplaceovu transformaci: $f(t) = \\frac{1}{2\\pi i}\\int_{\\lambda - i\\infty}^{\\lambda + i\\infty}\\bar f(s)e^{st}ds$ – v praxi součet reziduí.', 'The **Bromwich integral** inverts the Laplace transform: $f(t) = \\frac{1}{2\\pi i}\\int_{\\lambda - i\\infty}^{\\lambda + i\\infty}\\bar f(s)e^{st}ds$ – in practice a sum of residues.'),
      check(num(D('Kolik nulových bodů má $z^5 + 3z + 1$ v kruhu $|z| < 2$?', 'How many zeros does $z^5 + 3z + 1$ have in $|z| < 2$?'), 5, D('Na $|z| = 2$ převažuje $z^5$ (32 > 7) → Rouché: 5.', 'On $|z| = 2$, $z^5$ dominates (32 > 7) → Rouché: 5.'))),
    ]),
    step('25.6–25.7', D('Airyho funkce a metoda WKB', 'Airy functions and the WKB method'), 'wave', [
      lead('Když se vlnové číslo $k(x)$ mění pomalu, je řešení $y\'\' + k^2(x)y = 0$ přibližně vlna s proměnnou vlnovou délkou a amplitudou:', 'When the wavenumber $k(x)$ varies slowly, $y\'\' + k^2(x)y = 0$ is approximately a wave with varying wavelength and amplitude:'),
      math('y \\approx \\dfrac{A}{\\sqrt{k(x)}}\\exp\\left(\\pm i\\int k(x)\\,dx\\right)'),
      p('V **bodě obratu** ($k = 0$) aproximace selže; tam řešení popisuje **Airyho funkce** – kmitá na jedné straně a exponenciálně zaniká na druhé.', 'At a **turning point** ($k = 0$) the approximation fails; there the **Airy function** takes over – oscillating on one side and decaying on the other.'),
      phys('WKB dává Bohrovu–Sommerfeldovu kvantovací podmínku a pravděpodobnost tunelování jádra alfa.', 'WKB yields the Bohr–Sommerfeld quantisation rule and alpha-decay tunnelling probabilities.'),
      check(tf(D('Metoda WKB je přesná v bodě obratu.', 'WKB is exact at a turning point.'), false, D('Tam selhává – nastupuje Airyho funkce.', 'It fails there – the Airy function takes over.'))),
    ]),
    step('25.8', D('Aproximace integrálů', 'Approximating integrals'), 'sparkles', [
      lead('Integrály typu $\\int e^{\\lambda f(z)}g(z)\\,dz$ pro velké $\\lambda$ ovládá okolí **sedlového bodu** $f\'(z_0) = 0$. Metoda nejstrmějšího spádu dá Stirlingův vzorec:', 'Integrals $\\int e^{\\lambda f(z)}g(z)\\,dz$ with large $\\lambda$ are dominated by a **saddle point** $f\'(z_0) = 0$. Steepest descents gives Stirling’s formula:'),
      math('n! \\approx \\sqrt{2\\pi n}\\left(\\dfrac{n}{e}\\right)^n'),
      widget('paramPlot', {
        view: [0, 20, .9, 1.1], xlabel: 'n', ylabel: 'n!/S', params: [],
        curves: [{ f: x => { const n = Math.max(1, Math.floor(x)); let lf = 0; for (let k = 2; k <= n; k++) lf += Math.log(k); const ls = .5 * Math.log(2 * Math.PI * n) + n * Math.log(n) - n; return Math.exp(lf - ls); }, label: 'n!\\,/\\,\\text{Stirling}' }, { f: () => 1, color: 'var(--ink-3)', dash: true, thin: true }],
        info: (P, T) => `n = 1:\\ \\text{${T('chyba', 'error')}}\\ 8\\,\\%\nn = 10:\\ \\text{${T('chyba', 'error')}}\\ 0{,}8\\,\\%`,
      }),
      check(mcq(D('Relativní chyba Stirlingova vzorce s rostoucím $n$…', 'The relative error of Stirling’s formula as $n$ grows…'), [D('klesá (asi jako $1/12n$)', 'decreases (about $1/12n$)'), D('roste', 'grows'), D('je stálá', 'is constant'), D('osciluje', 'oscillates')], 0, D('Další člen řady je $1 + \\frac{1}{12n}$.', 'The next term is $1 + \\frac{1}{12n}$.'))),
    ]),
  ],
  quiz: [
    mcq(D('Komplexní potenciál zdroje je úměrný…', 'The complex potential of a source is proportional to…'), ['$\\ln z$', '$z$', '$1/z$', '$z^2$'], 0, D('$\\frac{m}{2\\pi}\\ln z$.', '$\\frac{m}{2\\pi}\\ln z$.')),
    tf(D('Žukovského zobrazení převádí kružnici na profil křídla.', 'The Joukowski map turns a circle into an aerofoil.'), true, D('$w = z + 1/z$.', '$w = z + 1/z$.')),
    mcq(D('Princip argumentu počítá…', 'The argument principle counts…'), [D('nuly minus póly uvnitř křivky', 'zeros minus poles inside the curve'), D('jen póly', 'only poles'), D('délku křivky', 'the curve length'), D('rezidua vně', 'residues outside')], 0, D('$\\frac{1}{2\\pi i}\\oint f\'/f$.', '$\\frac{1}{2\\pi i}\\oint f\'/f$.')),
    mcq(D('Stirlingův vzorec aproximuje…', 'Stirling’s formula approximates…'), ['$n!$', '$e^n$', '$\\sum 1/n$', '$\\pi$'], 0, D('$n! \\approx \\sqrt{2\\pi n}(n/e)^n$.', '$n! \\approx \\sqrt{2\\pi n}(n/e)^n$.')),
    mcq(D('Amplituda WKB řešení je úměrná…', 'The WKB amplitude is proportional to…'), ['$k^{-1/2}$', '$k$', '$k^2$', '$e^k$'], 0, D('$A/\\sqrt{k}$ – zachování toku.', '$A/\\sqrt{k}$ – flux conservation.')),
    tf(D('Funkce $\\pi\\cot\\pi z$ má póly ve všech celých číslech.', '$\\pi\\cot\\pi z$ has poles at all integers.'), true, D('S reziduem 1.', 'With residue 1.')),
  ],
  glossary: [
    term('komplexní potenciál', 'complex potential', D('$\\Omega = \\phi + i\\psi$ pro 2D proudění.', '$\\Omega = \\phi + i\\psi$ for 2D flow.'), ''),
    term('proudová funkce', 'stream function', D('Její vrstevnice jsou proudnice.', 'Its contours are streamlines.'), '\\psi'),
    term('princip argumentu', 'argument principle', D('Počet nul minus pólů z $\\oint f\'/f$.', 'Zeros minus poles from $\\oint f\'/f$.'), ''),
    term('Bromwichův integrál', 'Bromwich integral', D('Vzorec pro inverzní Laplaceovu transformaci.', 'The inverse Laplace transform formula.'), ''),
    term('bod obratu', 'turning point', D('Místo, kde $k(x) = 0$.', 'Where $k(x) = 0$.'), ''),
    term('metoda WKB', 'WKB method', D('Aproximace pro pomalu proměnné vlnové číslo.', 'Approximation for slowly varying wavenumber.'), ''),
    term('sedlový bod', 'saddle point', D('Bod, kde $f\'(z) = 0$ – dominuje integrálu.', 'Where $f\'(z) = 0$ – dominates the integral.'), ''),
    term('Stirlingův vzorec', 'Stirling’s approximation', D('$n! \\approx \\sqrt{2\\pi n}(n/e)^n$.', '$n! \\approx \\sqrt{2\\pi n}(n/e)^n$.'), ''),
  ],
};
