import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Tenzory jsou objekty, které se při otočení souřadnic transformují předepsaným způsobem. Popisují napětí, setrvačnost, vodivost – a v obecných souřadnicích i zakřivený prostor.',
    'Tensors are objects that transform in a prescribed way when coordinates rotate. They describe stress, inertia, conductivity – and in general coordinates even curved space.'),
  steps: [
    step('26.1–26.4', D('Značení a změna báze', 'Notation and change of basis'), 'ice', [
      lead('**Sumační konvence**: přes opakovaný index se automaticky sčítá. $a_ib_i$ znamená $\\sum_i a_ib_i$.', '**Summation convention**: a repeated index is summed. $a_ib_i$ means $\\sum_i a_ib_i$.'),
      math('x_i\' = L_{ij}\\,x_j,\\qquad L_{ik}L_{jk} = \\delta_{ij}'),
      p('Matice otočení $L$ je ortogonální. **Vektor** (tenzor 1. řádu) je cokoli, co se transformuje jako $x_i$; **skalár** (tenzor 0. řádu) se nemění vůbec.', 'The rotation matrix $L$ is orthogonal. A **vector** (first-order tensor) is anything transforming like $x_i$; a **scalar** (zero-order tensor) does not change at all.'),
      widget('matrix2d'),
      check(num(D('Kolik je $\\delta_{ii}$ ve 3D (se sumací)?', 'What is $\\delta_{ii}$ in 3D (summed)?'), 3, D('$\\delta_{11} + \\delta_{22} + \\delta_{33}$.', '$\\delta_{11} + \\delta_{22} + \\delta_{33}$.'))),
    ]),
    step('26.5–26.7', D('Tenzory druhého řádu a podílové pravidlo', 'Second-order tensors and the quotient law'), 'numbers', [
      math("T_{ij}' = L_{ik}L_{jl}\\,T_{kl}"),
      p('Tenzor 2. řádu je „zobrazení vektorů na vektory", které nezávisí na souřadnicích. Sčítáme je po složkách, násobíme **vnějším součinem** $a_ib_j$ a **zúžením** (kontrakcí) $T_{ii}$ dostaneme skalár.', 'A second-order tensor is a coordinate-free map of vectors to vectors. Add componentwise, multiply by the **outer product** $a_ib_j$, and **contraction** $T_{ii}$ gives a scalar.'),
      tip('**Podílové pravidlo**: když $T_{ij}b_j$ je vektor pro každý vektor $\\mathbf b$, je $T_{ij}$ tenzor. Tak poznáš tenzory ve fyzice.', '**Quotient law**: if $T_{ij}b_j$ is a vector for every vector $\\mathbf b$, then $T_{ij}$ is a tensor. That is how tensors are recognised in physics.'),
      check(tf(D('Stopa tenzoru $T_{ii}$ je skalár.', 'The trace $T_{ii}$ is a scalar.'), true, D('Nezávisí na otočení souřadnic.', 'Independent of coordinate rotations.'))),
    ]),
    step('26.8–26.11', D('Tenzory δ a ε, izotropie, pseudotenzory', 'δ and ε, isotropy, pseudotensors'), 'snowflake', [
      lead('Kroneckerovo $\\delta_{ij}$ a Levi-Civitův symbol $\\varepsilon_{ijk}$ jsou **izotropní** – ve všech otočených soustavách mají stejné složky.', 'The Kronecker $\\delta_{ij}$ and Levi-Civita $\\varepsilon_{ijk}$ are **isotropic** – same components in every rotated frame.'),
      math('(\\mathbf a\\times\\mathbf b)_i = \\varepsilon_{ijk}a_jb_k,\\qquad \\varepsilon_{ijk}\\varepsilon_{klm} = \\delta_{il}\\delta_{jm} - \\delta_{im}\\delta_{jl}'),
      p('Poslední identita dokáže většinu vektorových vzorců (např. „BAC − CAB") na dva řádky. Vektorový součin je **pseudovektor**: při zrcadlení se chová jinak než obyčejný vektor.', 'The last identity proves most vector formulae (e.g. “BAC − CAB”) in two lines. The vector product is a **pseudovector**: it behaves differently under reflection.'),
      check(num(D('$\\varepsilon_{123} + \\varepsilon_{213} = ?$', '$\\varepsilon_{123} + \\varepsilon_{213} = ?$'), 0, D('$1 + (-1)$.', '$1 + (-1)$.'))),
    ]),
    step('26.12–26.13', D('Fyzikální tenzory', 'Physical tensors'), 'atom', [
      list(D('**tenzor setrvačnosti** $I_{ij}$: $L_i = I_{ij}\\omega_j$ – moment hybnosti nemusí mířit podél osy otáčení,', '**inertia tensor** $I_{ij}$: $L_i = I_{ij}\\omega_j$ – angular momentum need not point along the rotation axis,'),
        D('**tenzor vodivosti** $\\sigma_{ij}$: $J_i = \\sigma_{ij}E_j$ – v krystalu proud nemusí téct ve směru pole,', '**conductivity tensor** $\\sigma_{ij}$: $J_i = \\sigma_{ij}E_j$ – in a crystal current need not follow the field,'),
        D('**tenzor napětí** $p_{ij}$ a **deformace** $e_{ij}$: zobecněný Hookův zákon.', '**stress** $p_{ij}$ and **strain** $e_{ij}$ tensors: generalised Hooke’s law.')),
      p('Symetrický tenzor má vždy tři navzájem kolmé **hlavní osy** – v nich je diagonální (vlastní vektory z kapitoly 8).', 'A symmetric tensor always has three perpendicular **principal axes** in which it is diagonal (eigenvectors from Chapter 8).'),
      check(mcq(D('V hlavních osách je symetrický tenzor…', 'In its principal axes a symmetric tensor is…'), [D('diagonální', 'diagonal'), D('nulový', 'zero'), D('antisymetrický', 'antisymmetric'), D('jednotkový', 'the identity')], 0, D('Diagonalizace.', 'Diagonalisation.'))),
    ]),
    step('26.14–26.22', D('Obecné souřadnice a metrický tenzor', 'General coordinates and the metric tensor'), 'galaxy', [
      lead('V křivočarých souřadnicích rozlišujeme **kontravariantní** složky $v^i$ a **kovariantní** $v_i$. Převádí mezi nimi **metrický tenzor** $g_{ij}$.', 'In curvilinear coordinates we distinguish **contravariant** components $v^i$ and **covariant** $v_i$. The **metric tensor** $g_{ij}$ converts between them.'),
      math('ds^2 = g_{ij}\\,dx^i\\,dx^j,\\qquad v_i = g_{ij}v^j'),
      p('Bázové vektory se mění bod od bodu, proto obyčejná derivace složek nestačí. **Christoffelovy symboly** $\\Gamma^k_{ij}$ opraví derivaci na **kovariantní**. Nejkratší čáry jsou **geodetiky**.', 'Basis vectors vary from point to point, so plain derivatives of components are not enough. **Christoffel symbols** $\\Gamma^k_{ij}$ fix this into the **covariant derivative**. Shortest lines are **geodesics**.'),
      phys('Obecná teorie relativity: gravitace = zakřivení časoprostoru, tělesa se pohybují po geodetikách metriky $g_{\\mu\\nu}$.', 'General relativity: gravity = spacetime curvature; bodies follow geodesics of the metric $g_{\\mu\\nu}$.'),
      check(mcq(D('Metrický tenzor v polárních souřadnicích $(r, \\theta)$ je…', 'The metric in polar coordinates $(r, \\theta)$ is…'), ['$\\mathrm{diag}(1, r^2)$', '$\\mathrm{diag}(1, 1)$', '$\\mathrm{diag}(r, 1)$', '$\\mathrm{diag}(1, r)$'], 0, D('$ds^2 = dr^2 + r^2d\\theta^2$.', '$ds^2 = dr^2 + r^2d\\theta^2$.'))),
    ]),
  ],
  quiz: [
    mcq(D('$a_ib_i$ v sumační konvenci znamená…', '$a_ib_i$ in the summation convention means…'), [D('skalární součin', 'the scalar product'), D('jednu složku', 'one component'), D('vektorový součin', 'the vector product'), D('matici', 'a matrix')], 0, D('Sčítá se přes $i$.', 'Summed over $i$.')),
    num(D('$\\delta_{ij}\\delta_{ij}$ ve 3D?', '$\\delta_{ij}\\delta_{ij}$ in 3D?'), 3, D('$\\delta_{ii} = 3$.', '$\\delta_{ii} = 3$.')),
    mcq(D('$\\varepsilon_{ijk}$ při záměně dvou indexů…', '$\\varepsilon_{ijk}$ under swapping two indices…'), [D('změní znaménko', 'changes sign'), D('se nezmění', 'is unchanged'), D('je nula', 'is zero'), D('se zdvojnásobí', 'doubles')], 0, D('Je úplně antisymetrický.', 'It is totally antisymmetric.')),
    tf(D('Vektorový součin dvou vektorů je pseudovektor.', 'The vector product of two vectors is a pseudovector.'), true, D('Při zrcadlení se chová opačně.', 'It behaves oppositely under reflection.')),
    mcq(D('Kolik složek má tenzor 2. řádu ve 3D?', 'How many components does a second-order tensor have in 3D?'), ['9', '3', '6', '27'], 0, D('$3^2$.', '$3^2$.')),
    mcq(D('Christoffelovy symboly opravují…', 'Christoffel symbols correct…'), [D('derivaci v křivočarých souřadnicích', 'differentiation in curvilinear coordinates'), D('sčítání tenzorů', 'tensor addition'), D('stopu', 'the trace'), D('determinant', 'the determinant')], 0, D('Kovariantní derivace.', 'The covariant derivative.')),
    tf(D('Moment hybnosti tuhého tělesa vždy míří podél osy otáčení.', 'The angular momentum of a rigid body always points along the rotation axis.'), false, D('Jen podél hlavních os tenzoru setrvačnosti.', 'Only along principal axes of the inertia tensor.')),
  ],
  glossary: [
    term('tenzor', 'tensor', D('Objekt s předepsaným transformačním zákonem.', 'An object with a prescribed transformation law.'), 'T_{ij}'),
    term('sumační konvence', 'summation convention', D('Přes opakovaný index se sčítá.', 'Repeated indices are summed.'), ''),
    term('Kroneckerovo delta', 'Kronecker delta', D('$1$ pro $i = j$, jinak $0$.', '$1$ if $i = j$, else $0$.'), '\\delta_{ij}'),
    term('Levi-Civitův symbol', 'Levi-Civita symbol', D('Úplně antisymetrický symbol $\\varepsilon_{ijk}$.', 'The totally antisymmetric $\\varepsilon_{ijk}$.'), ''),
    term('izotropní tenzor', 'isotropic tensor', D('Stejné složky ve všech otočených soustavách.', 'Same components in all rotated frames.'), ''),
    term('pseudovektor', 'pseudovector', D('Vektor měnící znaménko jinak při zrcadlení.', 'A vector with odd reflection behaviour.'), ''),
    term('metrický tenzor', 'metric tensor', D('$g_{ij}$ v $ds^2 = g_{ij}dx^idx^j$.', '$g_{ij}$ in $ds^2 = g_{ij}dx^idx^j$.'), ''),
    term('kovariantní derivace', 'covariant derivative', D('Derivace respektující proměnnou bázi.', 'A derivative accounting for the varying basis.'), ''),
    term('geodetika', 'geodesic', D('Nejkratší čára v zakřiveném prostoru.', 'The shortest line in curved space.'), ''),
    term('hlavní osy', 'principal axes', D('Osy, v nichž je symetrický tenzor diagonální.', 'Axes where a symmetric tensor is diagonal.'), ''),
  ],
};
