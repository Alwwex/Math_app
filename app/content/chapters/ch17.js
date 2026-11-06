import { D, lead, p, def, tip, warn, lang, phys, math, list, widget, example, check, mcq, num, tf, match, term, step } from '../kit.js';

export default {
  intro: D('Funkce se chovají jako vektory v nekonečněrozměrném prostoru. Hermitovské operátory v něm mají reálná vlastní čísla a ortogonální vlastní funkce – a z nich se dá složit řešení skoro čehokoli.',
    'Functions behave like vectors in an infinite-dimensional space. Hermitian operators there have real eigenvalues and orthogonal eigenfunctions – from which almost any solution can be built.'),
  steps: [
    step('17.1', D('Prostory funkcí', 'Sets of functions'), 'violin', [
      lead('Skalární součin funkcí zavedeme integrálem s váhou $\\rho(x)$. Funkce jsou **ortogonální**, když je jejich součin nulový.', 'The inner product of functions is an integral with a weight $\\rho(x)$. Functions are **orthogonal** when it vanishes.'),
      math('\\langle f|g\\rangle = \\int_a^b f^*(x)\\,g(x)\\,\\rho(x)\\,dx'),
      p('Množina je **úplná**, když z ní složíme každou rozumnou funkci: $f = \\sum c_n y_n$ s $c_n = \\langle y_n|f\\rangle/\\langle y_n|y_n\\rangle$. Fourierova řada je speciální případ.', 'A set is **complete** if any reasonable function can be built from it: $f = \\sum c_n y_n$ with $c_n = \\langle y_n|f\\rangle/\\langle y_n|y_n\\rangle$. The Fourier series is a special case.'),
      widget('paramPlot', {
        view: [0, 1, -1.6, 1.6], xlabel: 'x', params: [{ k: 'n', label: 'n', min: 1, max: 8, value: 2, int: true, step: 1 }, { k: 'm', label: 'm', min: 1, max: 8, value: 3, int: true, step: 1 }],
        curves: [{ f: (x, P) => Math.sin(P.n * Math.PI * x), label: '\\sin n\\pi x' }, { f: (x, P) => Math.sin(P.m * Math.PI * x), label: '\\sin m\\pi x', color: 'var(--orange)' }, { f: (x, P) => Math.sin(P.n * Math.PI * x) * Math.sin(P.m * Math.PI * x), label: '\\text{součin}', color: 'var(--purple)', thin: true }],
        area: { f: (x, P) => Math.sin(P.n * Math.PI * x) * Math.sin(P.m * Math.PI * x), a: 0, b: 1, color: 'var(--purple)' },
        info: (P, T) => `\\int_0^1 \\sin n\\pi x\\,\\sin m\\pi x\\,dx = ${P.n === P.m ? '\\tfrac12' : '0'}\n\\text{${P.n === P.m ? T('stejné funkce', 'same function') : T('kladné a záporné plochy se vyruší', 'positive and negative areas cancel')}}`,
      }),
      check(num(D('$\\int_0^\\pi \\sin x\\,\\sin 2x\\,dx = ?$', '$\\int_0^\\pi \\sin x\\,\\sin 2x\\,dx = ?$'), 0, D('Ortogonalita.', 'Orthogonality.'))),
    ]),
    step('17.2–17.3', D('Hermitovské operátory', 'Hermitian operators'), 'atom', [
      lead('Operátor $\\mathcal L$ je **hermitovský** (samoadjungovaný), když $\\langle f|\\mathcal L g\\rangle = \\langle \\mathcal L f|g\\rangle$ pro všechny funkce splňující okrajové podmínky.', 'An operator $\\mathcal L$ is **Hermitian** (self-adjoint) if $\\langle f|\\mathcal L g\\rangle = \\langle \\mathcal L f|g\\rangle$ for all functions obeying the boundary conditions.'),
      list(D('vlastní čísla jsou **reálná**,', 'eigenvalues are **real**,'), D('vlastní funkce k různým vlastním číslům jsou **ortogonální**,', 'eigenfunctions with different eigenvalues are **orthogonal**,'), D('vlastní funkce tvoří **úplnou** množinu.', 'the eigenfunctions form a **complete** set.')),
      phys('Proto jsou v kvantové mechanice energie a další měřené hodnoty reálná čísla.', 'That is why energies and other measured values in quantum mechanics are real.'),
      check(tf(D('Vlastní čísla hermitovského operátoru mohou být komplexní.', 'Eigenvalues of a Hermitian operator can be complex.'), false, D('Jsou vždy reálná.', 'They are always real.'))),
    ]),
    step('17.4', D('Sturmovy–Liouvilleovy rovnice', 'Sturm–Liouville equations'), 'link', [
      math('(p\\,y\')\' + q\\,y + \\lambda\\,\\rho\\,y = 0'),
      p('Rovnice v tomto tvaru (s vhodnými okrajovými podmínkami) je automaticky hermitovská. Spadá sem harmonický oscilátor, Legendreova, Besselova, Hermitova i Laguerrova rovnice.', 'An equation in this form (with suitable boundary conditions) is automatically Hermitian. This covers the harmonic, Legendre, Bessel, Hermite and Laguerre equations.'),
      tip('Libovolnou rovnici $a y\'\' + b y\' + c y = 0$ převedeš do tohoto tvaru vynásobením faktorem $F = \\frac1a e^{\\int b/a\\,dx}$.', 'Any equation $a y\'\' + b y\' + c y = 0$ can be put into this form by multiplying by $F = \\frac1a e^{\\int b/a\\,dx}$.'),
      check(mcq(D('Pro Legendreovu rovnici je $p(x) = $', 'For Legendre’s equation $p(x) = $'), ['$1 - x^2$', '$x$', '$1$', '$x^2$'], 0, D('$((1 - x^2)y\')\' + \\ell(\\ell+1)y = 0$.', '$((1 - x^2)y\')\' + \\ell(\\ell+1)y = 0$.'))),
    ]),
    step('17.5–17.6', D('Greenovy funkce z vlastních funkcí', 'Green’s functions from eigenfunctions'), 'target', [
      lead('Rovnici $\\mathcal L y = f$ vyřešíme rozkladem do vlastních funkcí: každá složka se jen vydělí svým vlastním číslem.', 'Solve $\\mathcal L y = f$ by expanding in eigenfunctions: each component is just divided by its eigenvalue.'),
      math('G(x, z) = \\sum_n \\dfrac{y_n(x)\\,y_n^*(z)}{\\lambda_n},\\qquad y(x) = \\int G(x, z)\\,f(z)\\,dz'),
      warn('Když je některé $\\lambda_n = 0$, rovnice má řešení jen tehdy, když je $f$ na příslušnou vlastní funkci kolmé.', 'If some $\\lambda_n = 0$, a solution exists only when $f$ is orthogonal to that eigenfunction.'),
      check(tf(D('Greenova funkce hermitovského operátoru je symetrická: $G(x, z) = G^*(z, x)$.', 'The Green’s function of a Hermitian operator is symmetric: $G(x, z) = G^*(z, x)$.'), true, D('Plyne z rozkladu.', 'Follows from the expansion.'))),
    ]),
  ],
  quiz: [
    mcq(D('Vlastní funkce hermitovského operátoru k různým vlastním číslům jsou…', 'Eigenfunctions of a Hermitian operator with different eigenvalues are…'), [D('ortogonální', 'orthogonal'), D('stejné', 'identical'), D('rovnoběžné', 'parallel'), D('nulové', 'zero')], 0, D('Klíčová vlastnost.', 'The key property.')),
    num(D('$\\int_0^1 \\sin^2(\\pi x)\\,dx = ?$', '$\\int_0^1 \\sin^2(\\pi x)\\,dx = ?$'), 0.5, D('Průměr $\\sin^2$ je $\\frac12$.', 'The mean of $\\sin^2$ is $\\frac12$.'), { tol: .001 }),
    tf(D('Sturmova–Liouvilleova rovnice je s vhodnými okrajovými podmínkami hermitovská.', 'A Sturm–Liouville equation with suitable boundary conditions is Hermitian.'), true, D('Proto je tak užitečná.', 'Which makes it so useful.')),
    mcq(D('Koeficient rozkladu $c_n$ funkce $f$ do ortogonálních $y_n$ je…', 'The expansion coefficient $c_n$ of $f$ in orthogonal $y_n$ is…'), ['$\\langle y_n|f\\rangle/\\langle y_n|y_n\\rangle$', '$\\langle f|f\\rangle$', '$y_n(0)$', '$\\lambda_n$'], 0, D('Průmět na $y_n$.', 'Projection onto $y_n$.')),
    mcq(D('Která rovnice NENÍ typu Sturm–Liouville?', 'Which is NOT of Sturm–Liouville type?'), [D('nelineární $y\'\' + y^2 = 0$', 'the nonlinear $y\'\' + y^2 = 0$'), D('Besselova', 'Bessel'), D('Legendreova', 'Legendre'), D('harmonický oscilátor', 'the harmonic oscillator')], 0, D('SL rovnice jsou lineární.', 'SL equations are linear.')),
    tf(D('Úplnost znamená, že lze rozložit každou rozumnou funkci.', 'Completeness means any reasonable function can be expanded.'), true, D('Definice úplnosti.', 'Definition of completeness.')),
  ],
  glossary: [
    term('skalární součin funkcí', 'inner product of functions', D('$\\int f^* g\\,\\rho\\,dx$.', '$\\int f^* g\\,\\rho\\,dx$.'), '\\langle f|g\\rangle'),
    term('váhová funkce', 'weight function', D('Funkce $\\rho(x)$ ve skalárním součinu.', 'The function $\\rho(x)$ in the inner product.'), ''),
    term('úplná množina', 'complete set', D('Z funkcí lze složit každou rozumnou funkci.', 'Any reasonable function can be expanded in them.'), ''),
    term('samoadjungovaný operátor', 'self-adjoint operator', D('$\\langle f|\\mathcal Lg\\rangle = \\langle \\mathcal Lf|g\\rangle$.', '$\\langle f|\\mathcal Lg\\rangle = \\langle \\mathcal Lf|g\\rangle$.'), ''),
    term('vlastní funkce', 'eigenfunction', D('Funkce, kterou operátor jen vynásobí číslem.', 'A function the operator only multiplies by a number.'), ''),
    term('Sturmova–Liouvilleova rovnice', 'Sturm–Liouville equation', D('$(py\')\' + qy + \\lambda\\rho y = 0$.', '$(py\')\' + qy + \\lambda\\rho y = 0$.'), ''),
  ],
};
