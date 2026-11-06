// Kapitola 1, část 1: Funkce a jejich grafy / Functions and Their Graphs
// Obsah je dvojjazyčný: { cs, en }. Matematika v $…$ (KaTeX).

const D = (cs, en) => ({ cs, en });

export const glossary = [
  { id: 'funkce', cs: 'funkce', en: 'function', def: D('Pravidlo, které každému vstupu přiřadí právě jeden výstup.', 'A rule that assigns exactly one output to each input.'), ex: 'f(x) = 2x + 1' },
  { id: 'definiční obor', cs: 'definiční obor', en: 'domain', def: D('Množina všech přípustných vstupů funkce, značíme $D(f)$.', 'The set of all allowed inputs of a function.'), ex: 'D(\\sqrt{x}) = \\langle 0, \\infty)' },
  { id: 'obor hodnot', cs: 'obor hodnot', en: 'range', def: D('Množina všech výstupů, které funkce opravdu nabývá, značíme $H(f)$.', 'The set of all outputs the function actually takes.'), ex: 'H(x^2) = \\langle 0, \\infty)' },
  { id: 'nezávisle proměnná', cs: 'nezávisle proměnná', en: 'independent variable', def: D('Vstup funkce – číslo, které volíme ($x$).', 'The input of a function – the number we choose ($x$).'), ex: 'x' },
  { id: 'závisle proměnná', cs: 'závisle proměnná', en: 'dependent variable', def: D('Výstup funkce – závisí na vstupu ($y = f(x)$).', 'The output – it depends on the input ($y = f(x)$).'), ex: 'y = f(x)' },
  { id: 'funkční hodnota', cs: 'funkční hodnota', en: 'value of a function', def: D('Číslo $f(a)$, které funkce přiřadí vstupu $a$.', 'The number $f(a)$ that the function assigns to the input $a$.'), ex: 'f(3) = 7' },
  { id: 'graf funkce', cs: 'graf funkce', en: 'graph of a function', def: D('Množina všech bodů $[x, f(x)]$ v rovině.', 'The set of all points $(x, f(x))$ in the plane.'), ex: '\\{[x, f(x)] : x \\in D(f)\\}' },
  { id: 'test svislou přímkou', cs: 'test svislou přímkou', en: 'vertical line test', def: D('Křivka je grafem funkce, když ji žádná svislá přímka neprotne víc než jednou.', 'A curve is the graph of a function if no vertical line meets it more than once.'), ex: 'x = a' },
  { id: 'funkce po částech', cs: 'funkce definovaná po částech', en: 'piecewise defined function', def: D('Funkce daná různými předpisy na různých částech definičního oboru.', 'A function given by different formulas on different parts of its domain.'), ex: '|x|' },
  { id: 'absolutní hodnota', cs: 'absolutní hodnota', en: 'absolute value', def: D('Vzdálenost čísla od nuly na číselné ose; $|a| \\ge 0$.', 'The distance of a number from zero on the number line; $|a| \\ge 0$.'), ex: '|-5| = 5' },
  { id: 'sudá funkce', cs: 'sudá funkce', en: 'even function', def: D('Platí $f(-x) = f(x)$; graf je souměrný podle osy $y$.', '$f(-x) = f(x)$; the graph is symmetric about the $y$-axis.'), ex: 'x^2,\\ \\cos x' },
  { id: 'lichá funkce', cs: 'lichá funkce', en: 'odd function', def: D('Platí $f(-x) = -f(x)$; graf je souměrný podle počátku.', '$f(-x) = -f(x)$; the graph is symmetric about the origin.'), ex: 'x^3,\\ \\sin x' },
  { id: 'rostoucí', cs: 'rostoucí funkce', en: 'increasing function', def: D('Pro $x_1 < x_2$ platí $f(x_1) < f(x_2)$ – graf zleva doprava stoupá.', 'If $x_1 < x_2$ then $f(x_1) < f(x_2)$ – the graph rises from left to right.'), ex: '2x + 1' },
  { id: 'klesající', cs: 'klesající funkce', en: 'decreasing function', def: D('Pro $x_1 < x_2$ platí $f(x_1) > f(x_2)$ – graf zleva doprava klesá.', 'If $x_1 < x_2$ then $f(x_1) > f(x_2)$ – the graph falls from left to right.'), ex: '-x + 3' },
  { id: 'reálná čísla', cs: 'reálná čísla', en: 'real numbers', def: D('Všechna čísla na číselné ose, značíme $\\mathbb{R}$.', 'All numbers on the number line, written $\\mathbb{R}$.'), ex: '\\mathbb{R}' },
  { id: 'interval', cs: 'interval', en: 'interval', def: D('Souvislá část číselné osy, např. $\\langle 0, 3)$.', 'A connected piece of the number line, e.g. $[0, 3)$.'), ex: '\\langle a, b \\rangle' },
  { id: 'množina', cs: 'množina', en: 'set', def: D('Soubor objektů (prvků), např. $\\{1, 2, 3\\}$.', 'A collection of objects (elements), e.g. $\\{1, 2, 3\\}$.'), ex: '\\{1, 2, 3\\}' },
  { id: 'uspořádaná dvojice', cs: 'uspořádaná dvojice', en: 'ordered pair', def: D('Dvojice čísel, u které záleží na pořadí: $[2, 5] \\ne [5, 2]$.', 'A pair of numbers where order matters: $(2, 5) \\ne (5, 2)$.'), ex: '[x, y]' },
  { id: 'počátek', cs: 'počátek soustavy souřadnic', en: 'origin', def: D('Průsečík os $x$ a $y$, bod $[0, 0]$.', 'Where the $x$- and $y$-axes cross, the point $(0, 0)$.'), ex: 'O[0, 0]' },
  { id: 'souměrnost', cs: 'souměrnost', en: 'symmetry', def: D('Graf vypadá stejně po překlopení (podle osy) nebo otočení (kolem bodu).', 'The graph looks the same after a reflection or a rotation.'), ex: '' },
  { id: 'dosadit', cs: 'dosadit', en: 'to substitute (plug in)', def: D('Nahradit proměnnou konkrétním číslem nebo výrazem.', 'To replace a variable by a number or an expression.'), ex: 'f(2) = 2\\cdot 2 + 1' },
  { id: 'jmenovatel', cs: 'jmenovatel', en: 'denominator', def: D('Spodní část zlomku. Nesmí být nula!', 'The bottom part of a fraction. It must not be zero!'), ex: '\\frac{a}{b},\\ b \\ne 0' },
  { id: 'odmocnina', cs: 'druhá odmocnina', en: 'square root', def: D('Nezáporné číslo, jehož druhá mocnina je dané číslo. Jen z čísel $\\ge 0$.', 'The non-negative number whose square is the given number. Only for numbers $\\ge 0$.'), ex: '\\sqrt{9} = 3' },
  { id: 'průsečík', cs: 'průsečík', en: 'intersection point', def: D('Bod, ve kterém se dvě křivky (nebo přímky) protínají.', 'A point where two curves (or lines) cross.'), ex: '' },
];

export const steps = [
  // ------------------------------------------------------------------ 1
  {
    id: 'co-je-funkce',
    title: D('Co je funkce?', 'What is a function?'),
    icon: '⚙️',
    blocks: [
      { t: 'lead', ...D(
        'Funkce je **pravidlo**, které každému vstupu přiřadí **právě jeden** výstup. Představ si ji jako stroj: vhodíš do něj číslo, stroj ho zpracuje podle svého předpisu a vypadne jiné číslo.',
        'A function is a **rule** that assigns to each input **exactly one** output. Think of it as a machine: you drop a number in, the machine processes it according to its formula, and another number comes out.') },
      { t: 'widget', name: 'functionMachine' },
      { t: 'def', title: D('Definice funkce', 'Definition of a function'), ...D(
        '[[funkce|Funkce]] $f$ je pravidlo, které každému prvku $x$ z množiny $D$ přiřadí **právě jedno** číslo $f(x)$. Množina $D$ se nazývá [[definiční obor]] funkce $f$ a značí se $D(f)$.',
        'A [[funkce|function]] $f$ is a rule that assigns to each element $x$ of a set $D$ **exactly one** number $f(x)$. The set $D$ is called the [[definiční obor|domain]] of $f$.') },
      { t: 'p', ...D(
        'Číslo $x$ je [[nezávisle proměnná]] – můžeme ho volit. Výsledek $y = f(x)$ je [[závisle proměnná]], protože na $x$ závisí. Číslu $f(a)$ říkáme [[funkční hodnota]] funkce $f$ v bodě $a$.',
        'The number $x$ is the [[nezávisle proměnná|independent variable]] – we get to choose it. The result $y = f(x)$ is the [[závisle proměnná|dependent variable]], because it depends on $x$. The number $f(a)$ is the [[funkční hodnota|value]] of $f$ at $a$.') },
      { t: 'note', kind: 'lang', ...D(
        '$f(x)$ se čte *„f of x"*, $f(2) = 7$ je *„f of two equals seven"*. Vstup = **input**, výstup = **output**, dosadit = **to plug in / substitute**.',
        '$f(x)$ is read *„f od x"* or *„f v bodě x"*. Input = **vstup**, output = **výstup**, to plug in = **dosadit**.') },
      { t: 'example', title: D('Dosazování do funkce', 'Evaluating a function'),
        task: D('Je dána funkce $f(x) = x^2 - 3x + 2$. Vypočítej $f(4)$, $f(-1)$ a $f(a+1)$.', 'Let $f(x) = x^2 - 3x + 2$. Find $f(4)$, $f(-1)$ and $f(a+1)$.'),
        steps: [
          D('Za každé $x$ dosadíme číslo **v závorce**: $$f(4) = 4^2 - 3\\cdot 4 + 2 = 16 - 12 + 2 = 6$$', 'Replace every $x$ by the number **in brackets**: $$f(4) = 4^2 - 3\\cdot 4 + 2 = 16 - 12 + 2 = 6$$'),
          D('Se zápornými čísly opatrně – závorky! $$f(-1) = (-1)^2 - 3\\cdot(-1) + 2 = 1 + 3 + 2 = 6$$', 'Careful with negatives – use brackets! $$f(-1) = (-1)^2 - 3\\cdot(-1) + 2 = 1 + 3 + 2 = 6$$'),
          D('Dosadit můžeme i výraz: $$f(a+1) = (a+1)^2 - 3(a+1) + 2 = a^2 + 2a + 1 - 3a - 3 + 2 = a^2 - a$$', 'We can plug in an expression too: $$f(a+1) = (a+1)^2 - 3(a+1) + 2 = a^2 + 2a + 1 - 3a - 3 + 2 = a^2 - a$$'),
        ],
        answer: D('$f(4) = 6$, $f(-1) = 6$, $f(a+1) = a^2 - a$. Všimni si: dva různé vstupy dávají stejný výstup – a to je u funkce **v pořádku**.', '$f(4) = 6$, $f(-1) = 6$, $f(a+1) = a^2 - a$. Notice: two different inputs give the same output – and that is **fine** for a function.') },
      { t: 'note', kind: 'warn', ...D(
        'Dva různé vstupy smějí mít stejný výstup. Funkcí to **není**, když má jeden vstup dva různé výstupy.',
        'Two different inputs may share the same output. It is **not** a function when one input has two different outputs.') },
      { t: 'check', q: { id: 'c1', type: 'num', q: D('Je dána $g(x) = 3x - 1$. Kolik je $g(2)$?', 'Let $g(x) = 3x - 1$. What is $g(2)$?'), answer: 5, explain: D('$g(2) = 3\\cdot 2 - 1 = 5$.', '$g(2) = 3\\cdot 2 - 1 = 5$.') } },
    ],
  },
  // ------------------------------------------------------------------ 2
  {
    id: 'obor',
    title: D('Definiční obor a obor hodnot', 'Domain and range'),
    icon: '🎯',
    blocks: [
      { t: 'lead', ...D(
        '[[definiční obor|Definiční obor]] $D(f)$ jsou všechny vstupy, které do funkce smíme dát. [[obor hodnot|Obor hodnot]] $H(f)$ jsou všechny výstupy, které z ní opravdu mohou vypadnout.',
        'The [[definiční obor|domain]] is the set of all inputs we may feed into the function. The [[obor hodnot|range]] is the set of all outputs that can actually come out.') },
      { t: 'math', tex: 'H(f) = \\{\\, f(x) : x \\in D(f) \\,\\}' },
      { t: 'p', ...D(
        'Funkci si můžeme nakreslit i jako šipky mezi dvěma [[množina|množinami]]: z každého vstupu musí vést **přesně jedna** šipka. Vyzkoušej, které z obrázků jsou funkce:',
        'We can also draw a function as arrows between two [[množina|sets]]: **exactly one** arrow must leave each input. Try to decide which diagrams are functions:') },
      { t: 'widget', name: 'mappingDiagram' },
      { t: 'note', kind: 'warn', ...D(
        'Když definiční obor není zadaný, bereme **všechna reálná čísla, pro která má předpis smysl**. Hlídej hlavně dvě věci: **dělení nulou** a **odmocninu ze záporného čísla**.',
        'If the domain is not given, we take **all real numbers for which the formula makes sense**. Watch out for two things: **division by zero** and **the square root of a negative number**.') },
      { t: 'example', title: D('Hledáme definiční obor', 'Finding the domain'),
        task: D('Urči definiční obor funkcí (a) $f(x) = \\sqrt{x + 2}$, (b) $g(x) = \\dfrac{1}{x^2 - x}$.', 'Find the domain of (a) $f(x) = \\sqrt{x + 2}$, (b) $g(x) = \\dfrac{1}{x^2 - x}$.'),
        steps: [
          D('(a) [[odmocnina|Odmocnina]] existuje jen z nezáporných čísel: $$x + 2 \\ge 0 \\quad\\Longrightarrow\\quad x \\ge -2$$', '(a) The [[odmocnina|square root]] only exists for non-negative numbers: $$x + 2 \\ge 0 \\quad\\Longrightarrow\\quad x \\ge -2$$'),
          D('Takže $D(f) = \\langle -2, \\infty)$.', 'So the domain is $[-2, \\infty)$.'),
          D('(b) [[jmenovatel|Jmenovatel]] nesmí být nula. Rozložíme ho: $$x^2 - x = x(x - 1) = 0 \\iff x = 0 \\ \\text{nebo}\\ x = 1$$', '(b) The [[jmenovatel|denominator]] must not be zero. Factor it: $$x^2 - x = x(x - 1) = 0 \\iff x = 0 \\ \\text{or}\\ x = 1$$'),
          D('Tato dvě čísla vyhodíme: $D(g) = \\mathbb{R} \\setminus \\{0, 1\\}$.', 'Throw those two numbers out: the domain is $\\{x \\mid x \\ne 0, 1\\}$.'),
        ],
        answer: D('$D(f) = \\langle -2, \\infty)$, $\\quad D(g) = \\mathbb{R}\\setminus\\{0, 1\\} = (-\\infty, 0) \\cup (0, 1) \\cup (1, \\infty)$', '$[-2, \\infty)$ and $(-\\infty, 0) \\cup (0, 1) \\cup (1, \\infty)$') },
      { t: 'note', kind: 'lang', ...D(
        'V češtině píšeme uzavřený interval se špičatými závorkami $\\langle 0, 3 \\rangle$, v angličtině s hranatými $[0, 3]$. Otevřené intervaly $(0, 3)$ jsou v obou jazycích stejné.',
        'In Czech, closed intervals use angle brackets $\\langle 0, 3 \\rangle$ instead of $[0, 3]$. Open intervals $(0, 3)$ look the same in both languages.') },
      { t: 'check', q: { id: 'c2', type: 'mcq', q: D('Jaký je definiční obor funkce $h(x) = \\dfrac{5}{x - 3}$?', 'What is the domain of $h(x) = \\dfrac{5}{x - 3}$?'),
        options: ['$\\mathbb{R}$', '$\\mathbb{R} \\setminus \\{3\\}$', '$\\mathbb{R} \\setminus \\{-3\\}$', '$(3, \\infty)$'], answer: 1,
        explain: D('Jmenovatel $x - 3$ je nula pro $x = 3$. Jen to číslo musíme vyloučit.', 'The denominator $x - 3$ is zero for $x = 3$. Only that number has to be excluded.') } },
    ],
  },
  // ------------------------------------------------------------------ 3
  {
    id: 'ctyri-zpusoby',
    title: D('Čtyři způsoby, jak zapsat funkci', 'Four ways to represent a function'),
    icon: '🧩',
    blocks: [
      { t: 'lead', ...D(
        'Jednu a tutéž funkci můžeš popsat **slovy**, **tabulkou**, **grafem** nebo **vzorcem**. Každý zápis se hodí na něco jiného – a dobrý matematik mezi nimi umí přepínat.',
        'One and the same function can be described **in words**, **by a table**, **by a graph** or **by a formula**. Each one is good for something different – and a good mathematician can switch between them.') },
      { t: 'p', ...D(
        'Příklad: pustíme kámen z vysokého mostu. Za $t$ sekund uletí přibližně $s(t) = 5t^2$ metrů. Pohni časem a sleduj, jak se mění všechny čtyři zápisy najednou:',
        'Example: we drop a stone from a high bridge. After $t$ seconds it has fallen about $s(t) = 5t^2$ metres. Move the time and watch all four representations change together:') },
      { t: 'widget', name: 'representations' },
      { t: 'list', items: [
        D('**Slovně** – „Kámen za $t$ sekund spadne o $5t^2$ metrů." Srozumitelné, ale nepřesné.', '**Verbally** – "After $t$ seconds the stone has fallen $5t^2$ metres." Easy to understand, not precise.'),
        D('**Tabulkou** – pár změřených hodnot. Přesné, ale jen v některých bodech.', '**Numerically** – a table of measured values. Precise, but only at some points.'),
        D('**Grafem** – na první pohled vidíš tvar a chování funkce.', '**Visually** – a graph shows the shape and behaviour at a glance.'),
        D('**Vzorcem** – $s(t) = 5t^2$. Přesný a dá se s ním počítat.', '**Algebraically** – $s(t) = 5t^2$. Exact and easy to compute with.'),
      ] },
      { t: 'note', kind: 'tip', ...D(
        'Definiční obor může určovat i **realita**: čas nemůže být záporný a kámen jednou dopadne. Když je most vysoký 45 m, dává smysl jen $t \\in \\langle 0, 3 \\rangle$.',
        'The domain can also come from **reality**: time cannot be negative and the stone eventually lands. If the bridge is 45 m high, only $t \\in [0, 3]$ makes sense.') },
      { t: 'check', q: { id: 'c3', type: 'num', q: D('Kolik metrů by kámen uletěl za 4 sekundy (kdyby most byl dost vysoký)? $s(t) = 5t^2$', 'How many metres would the stone fall in 4 seconds (if the bridge were high enough)? $s(t) = 5t^2$'), answer: 80, unit: 'm',
        explain: D('$s(4) = 5 \\cdot 4^2 = 5 \\cdot 16 = 80$ m.', '$s(4) = 5 \\cdot 4^2 = 5 \\cdot 16 = 80$ m.') } },
    ],
  },
  // ------------------------------------------------------------------ 4
  {
    id: 'graf',
    title: D('Graf funkce', 'The graph of a function'),
    icon: '📈',
    blocks: [
      { t: 'def', title: D('Graf funkce', 'Graph of a function'), ...D(
        '[[graf funkce|Graf funkce]] $f$ je množina všech bodů $[x, f(x)]$ v rovině, kde $x \\in D(f)$.',
        'The [[graf funkce|graph]] of $f$ is the set of all points $(x, f(x))$ in the plane with $x$ in the domain of $f$.') },
      { t: 'p', ...D(
        'Výška grafu nad bodem $x$ je přesně $f(x)$. Z grafu tedy přečteš funkční hodnoty, a když se podíváš na jeho **stín** na osách, uvidíš i definiční obor (stín na ose $x$) a obor hodnot (stín na ose $y$).',
        'The height of the graph above the point $x$ is exactly $f(x)$. So you can read values off the graph, and its **shadow** on the axes shows the domain (shadow on the $x$-axis) and the range (shadow on the $y$-axis).') },
      { t: 'widget', name: 'grapher' },
      { t: 'note', kind: 'lang', ...D(
        'Česky píšeme souřadnice bodu do hranatých závorek: $A[2, 4]$. Anglicky do kulatých: $A(2, 4)$ – pozor, nepleť si to s intervalem!',
        'In Czech, point coordinates go in square brackets: $A[2, 4]$. In English we use round brackets: $A(2, 4)$.') },
      { t: 'check', q: { id: 'c4', type: 'mcq', q: D('Podle grafu: kolik je $f(3)$?', 'Using the graph: what is $f(3)$?'),
        fig: { view: [-1, 5, -2, 4], curves: [{ f: x => (x - 2) ** 2 - 1, color: 'accent' }], dots: [] },
        options: ['$-1$', '$0$', '$1$', '$3$'], answer: 1,
        explain: D('Nad $x = 3$ je graf přesně na ose $x$, takže $f(3) = 0$. (Vzorec: $f(x) = (x-2)^2 - 1$.)', 'Above $x = 3$ the graph sits on the $x$-axis, so $f(3) = 0$. (Formula: $f(x) = (x-2)^2 - 1$.)') } },
    ],
  },
  // ------------------------------------------------------------------ 5
  {
    id: 'svisla-primka',
    title: D('Test svislou přímkou', 'The vertical line test'),
    icon: '📏',
    blocks: [
      { t: 'lead', ...D(
        'Jak poznat z obrázku, jestli křivka je graf funkce? Stačí jedno pravítko postavené **svisle**.',
        'How can you tell from a picture whether a curve is the graph of a function? All you need is a ruler held **vertically**.') },
      { t: 'def', title: D('Test svislou přímkou', 'The vertical line test'), ...D(
        'Křivka v rovině je grafem funkce právě tehdy, když ji **žádná svislá přímka** neprotne víc než jednou.',
        'A curve in the plane is the graph of a function if and only if **no vertical line** intersects it more than once.') },
      { t: 'p', ...D(
        'Proč? Kdyby přímka $x = a$ protla křivku ve dvou bodech $[a, b]$ a $[a, c]$, měl by vstup $a$ dva výstupy $b$ i $c$ – a to funkce nesmí.',
        'Why? If the line $x = a$ crossed the curve at $(a, b)$ and $(a, c)$, the input $a$ would have two outputs $b$ and $c$ – which a function may not have.') },
      { t: 'widget', name: 'verticalLine' },
      { t: 'check', q: { id: 'c5', type: 'tf', q: D('Kružnice $x^2 + y^2 = 4$ je grafem funkce.', 'The circle $x^2 + y^2 = 4$ is the graph of a function.'), answer: false,
        explain: D('Svislá přímka třeba $x = 0$ protne kružnici ve dvou bodech $[0, 2]$ a $[0, -2]$.', 'The vertical line $x = 0$ meets the circle twice, at $(0, 2)$ and $(0, -2)$.') } },
    ],
  },
  // ------------------------------------------------------------------ 6
  {
    id: 'po-castech',
    title: D('Funkce definované po částech', 'Piecewise defined functions'),
    icon: '🧱',
    blocks: [
      { t: 'lead', ...D(
        'Některé funkce mají **různé předpisy na různých částech** definičního oboru. Takovou funkci zapisujeme se složenou závorkou.',
        'Some functions use **different formulas on different parts** of their domain. We write them with a curly bracket.') },
      { t: 'math', tex: 'f(x) = \\begin{cases} 1 - x & \\text{pro } x \\le -1 \\\\ x^2 & \\text{pro } x > -1 \\end{cases}', texEn: 'f(x) = \\begin{cases} 1 - x & \\text{if } x \\le -1 \\\\ x^2 & \\text{if } x > -1 \\end{cases}' },
      { t: 'p', ...D(
        'Postup je vždy stejný: **nejdřív zjisti, do které části** vstup patří, a teprve potom dosaď do správného předpisu.',
        'The method is always the same: **first find out which piece** the input belongs to, and only then plug it into the right formula.') },
      { t: 'widget', name: 'piecewise' },
      { t: 'example', title: D('Dosazení do funkce po částech', 'Evaluating a piecewise function'),
        task: D('Pro funkci $f$ výše vypočítej $f(-2)$, $f(-1)$ a $f(0)$.', 'For the function $f$ above, find $f(-2)$, $f(-1)$ and $f(0)$.'),
        steps: [
          D('$-2 \\le -1$, platí horní předpis: $f(-2) = 1 - (-2) = 3$.', '$-2 \\le -1$, so the top formula applies: $f(-2) = 1 - (-2) = 3$.'),
          D('$-1 \\le -1$ (rovnost se počítá!), opět horní předpis: $f(-1) = 1 - (-1) = 2$.', '$-1 \\le -1$ (equality counts!), so again the top formula: $f(-1) = 1 - (-1) = 2$.'),
          D('$0 > -1$, platí dolní předpis: $f(0) = 0^2 = 0$.', '$0 > -1$, so the bottom formula applies: $f(0) = 0^2 = 0$.'),
        ],
        answer: D('$f(-2) = 3$, $f(-1) = 2$, $f(0) = 0$', '$f(-2) = 3$, $f(-1) = 2$, $f(0) = 0$') },
      { t: 'def', title: D('Absolutní hodnota', 'Absolute value'), ...D(
        '[[absolutní hodnota|Absolutní hodnota]] je nejznámější funkce po částech: $$|x| = \\begin{cases} x & \\text{pro } x \\ge 0 \\\\ -x & \\text{pro } x < 0 \\end{cases}$$ Je to vzdálenost čísla od nuly, proto je vždy $|x| \\ge 0$.',
        'The [[absolutní hodnota|absolute value]] is the best-known piecewise function: $$|x| = \\begin{cases} x & \\text{if } x \\ge 0 \\\\ -x & \\text{if } x < 0 \\end{cases}$$ It is the distance of a number from zero, so always $|x| \\ge 0$.') },
      { t: 'note', kind: 'tip', ...D(
        'Na grafu: **plné kolečko ●** znamená, že bod do grafu patří, **prázdné kolečko ○**, že nepatří.',
        'On a graph: a **filled dot ●** means the point belongs to the graph, an **open dot ○** means it does not.') },
      { t: 'check', q: { id: 'c6', type: 'num', q: D('$f(x) = \\begin{cases} 2x & x < 1 \\\\ 5 & x \\ge 1 \\end{cases}$. Kolik je $f(1)$?', '$f(x) = \\begin{cases} 2x & x < 1 \\\\ 5 & x \\ge 1 \\end{cases}$. What is $f(1)$?'), answer: 5,
        explain: D('$1 \\ge 1$, takže platí druhý předpis: $f(1) = 5$. (Ne $2 \\cdot 1 = 2$!)', '$1 \\ge 1$, so the second formula applies: $f(1) = 5$. (Not $2 \\cdot 1 = 2$!)') } },
    ],
  },
  // ------------------------------------------------------------------ 7
  {
    id: 'symetrie',
    title: D('Sudé a liché funkce', 'Symmetry: even and odd functions'),
    icon: '🦋',
    blocks: [
      { t: 'lead', ...D(
        'Některé grafy jsou krásně [[souměrnost|souměrné]]. Tahle souměrnost se dá poznat i bez obrázku – jen dosazením $-x$.',
        'Some graphs are beautifully [[souměrnost|symmetric]]. You can detect this symmetry even without a picture – just by plugging in $-x$.') },
      { t: 'def', title: D('Sudá a lichá funkce', 'Even and odd functions'), ...D(
        'Funkce $f$ je [[sudá funkce|sudá]], když $f(-x) = f(x)$ pro každé $x \\in D(f)$. Její graf je souměrný podle osy $y$.\n\nFunkce $f$ je [[lichá funkce|lichá]], když $f(-x) = -f(x)$ pro každé $x \\in D(f)$. Její graf je souměrný podle [[počátek|počátku]].',
        'A function $f$ is [[sudá funkce|even]] if $f(-x) = f(x)$ for every $x$ in its domain. Its graph is symmetric about the $y$-axis.\n\nA function $f$ is [[lichá funkce|odd]] if $f(-x) = -f(x)$ for every $x$ in its domain. Its graph is symmetric about the [[počátek|origin]].') },
      { t: 'widget', name: 'symmetry' },
      { t: 'example', title: D('Sudá, lichá, nebo ani jedno?', 'Even, odd, or neither?'),
        task: D('Rozhodni o funkcích (a) $f(x) = x^5 + x$, (b) $g(x) = 1 - x^4$, (c) $h(x) = 2x - x^2$.', 'Decide for (a) $f(x) = x^5 + x$, (b) $g(x) = 1 - x^4$, (c) $h(x) = 2x - x^2$.'),
        steps: [
          D('(a) $f(-x) = (-x)^5 + (-x) = -x^5 - x = -(x^5 + x) = -f(x)$ $\\Rightarrow$ **lichá**.', '(a) $f(-x) = (-x)^5 + (-x) = -x^5 - x = -(x^5 + x) = -f(x)$ $\\Rightarrow$ **odd**.'),
          D('(b) $g(-x) = 1 - (-x)^4 = 1 - x^4 = g(x)$ $\\Rightarrow$ **sudá**.', '(b) $g(-x) = 1 - (-x)^4 = 1 - x^4 = g(x)$ $\\Rightarrow$ **even**.'),
          D('(c) $h(-x) = -2x - x^2$. To není $h(x) = 2x - x^2$ ani $-h(x) = -2x + x^2$ $\\Rightarrow$ **ani sudá, ani lichá**.', '(c) $h(-x) = -2x - x^2$. That is neither $h(x) = 2x - x^2$ nor $-h(x) = -2x + x^2$ $\\Rightarrow$ **neither**.'),
        ],
        answer: D('(a) lichá, (b) sudá, (c) ani jedno', '(a) odd, (b) even, (c) neither') },
      { t: 'note', kind: 'tip', ...D(
        'Pomůcka k názvům: sudé mocniny $x^2, x^4, x^6, \\dots$ jsou sudé funkce a liché mocniny $x, x^3, x^5, \\dots$ jsou liché funkce.',
        'Memory aid: even powers $x^2, x^4, \\dots$ are even functions, odd powers $x, x^3, \\dots$ are odd functions – that is where the names come from.') },
      { t: 'check', q: { id: 'c7', type: 'mcq', q: D('Funkce $f(x) = x^3 - x$ je…', 'The function $f(x) = x^3 - x$ is…'),
        options: [D('sudá', 'even'), D('lichá', 'odd'), D('ani sudá, ani lichá', 'neither')], answer: 1,
        explain: D('$f(-x) = -x^3 + x = -(x^3 - x) = -f(x)$, takže je lichá.', '$f(-x) = -x^3 + x = -(x^3 - x) = -f(x)$, so it is odd.') } },
    ],
  },
  // ------------------------------------------------------------------ 8
  {
    id: 'monotonie',
    title: D('Rostoucí a klesající funkce', 'Increasing and decreasing functions'),
    icon: '🎢',
    blocks: [
      { t: 'lead', ...D(
        'Čti graf **zleva doprava**, jako text v knize. Když jde nahoru, funkce **roste**. Když jde dolů, funkce **klesá**.',
        'Read a graph **from left to right**, like text in a book. When it goes up, the function is **increasing**. When it goes down, it is **decreasing**.') },
      { t: 'def', title: D('Rostoucí a klesající funkce', 'Increasing and decreasing'), ...D(
        'Funkce $f$ je [[rostoucí]] na intervalu $I$, jestliže pro všechna $x_1, x_2 \\in I$ platí: $$x_1 < x_2 \\ \\Rightarrow\\ f(x_1) < f(x_2).$$ Je [[klesající]], jestliže $x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$.',
        'A function $f$ is [[rostoucí|increasing]] on an interval $I$ if for all $x_1, x_2$ in $I$: $$x_1 < x_2 \\ \\Rightarrow\\ f(x_1) < f(x_2).$$ It is [[klesající|decreasing]] if $x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$.') },
      { t: 'widget', name: 'monotonic' },
      { t: 'note', kind: 'warn', ...D(
        'Monotonie se vždycky vztahuje k **intervalu**. Funkce $x^2$ není „rostoucí" ani „klesající" celkově – klesá na $(-\\infty, 0 \\rangle$ a roste na $\\langle 0, \\infty)$.',
        'Increasing/decreasing always refers to an **interval**. The function $x^2$ is neither increasing nor decreasing overall – it decreases on $(-\\infty, 0]$ and increases on $[0, \\infty)$.') },
      { t: 'check', q: { id: 'c8', type: 'mcq', q: D('Na kterém intervalu je funkce $f(x) = x^2$ klesající?', 'On which interval is $f(x) = x^2$ decreasing?'),
        options: [D('$(-\\infty, 0\\rangle$', '$(-\\infty, 0]$'), D('$\\langle 0, \\infty)$', '$[0, \\infty)$'), '$\\mathbb{R}$', D('nikde', 'nowhere')], answer: 0,
        explain: D('Zleva až k nule graf paraboly klesá, od nuly doprava roste.', 'From the left up to zero the parabola goes down, from zero on it goes up.') } },
    ],
  },
  // ------------------------------------------------------------------ 9
  {
    id: 'shrnuti',
    title: D('Shrnutí', 'Summary'),
    icon: '⭐',
    blocks: [
      { t: 'lead', ...D('Skvělá práce! Tohle si z části 1.1 odnes:', 'Great work! Here is what to take away from section 1.1:') },
      { t: 'summary', items: [
        { icon: '⚙️', ...D('**Funkce** přiřadí každému vstupu právě jeden výstup: $x \\mapsto f(x)$.', 'A **function** assigns exactly one output to each input: $x \\mapsto f(x)$.') },
        { icon: '🎯', ...D('**$D(f)$** = povolené vstupy. Pozor na dělení nulou a odmocninu ze záporného čísla. **$H(f)$** = všechny výstupy.', '**Domain** = allowed inputs. Watch for division by zero and roots of negatives. **Range** = all outputs.') },
        { icon: '🧩', ...D('Funkci zapíšeš slovy, tabulkou, grafem nebo vzorcem.', 'A function can be given in words, by a table, a graph or a formula.') },
        { icon: '📏', ...D('**Test svislou přímkou**: žádná svislá přímka nesmí graf protnout dvakrát.', '**Vertical line test**: no vertical line may cross the graph twice.') },
        { icon: '🧱', ...D('U funkce **po částech** nejdřív urči část, pak dosaď. $|x|$ je po částech.', 'For a **piecewise** function, first pick the piece, then plug in. $|x|$ is piecewise.') },
        { icon: '🦋', ...D('**Sudá**: $f(-x) = f(x)$ (zrcadlo podle osy $y$). **Lichá**: $f(-x) = -f(x)$ (otočení kolem počátku).', '**Even**: $f(-x) = f(x)$ (mirror in the $y$-axis). **Odd**: $f(-x) = -f(x)$ (rotation about the origin).') },
        { icon: '🎢', ...D('**Rostoucí**: graf zleva doprava stoupá. **Klesající**: klesá. Vždy na nějakém intervalu.', '**Increasing**: the graph rises left to right. **Decreasing**: it falls. Always on some interval.') },
      ] },
      { t: 'cta' },
    ],
  },
];

// ------------------------------------------------------------------ TEST
export const quiz = [
  { id: 'q1', type: 'num', q: D('Je dána $f(x) = 2x^2 - x$. Vypočítej $f(-2)$.', 'Let $f(x) = 2x^2 - x$. Find $f(-2)$.'), answer: 10,
    explain: D('$f(-2) = 2\\cdot(-2)^2 - (-2) = 2\\cdot 4 + 2 = 10$.', '$f(-2) = 2\\cdot(-2)^2 - (-2) = 2\\cdot 4 + 2 = 10$.') },
  { id: 'q2', type: 'mcq', q: D('Která množina dvojic $[x, y]$ **není** funkce?', 'Which set of pairs $(x, y)$ is **not** a function?'),
    options: ['$\\{[1,2],\\,[2,3],\\,[3,2]\\}$', '$\\{[1,1],\\,[2,1],\\,[3,1]\\}$', '$\\{[1,2],\\,[1,3],\\,[2,4]\\}$', '$\\{[0,0],\\,[1,1],\\,[2,4]\\}$'], answer: 2,
    explain: D('Vstup $1$ má dva různé výstupy $2$ a $3$.', 'The input $1$ has two different outputs, $2$ and $3$.') },
  { id: 'q3', type: 'mcq', q: D('Definiční obor funkce $f(x) = \\sqrt{x - 4}$ je:', 'The domain of $f(x) = \\sqrt{x - 4}$ is:'),
    options: [D('$\\langle 4, \\infty)$', '$[4, \\infty)$'), '$(4, \\infty)$', D('$(-\\infty, 4\\rangle$', '$(-\\infty, 4]$'), '$\\mathbb{R}$'], answer: 0,
    explain: D('$x - 4 \\ge 0 \\Rightarrow x \\ge 4$. Číslo 4 patří do $D(f)$, protože $\\sqrt{0} = 0$.', '$x - 4 \\ge 0 \\Rightarrow x \\ge 4$. The number 4 is included because $\\sqrt{0} = 0$.') },
  { id: 'q4', type: 'mcq', q: D('Definiční obor funkce $g(x) = \\dfrac{1}{x^2 - 9}$ je:', 'The domain of $g(x) = \\dfrac{1}{x^2 - 9}$ is:'),
    options: ['$\\mathbb{R}\\setminus\\{3\\}$', '$\\mathbb{R}\\setminus\\{-3, 3\\}$', '$\\mathbb{R}\\setminus\\{9\\}$', '$(3, \\infty)$'], answer: 1,
    explain: D('$x^2 - 9 = (x-3)(x+3) = 0$ pro $x = 3$ i $x = -3$. Obě čísla vyloučíme.', '$x^2 - 9 = (x-3)(x+3) = 0$ for $x = 3$ and $x = -3$. Both are excluded.') },
  { id: 'q5', type: 'tf', q: D('Dvě různá čísla $x$ mohou mít stejnou funkční hodnotu.', 'Two different numbers $x$ can have the same function value.'), answer: true,
    explain: D('Ano, např. $f(x) = x^2$: $f(-2) = f(2) = 4$.', 'Yes, e.g. $f(x) = x^2$: $f(-2) = f(2) = 4$.') },
  { id: 'q6', type: 'tf', q: D('Jedno číslo $x$ může mít dvě různé funkční hodnoty.', 'One number $x$ can have two different function values.'), answer: false,
    explain: D('Ne – to by porušilo definici funkce (právě jeden výstup).', 'No – that would break the definition (exactly one output).') },
  { id: 'q7', type: 'tf', q: D('Je tato křivka grafem funkce?', 'Is this curve the graph of a function?'), answer: false,
    labels: [D('Ano', 'Yes'), D('Ne', 'No')],
    fig: { view: [-3, 3, -3, 3], param: [{ x: t => 2 * Math.cos(t), y: t => 1.5 * Math.sin(t), t: [0, 2 * Math.PI], color: 'accent' }], vline: 1 },
    explain: D('Svislá přímka $x = 1$ protne elipsu dvakrát – test svislou přímkou neprošel.', 'The vertical line $x = 1$ crosses the ellipse twice – it fails the vertical line test.') },
  { id: 'q8', type: 'tf', q: D('Je tato křivka grafem funkce?', 'Is this curve the graph of a function?'), answer: true,
    labels: [D('Ano', 'Yes'), D('Ne', 'No')],
    fig: { view: [-3, 3, -3, 3], curves: [{ f: x => x ** 3 / 3 - x, color: 'accent' }] },
    explain: D('Každá svislá přímka ji protne právě jednou.', 'Every vertical line meets it exactly once.') },
  { id: 'q9', type: 'mcq', q: D('Graf funkce $f$ je na obrázku. Jaký je obor hodnot $H(f)$?', 'The graph of $f$ is shown. What is the range of $f$?'),
    fig: { view: [-3, 3, -2, 4], curves: [{ f: x => x * x - 1, dom: [-2, 2], color: 'accent' }], dots: [{ x: -2, y: 3 }, { x: 2, y: 3 }] },
    options: [D('$\\langle -1, 3 \\rangle$', '$[-1, 3]$'), D('$\\langle -2, 2 \\rangle$', '$[-2, 2]$'), D('$\\langle 0, 3 \\rangle$', '$[0, 3]$'), '$\\mathbb{R}$'], answer: 0,
    explain: D('Nejnižší bod grafu má $y = -1$, nejvyšší $y = 3$. Stín na ose $y$ je $\\langle -1, 3\\rangle$. ($\\langle -2, 2\\rangle$ je definiční obor.)', 'The lowest point has $y = -1$, the highest $y = 3$. The shadow on the $y$-axis is $[-1, 3]$. ($[-2, 2]$ is the domain.)') },
  { id: 'q10', type: 'num', q: D('$f(x) = \\begin{cases} x + 3 & x < 0 \\\\ x^2 & x \\ge 0 \\end{cases}$. Kolik je $f(-5)$?', '$f(x) = \\begin{cases} x + 3 & x < 0 \\\\ x^2 & x \\ge 0 \\end{cases}$. What is $f(-5)$?'), answer: -2,
    explain: D('$-5 < 0$, takže $f(-5) = -5 + 3 = -2$.', '$-5 < 0$, so $f(-5) = -5 + 3 = -2$.') },
  { id: 'q11', type: 'num', q: D('$f(x) = \\begin{cases} x + 3 & x < 0 \\\\ x^2 & x \\ge 0 \\end{cases}$. Kolik je $f(0)$?', '$f(x) = \\begin{cases} x + 3 & x < 0 \\\\ x^2 & x \\ge 0 \\end{cases}$. What is $f(0)$?'), answer: 0,
    explain: D('$0 \\ge 0$, platí druhý předpis: $f(0) = 0^2 = 0$ (ne $3$!).', '$0 \\ge 0$, the second formula applies: $f(0) = 0^2 = 0$ (not $3$!).') },
  { id: 'q12', type: 'num', q: D('Vypočítej $|-7| - |3|$.', 'Compute $|-7| - |3|$.'), answer: 4,
    explain: D('$|-7| = 7$, $|3| = 3$, takže $7 - 3 = 4$.', '$|-7| = 7$, $|3| = 3$, so $7 - 3 = 4$.') },
  { id: 'q13', type: 'mcq', q: D('Která funkce je **sudá**?', 'Which function is **even**?'),
    options: ['$x^3$', '$x^2 + 1$', '$x + 1$', '$x^3 + x^2$'], answer: 1,
    explain: D('$(-x)^2 + 1 = x^2 + 1$. Ostatní se po dosazení $-x$ změní.', '$(-x)^2 + 1 = x^2 + 1$. The others change when you plug in $-x$.') },
  { id: 'q14', type: 'mcq', q: D('Funkce $f(x) = x^3 + x$ je:', 'The function $f(x) = x^3 + x$ is:'),
    options: [D('sudá', 'even'), D('lichá', 'odd'), D('ani sudá, ani lichá', 'neither')], answer: 1,
    explain: D('$f(-x) = -x^3 - x = -(x^3 + x) = -f(x)$.', '$f(-x) = -x^3 - x = -(x^3 + x) = -f(x)$.') },
  { id: 'q15', type: 'mcq', q: D('Graf je souměrný podle počátku, právě když…', 'A graph is symmetric about the origin exactly when…'),
    options: ['$f(-x) = f(x)$', '$f(-x) = -f(x)$', '$f(x) = -f(x)$', '$f(-x) = \\dfrac{1}{f(x)}$'], answer: 1,
    explain: D('To je definice liché funkce.', 'That is the definition of an odd function.') },
  { id: 'q16', type: 'mcq', q: D('Na kterém intervalu je $f(x) = (x - 2)^2$ rostoucí?', 'On which interval is $f(x) = (x - 2)^2$ increasing?'),
    options: [D('$\\langle 2, \\infty)$', '$[2, \\infty)$'), D('$(-\\infty, 2\\rangle$', '$(-\\infty, 2]$'), D('$\\langle -2, \\infty)$', '$[-2, \\infty)$'), '$\\mathbb{R}$'], answer: 0,
    fig: { view: [-1, 5, -1, 5], curves: [{ f: x => (x - 2) ** 2, color: 'accent' }] },
    explain: D('Je to parabola s vrcholem v bodě $[2, 0]$. Napravo od vrcholu roste.', 'It is a parabola with vertex $(2, 0)$. To the right of the vertex it increases.') },
  { id: 'q17', type: 'num', q: D('Kámen padá podle $s(t) = 5t^2$ (metry, sekundy). Za kolik sekund spadne o 45 m?', 'A stone falls by $s(t) = 5t^2$ (metres, seconds). After how many seconds has it fallen 45 m?'), answer: 3, unit: 's',
    explain: D('$5t^2 = 45 \\Rightarrow t^2 = 9 \\Rightarrow t = 3$ (záporný čas nedává smysl).', '$5t^2 = 45 \\Rightarrow t^2 = 9 \\Rightarrow t = 3$ (negative time makes no sense).') },
  { id: 'q18', type: 'match', q: D('Spoj český pojem s anglickým.', 'Match the Czech term with the English one.'),
    pairs: [['definiční obor', 'domain'], ['obor hodnot', 'range'], ['sudá funkce', 'even function'], ['klesající', 'decreasing']],
    explain: D('definiční obor = domain, obor hodnot = range, sudá = even, klesající = decreasing.', 'definiční obor = domain, obor hodnot = range, sudá = even, klesající = decreasing.') },
  { id: 'q19', type: 'mcq', q: D('$f(x) = x^2 - 3x + 2$. Čemu se rovná $f(a + 1)$?', '$f(x) = x^2 - 3x + 2$. What is $f(a + 1)$?'),
    options: ['$a^2 - a$', '$a^2 + a$', '$a^2 - a + 2$', '$a^2 - 3a$'], answer: 0,
    explain: D('$(a+1)^2 - 3(a+1) + 2 = a^2 + 2a + 1 - 3a - 3 + 2 = a^2 - a$.', '$(a+1)^2 - 3(a+1) + 2 = a^2 + 2a + 1 - 3a - 3 + 2 = a^2 - a$.') },
  { id: 'q20', type: 'mcq', q: D('Definiční obor funkce $f(x) = \\dfrac{\\sqrt{x}}{x - 1}$ je:', 'The domain of $f(x) = \\dfrac{\\sqrt{x}}{x - 1}$ is:'),
    options: [D('$\\langle 0, 1) \\cup (1, \\infty)$', '$[0, 1) \\cup (1, \\infty)$'), '$(1, \\infty)$', D('$\\langle 0, \\infty)$', '$[0, \\infty)$'), '$\\mathbb{R}\\setminus\\{1\\}$'], answer: 0,
    explain: D('Odmocnina chce $x \\ge 0$, jmenovatel chce $x \\ne 1$. Obě podmínky současně.', 'The root needs $x \\ge 0$, the denominator needs $x \\ne 1$. Both at once.') },
];

export default {
  id: '1-1',
  number: '1.1',
  chapter: 1,
  title: D('Funkce a jejich grafy', 'Functions and Their Graphs'),
  blurb: D('Co je funkce, definiční obor, grafy, test svislou přímkou, funkce po částech, souměrnost a monotonie.', 'What a function is, domain and range, graphs, the vertical line test, piecewise functions, symmetry and monotonicity.'),
  steps, quiz, glossary,
};
