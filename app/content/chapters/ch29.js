import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Reprezentace převádí abstraktní grupu na matice. Z tabulky charakterů pak bez počítání vyčteš, které molekuly mají dipólový moment, které kmity jsou vidět v infračerveném spektru nebo proč jsou hladiny degenerované.',
    'A representation turns an abstract group into matrices. From the character table you can read off – without calculation – which molecules have dipole moments, which vibrations are infrared-active, and why levels are degenerate.'),
  steps: [
    step('29.1–29.2', D('Proč reprezentace', 'Why representations'), 'testtube', [
      lead('Molekula se symetrií $G$: každá operace symetrie nechá fyzikální veličiny beze změny. Dipólový moment musí ležet ve všech prvcích symetrie – to už často vylučuje, že by existoval.', 'A molecule with symmetry $G$: every symmetry operation leaves physical quantities unchanged. The dipole moment must lie in every symmetry element – which often rules it out entirely.'),
      def(D('Reprezentace', 'Representation'), 'Reprezentace grupy je přiřazení $X \\mapsto D(X)$ matic tak, že se zachová násobení: $D(XY) = D(X)D(Y)$.', 'A representation assigns matrices $X \\mapsto D(X)$ preserving multiplication: $D(XY) = D(X)D(Y)$.'),
      phys('Molekula se středem symetrie (např. CO$_2$) nemůže mít stálý dipólový moment.', 'A molecule with a centre of symmetry (e.g. CO$_2$) cannot have a permanent dipole.'),
      check(tf(D('Molekula CH$_4$ (tetraedr) má nenulový dipólový moment.', 'CH$_4$ (tetrahedral) has a non-zero dipole moment.'), false, D('Vysoká symetrie dipól vylučuje.', 'Its high symmetry rules it out.'))),
    ]),
    step('29.3–29.4', D('Ekvivalentní a ireducibilní reprezentace', 'Equivalent and irreducible representations'), 'puzzle', [
      lead('Reprezentace jsou **ekvivalentní**, když se liší jen volbou báze: $D\'(X) = QD(X)Q^{-1}$. Reprezentace je **reducibilní**, když jde v nějaké bázi rozložit na bloky.', 'Representations are **equivalent** if they differ only by a change of basis: $D\'(X) = QD(X)Q^{-1}$. A representation is **reducible** if some basis splits it into blocks.'),
      p('Každá reprezentace konečné grupy je součtem **ireducibilních** (irepů) – „atomů", ze kterých se vše skládá.', 'Every representation of a finite group is a sum of **irreducible** ones (irreps) – the atoms everything is built from.'),
      check(mcq(D('Ireducibilní reprezentace…', 'An irreducible representation…'), [D('nejde rozložit na menší bloky', 'cannot be split into smaller blocks'), D('je vždy jednorozměrná', 'is always one-dimensional'), D('je jen pro abelovské grupy', 'exists only for Abelian groups'), D('má nulový charakter', 'has zero character')], 0, D('Definice.', 'Definition.'))),
    ]),
    step('29.5–29.8', D('Charaktery a tabulka charakterů', 'Characters and the character table'), 'numbers', [
      lead('**Charakter** je stopa matice $\\chi(X) = \\mathrm{Tr}\\,D(X)$. Je stejný pro celou třídu konjugace a nezávisí na bázi.', 'The **character** is the trace $\\chi(X) = \\mathrm{Tr}\\,D(X)$. It is the same across a conjugacy class and basis independent.'),
      list(D('počet irepů = počet tříd konjugace,', 'number of irreps = number of conjugacy classes,'), D('$\\sum_i n_i^2 = g$ (součet čtverců dimenzí = řád grupy),', '$\\sum_i n_i^2 = g$ (sum of squared dimensions = group order),'), D('charaktery různých irepů jsou ortogonální.', 'characters of different irreps are orthogonal.')),
      math('\\begin{array}{c|ccc} C_{3v} & I & 2C_3 & 3\\sigma_v \\\\ \\hline A_1 & 1 & 1 & 1 \\\\ A_2 & 1 & 1 & -1 \\\\ E & 2 & -1 & 0 \\end{array}'),
      example(D('Kolikrát obsahuje reprezentace daný irep', 'How often an irrep occurs'), D('Reprezentace $\\Gamma$ grupy $C_{3v}$ má charaktery $(3, 0, 1)$. Rozlož ji.', 'A representation $\\Gamma$ of $C_{3v}$ has characters $(3, 0, 1)$. Decompose it.'),
        [D('$m_i = \\frac1g\\sum_X \\chi^{(i)}(X)^*\\chi(X)$ s $g = 6$.', '$m_i = \\frac1g\\sum_X \\chi^{(i)}(X)^*\\chi(X)$ with $g = 6$.'),
         D('$A_1$: $\\frac16(3 + 0 + 3\\cdot1) = 1$; $A_2$: $\\frac16(3 - 3) = 0$; $E$: $\\frac16(6 + 0 + 0) = 1$.', '$A_1$: $\\frac16(3 + 0 + 3\\cdot1) = 1$; $A_2$: $\\frac16(3 - 3) = 0$; $E$: $\\frac16(6 + 0 + 0) = 1$.')],
        '$\\Gamma = A_1 \\oplus E$'),
      check(num(D('$C_{3v}$ má irepy dimenzí 1, 1 a 2. Kolik je $1^2 + 1^2 + 2^2$?', '$C_{3v}$ has irreps of dimensions 1, 1, 2. What is $1^2 + 1^2 + 2^2$?'), 6, D('= řád grupy.', '= the group order.'))),
    ]),
    step('29.9–29.11', D('Součinové reprezentace a výběrová pravidla', 'Product representations and selection rules'), 'atom', [
      lead('Maticový element $\\langle\\psi_f|\\hat O|\\psi_i\\rangle$ může být nenulový, jen když součin reprezentací $\\Gamma_f\\otimes\\Gamma_O\\otimes\\Gamma_i$ obsahuje úplně symetrický irep.', 'A matrix element $\\langle\\psi_f|\\hat O|\\psi_i\\rangle$ can be non-zero only if $\\Gamma_f\\otimes\\Gamma_O\\otimes\\Gamma_i$ contains the totally symmetric irrep.'),
      p('Odtud **výběrová pravidla** spektroskopie: které přechody jsou „povolené" a které „zakázané". Rozměr irepu zase říká, kolikrát je energetická hladina **degenerovaná**.', 'Hence the **selection rules** of spectroscopy: which transitions are “allowed” and “forbidden”. The dimension of an irrep tells how many times an energy level is **degenerate**.'),
      check(tf(D('Dvojrozměrný irep znamená dvojnásobně degenerovanou hladinu.', 'A two-dimensional irrep means a doubly degenerate level.'), true, D('Stavy se symetrií navzájem mísí.', 'The states mix under symmetry.'))),
    ]),
  ],
  quiz: [
    mcq(D('Charakter reprezentace je…', 'The character of a representation is…'), [D('stopa matice', 'the trace of the matrix'), D('determinant', 'the determinant'), D('největší prvek', 'the largest entry'), D('řád grupy', 'the group order')], 0, D('$\\chi = \\mathrm{Tr}\\,D$.', '$\\chi = \\mathrm{Tr}\\,D$.')),
    mcq(D('Počet irepů konečné grupy je roven…', 'The number of irreps of a finite group equals…'), [D('počtu tříd konjugace', 'the number of conjugacy classes'), D('řádu grupy', 'the group order'), D('počtu podgrup', 'the number of subgroups'), '2'], 0, D('Základní věta.', 'A key theorem.')),
    num(D('Abelovská grupa řádu 4 má kolik irepů?', 'An Abelian group of order 4 has how many irreps?'), 4, D('Každá třída je jeden prvek → 4 jednorozměrné irepy.', 'Each class is one element → 4 one-dimensional irreps.')),
    tf(D('Charakter identity $\\chi(I)$ je dimenze reprezentace.', 'The character of the identity $\\chi(I)$ is the dimension of the representation.'), true, D('Stopa jednotkové matice.', 'The trace of the identity matrix.')),
    mcq(D('Reprezentace s charaktery $(2, 2, 0)$ v $C_{3v}$ se rozloží jako…', 'A $C_{3v}$ representation with characters $(2, 2, 0)$ decomposes as…'), ['$A_1 \\oplus A_2$', '$E$', '$2A_1$', '$A_2 \\oplus E$'], 0, D('$m_{A_1} = \\frac16(2 + 4) = 1$, $m_{A_2} = 1$, $m_E = \\frac16(4 - 4) = 0$.', '$m_{A_1} = \\frac16(2 + 4) = 1$, $m_{A_2} = 1$, $m_E = \\frac16(4 - 4) = 0$.')),
    mcq(D('Výběrová pravidla plynou z…', 'Selection rules follow from…'), [D('součinových reprezentací', 'product representations'), D('determinantu', 'the determinant'), D('Lagrangeovy věty', 'Lagrange’s theorem'), D('Stirlingova vzorce', 'Stirling’s formula')], 0, D('Musí obsahovat úplně symetrický irep.', 'They must contain the totally symmetric irrep.')),
  ],
  glossary: [
    term('reprezentace grupy', 'group representation', D('Přiřazení matic prvkům grupy zachovávající násobení.', 'Matrices assigned to group elements, preserving multiplication.'), 'D(X)'),
    term('ireducibilní reprezentace', 'irreducible representation', D('Reprezentace, kterou nejde rozložit.', 'One that cannot be decomposed.'), 'irrep'),
    term('charakter', 'character', D('Stopa reprezentační matice.', 'The trace of a representation matrix.'), '\\chi'),
    term('tabulka charakterů', 'character table', D('Charaktery všech irepů ve všech třídách.', 'Characters of all irreps on all classes.'), ''),
    term('degenerace', 'degeneracy', D('Víc stavů se stejnou energií.', 'Several states with the same energy.'), ''),
    term('výběrové pravidlo', 'selection rule', D('Podmínka, kdy je přechod povolený.', 'When a transition is allowed.'), ''),
    term('dipólový moment', 'dipole moment', D('Míra oddělení kladného a záporného náboje.', 'Separation of positive and negative charge.'), ''),
  ],
};
