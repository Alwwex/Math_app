import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Spřažené kmitající soustavy – molekuly, mosty, struny – se rozloží na nezávislé **normální módy**. Matematicky je to úloha na vlastní čísla z kapitoly 8.',
    'Coupled oscillating systems – molecules, bridges, strings – decompose into independent **normal modes**. Mathematically it is the eigenvalue problem of Chapter 8.'),
  steps: [
    step('9.1', D('Typické kmitající soustavy', 'Typical oscillatory systems'), 'guitar', [
      lead('Pro malé výchylky dostaneme pohybové rovnice $M\\ddot{\\mathbf q} = -K\\mathbf q$. Hledáme řešení, kde všechno kmitá stejnou frekvencí $\\omega$.', 'For small displacements the equations of motion are $M\\ddot{\\mathbf q} = -K\\mathbf q$. We look for solutions where everything oscillates at one frequency $\\omega$.'),
      math('(K - \\omega^2 M)\\,\\mathbf x = 0\\quad\\Rightarrow\\quad \\det(K - \\omega^2 M) = 0'),
      widget('oscillators'),
      example(D('Dvě závaží a tři pružiny', 'Two masses, three springs'), D('Najdi frekvence normálních módů (stejné hmotnosti $m$, tuhosti $k$).', 'Find the normal-mode frequencies (equal masses $m$, stiffness $k$).'),
        [D('$K = k\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}$, $M = mI$.', '$K = k\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}$, $M = mI$.'),
         D('$\\det = (2k - m\\omega^2)^2 - k^2 = 0$ → $m\\omega^2 = k$ nebo $3k$.', '$\\det = (2k - m\\omega^2)^2 - k^2 = 0$ → $m\\omega^2 = k$ or $3k$.'),
         D('Mód $(1, 1)$: obě závaží spolu, prostřední pružina se nenatahuje. Mód $(1, -1)$: proti sobě, rychleji.', 'Mode $(1, 1)$: both together, the middle spring idle. Mode $(1, -1)$: opposite, faster.')],
        '$\\omega = \\sqrt{k/m}$, $\\ \\sqrt{3k/m}$'),
      check(mcq(D('Který mód má vyšší frekvenci?', 'Which mode has the higher frequency?'), [D('v protifázi', 'out of phase'), D('ve fázi', 'in phase'), D('oba stejnou', 'both equal'), D('záleží na počáteční výchylce', 'depends on initial displacement')], 0, D('V protifázi se prostřední pružina natahuje dvojnásobně → větší tuhost.', 'Out of phase the middle spring stretches twice as much → stiffer.'))),
    ]),
    step('9.2', D('Symetrie a normální módy', 'Symmetry and normal modes'), 'snowflake', [
      lead('Symetrie soustavy napoví tvar módů ještě před výpočtem. Pokud je soustava symetrická vůči zrcadlení, jsou módy buď symetrické, nebo antisymetrické.', 'Symmetry suggests the shape of the modes before any calculation. A mirror-symmetric system has modes that are either symmetric or antisymmetric.'),
      p('V **normálních souřadnicích** (souřadnicích jednotlivých módů) se pohybové rovnice rozpadnou na nezávislé harmonické oscilátory. Každý pohyb je jejich superpozice.', 'In **normal coordinates** (one per mode) the equations decouple into independent harmonic oscillators. Any motion is a superposition.'),
      phys('Molekula CO$_2$ má symetrický a antisymetrický podélný mód a ohybový mód – infračervená spektroskopie vidí jen některé z nich.', 'CO$_2$ has symmetric and antisymmetric stretch modes and a bending mode – infrared spectroscopy sees only some of them.'),
      check(tf(D('Obecný pohyb spřažené soustavy je superpozice normálních módů.', 'General motion of a coupled system is a superposition of normal modes.'), true, D('Módy tvoří bázi řešení.', 'The modes form a basis of solutions.'))),
    ]),
    step('9.3', D('Rayleighova–Ritzova metoda', 'The Rayleigh–Ritz method'), 'target', [
      lead('Nejnižší frekvenci můžeme odhadnout bez řešení determinantu: stačí rozumný odhad tvaru kmitu.', 'The lowest frequency can be estimated without solving a determinant – a sensible guess of the mode shape is enough.'),
      math('\\omega_0^2 \\le \\lambda(\\mathbf x) = \\dfrac{\\mathbf x^{\\mathrm T}K\\mathbf x}{\\mathbf x^{\\mathrm T}M\\mathbf x}'),
      p('Rayleighův podíl je **stacionární** ve vlastních vektorech, takže i hrubý odhad tvaru dá překvapivě přesnou frekvenci – chyba ve frekvenci je druhého řádu.', 'The Rayleigh quotient is **stationary** at eigenvectors, so even a rough guess gives a surprisingly accurate frequency – the error is second order.'),
      check(num(D('Pro $K = k\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}$, $M = mI$ a $\\mathbf x = (1, 1)$ je $\\lambda$ (v jednotkách $k/m$)?', 'For $K = k\\begin{pmatrix}2&-1\\\\-1&2\\end{pmatrix}$, $M = mI$ and $\\mathbf x = (1, 1)$, $\\lambda$ (in units of $k/m$) is?'), 1, D('$\\mathbf x^{\\mathrm T}K\\mathbf x = 2k$, $\\mathbf x^{\\mathrm T}M\\mathbf x = 2m$ → přesně $k/m$, protože jsme trefili mód.', '$\\mathbf x^{\\mathrm T}K\\mathbf x = 2k$, $\\mathbf x^{\\mathrm T}M\\mathbf x = 2m$ → exactly $k/m$, we hit the mode.'))),
    ]),
  ],
  quiz: [
    mcq(D('Normální mód je pohyb, při kterém…', 'A normal mode is a motion in which…'), [D('všechny části kmitají stejnou frekvencí', 'all parts oscillate at one frequency'), D('soustava stojí', 'the system is at rest'), D('se energie ztrácí', 'energy is lost'), D('kmitá jen jedno těleso', 'only one body moves')], 0, D('Definice normálního módu.', 'Definition of a normal mode.')),
    mcq(D('Frekvence módů získáme z…', 'Mode frequencies come from…'), ['$\\det(K - \\omega^2M) = 0$', '$K = M$', '$\\mathrm{Tr}\\,K = 0$', '$\\omega = k/m$'], 0, D('Zobecněná úloha na vlastní čísla.', 'A generalised eigenvalue problem.')),
    tf(D('Rayleighův podíl dává vždy horní odhad nejnižšího $\\omega^2$.', 'The Rayleigh quotient always gives an upper bound on the lowest $\\omega^2$.'), true, D('Minimum podílu je nejnižší vlastní číslo.', 'The minimum of the quotient is the lowest eigenvalue.')),
    num(D('Kolik normálních módů má soustava se 3 stupni volnosti?', 'How many normal modes does a system with 3 degrees of freedom have?'), 3, D('Tolik, kolik je stupňů volnosti.', 'As many as degrees of freedom.')),
    mcq(D('Poměr frekvencí dvou módů v příkladu se dvěma závažími je…', 'The ratio of the two mode frequencies in the two-mass example is…'), ['$\\sqrt3$', '$3$', '$2$', '$\\sqrt2$'], 0, D('$\\sqrt{3k/m}/\\sqrt{k/m}$.', '$\\sqrt{3k/m}/\\sqrt{k/m}$.')),
    tf(D('V normálních souřadnicích jsou pohybové rovnice nezávislé.', 'In normal coordinates the equations of motion are decoupled.'), true, D('Každá souřadnice je samostatný oscilátor.', 'Each coordinate is its own oscillator.')),
  ],
  glossary: [
    term('normální mód', 'normal mode', D('Kmit, při kterém celá soustava kmitá jednou frekvencí.', 'A motion with the whole system at one frequency.'), ''),
    term('normální souřadnice', 'normal coordinates', D('Souřadnice, v nichž se rovnice rozpojí.', 'Coordinates in which the equations decouple.'), ''),
    term('vlastní frekvence', 'natural frequency', D('Frekvence normálního módu.', 'The frequency of a normal mode.'), '\\omega'),
    term('matice tuhosti', 'stiffness matrix', D('Matice $K$ v rovnici $M\\ddot q = -Kq$.', 'The matrix $K$ in $M\\ddot q = -Kq$.'), 'K'),
    term('Rayleighův podíl', 'Rayleigh quotient', D('$\\mathbf x^{\\mathrm T}K\\mathbf x/\\mathbf x^{\\mathrm T}M\\mathbf x$.', '$\\mathbf x^{\\mathrm T}K\\mathbf x/\\mathbf x^{\\mathrm T}M\\mathbf x$.'), ''),
    term('spřažené oscilátory', 'coupled oscillators', D('Kmitající tělesa navzájem propojená.', 'Oscillators linked to each other.'), ''),
  ],
};
