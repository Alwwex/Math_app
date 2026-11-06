import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Grupa je matematika symetrie. Stačí čtyři axiomy a vyjde z nich překvapivě bohatá struktura – od otáčení trojúhelníku po permutace a krystaly.',
    'A group is the mathematics of symmetry. Four axioms yield a surprisingly rich structure – from rotating a triangle to permutations and crystals.'),
  steps: [
    step('28.1', D('Grupy', 'Groups'), 'snowflake', [
      def(D('Grupa', 'Group'), 'Množina $G$ s operací $\\bullet$ je grupa, když platí: (1) **uzavřenost** $X\\bullet Y \\in G$, (2) **asociativita**, (3) existuje **jednotkový prvek** $I$, (4) každý prvek má **inverzi** $X^{-1}$.', 'A set $G$ with an operation $\\bullet$ is a group if: (1) **closure** $X\\bullet Y \\in G$, (2) **associativity**, (3) an **identity** $I$ exists, (4) every element has an **inverse** $X^{-1}$.'),
      list(D('celá čísla se sčítáním (nekonečná grupa),', 'the integers under addition (an infinite group),'), D('otočení roviny o libovolný úhel (spojitá grupa),', 'rotations of the plane by any angle (a continuous group),'), D('$\\{1, i, -1, -i\\}$ s násobením (cyklická grupa řádu 4).', '$\\{1, i, -1, -i\\}$ under multiplication (cyclic group of order 4).')),
      check(tf(D('Přirozená čísla $\\{1, 2, 3, \\dots\\}$ se sčítáním tvoří grupu.', 'The natural numbers $\\{1, 2, 3, \\dots\\}$ under addition form a group.'), false, D('Chybí nula (jednotka) i inverze.', 'No identity (zero) and no inverses.'))),
    ]),
    step('28.2–28.3', D('Konečné a neabelovské grupy', 'Finite and non-Abelian groups'), 'triangle_ruler', [
      lead('Konečnou grupu popíše **Cayleyho tabulka** (tabulka násobení). Když $XY = YX$ pro všechny prvky, je grupa **abelovská** (komutativní).', 'A finite group is described by its **Cayley table**. If $XY = YX$ for all elements, the group is **Abelian** (commutative).'),
      p('Symetrie rovnostranného trojúhelníku – 3 otočení a 3 překlopení – tvoří nejmenší **neabelovskou** grupu ($C_{3v}$ neboli $S_3$, řád 6). Vyzkoušej, že záleží na pořadí:', 'The symmetries of an equilateral triangle – 3 rotations and 3 reflections – form the smallest **non-Abelian** group ($C_{3v}$, i.e. $S_3$, order 6). See that order matters:'),
      widget('groupTriangle'),
      tip('V každém řádku i sloupci Cayleyho tabulky je každý prvek přesně jednou – jako v sudoku.', 'Each element appears exactly once in every row and column of a Cayley table – like sudoku.'),
      check(num(D('Kolik prvků má grupa symetrií čtverce?', 'How many elements in the symmetry group of a square?'), 8, D('4 otočení + 4 překlopení.', '4 rotations + 4 reflections.'))),
    ]),
    step('28.4', D('Permutační grupy', 'Permutation groups'), 'link', [
      lead('Permutace $n$ objektů tvoří **symetrickou grupu** $S_n$ řádu $n!$. Zapisujeme je v **cyklech**: $(1\\,2\\,3)$ pošle 1→2→3→1.', 'Permutations of $n$ objects form the **symmetric group** $S_n$ of order $n!$. Write them as **cycles**: $(1\\,2\\,3)$ sends 1→2→3→1.'),
      p('Každá permutace je součin transpozic (výměn dvou prvků). Parita tohoto počtu je jednoznačná – permutace jsou **sudé** nebo **liché**.', 'Every permutation is a product of transpositions (swaps). The parity of their number is fixed – permutations are **even** or **odd**.'),
      check(num(D('Řád grupy $S_4$?', 'Order of $S_4$?'), 24, D('$4! = 24$.', '$4! = 24$.'))),
    ]),
    step('28.5–28.6', D('Homomorfismy a podgrupy', 'Homomorphisms and subgroups'), 'puzzle', [
      lead('**Izomorfní** grupy mají stejnou strukturu, jen jinak pojmenované prvky. **Homomorfismus** zachovává násobení, ale může prvky „slepit".', '**Isomorphic** groups have the same structure with renamed elements. A **homomorphism** preserves multiplication but may merge elements.'),
      def(D('Lagrangeova věta', 'Lagrange’s theorem'), 'Řád každé podgrupy dělí řád grupy. Proto grupa prvočíselného řádu nemá netriviální podgrupy a je cyklická.', 'The order of any subgroup divides the order of the group. So a group of prime order has no non-trivial subgroups and is cyclic.'),
      check(mcq(D('Může mít grupa řádu 6 podgrupu řádu 4?', 'Can a group of order 6 have a subgroup of order 4?'), [D('ne', 'no'), D('ano', 'yes'), D('jen abelovská', 'only if Abelian'), D('jen nekonečná', 'only infinite')], 0, D('4 nedělí 6.', '4 does not divide 6.'))),
    ]),
    step('28.7', D('Třídy konjugace a rozklady', 'Conjugacy classes and cosets'), 'gem', [
      lead('Prvky $X$ a $Y$ jsou **konjugované**, když $Y = GXG^{-1}$ pro nějaké $G$ – jsou to „stejné operace z jiného úhlu pohledu". Grupa se rozpadne na **třídy konjugace**.', 'Elements $X$ and $Y$ are **conjugate** if $Y = GXG^{-1}$ for some $G$ – the “same operation seen from another viewpoint”. The group splits into **conjugacy classes**.'),
      p('V $C_{3v}$ jsou tři třídy: $\\{I\\}$, obě otočení $\\{R, R^2\\}$ a všechna tři překlopení $\\{K, L, M\\}$. Počet tříd bude v další kapitole klíčový.', 'In $C_{3v}$ there are three classes: $\\{I\\}$, both rotations $\\{R, R^2\\}$ and all three reflections $\\{K, L, M\\}$. The number of classes will be key in the next chapter.'),
      check(num(D('Kolik tříd konjugace má abelovská grupa řádu 5?', 'How many conjugacy classes in an Abelian group of order 5?'), 5, D('V abelovské grupě je každý prvek sám ve své třídě.', 'In an Abelian group each element is its own class.'))),
    ]),
  ],
  quiz: [
    mcq(D('Který axiom grupy NEPATŘÍ mezi čtyři základní?', 'Which is NOT one of the four group axioms?'), [D('komutativita', 'commutativity'), D('uzavřenost', 'closure'), D('jednotkový prvek', 'identity'), D('inverze', 'inverse')], 0, D('Komutativita platí jen u abelovských grup.', 'Commutativity holds only in Abelian groups.')),
    tf(D('Grupa symetrií rovnostranného trojúhelníku je abelovská.', 'The symmetry group of an equilateral triangle is Abelian.'), false, D('Otočení a překlopení nekomutují.', 'Rotations and reflections do not commute.')),
    num(D('Řád grupy $S_3$?', 'Order of $S_3$?'), 6, D('$3! = 6$.', '$3! = 6$.')),
    mcq(D('Grupa prvočíselného řádu je vždy…', 'A group of prime order is always…'), [D('cyklická', 'cyclic'), D('neabelovská', 'non-Abelian'), D('nekonečná', 'infinite'), D('triviální', 'trivial')], 0, D('Lagrangeova věta.', 'Lagrange’s theorem.')),
    mcq(D('Permutace $(1\\,2)(3\\,4)$ je…', 'The permutation $(1\\,2)(3\\,4)$ is…'), [D('sudá', 'even'), D('lichá', 'odd'), D('cyklus délky 4', 'a 4-cycle'), D('identita', 'the identity')], 0, D('Dvě transpozice.', 'Two transpositions.')),
    num(D('Kolik tříd konjugace má $C_{3v}$?', 'How many conjugacy classes has $C_{3v}$?'), 3, D('$\\{I\\}, \\{R, R^2\\}, \\{K, L, M\\}$.', '$\\{I\\}, \\{R, R^2\\}, \\{K, L, M\\}$.')),
  ],
  glossary: [
    term('grupa', 'group', D('Množina s operací splňující 4 axiomy.', 'A set with an operation satisfying 4 axioms.'), ''),
    term('řád grupy', 'order of a group', D('Počet prvků grupy.', 'The number of elements.'), ''),
    term('abelovská grupa', 'Abelian group', D('Komutativní grupa.', 'A commutative group.'), ''),
    term('Cayleyho tabulka', 'Cayley table', D('Tabulka násobení grupy.', 'The multiplication table of a group.'), ''),
    term('podgrupa', 'subgroup', D('Podmnožina, která je sama grupou.', 'A subset that is itself a group.'), ''),
    term('izomorfismus', 'isomorphism', D('Vzájemně jednoznačné zobrazení zachovávající násobení.', 'A bijection preserving multiplication.'), ''),
    term('homomorfismus', 'homomorphism', D('Zobrazení zachovávající násobení.', 'A multiplication-preserving map.'), ''),
    term('třída konjugace', 'conjugacy class', D('Prvky tvaru $GXG^{-1}$.', 'Elements of the form $GXG^{-1}$.'), ''),
    term('permutace', 'permutation', D('Přeuspořádání prvků.', 'A rearrangement of objects.'), ''),
  ],
};
