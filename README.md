# Folio – interaktivní učebnice matematiky

Aplikace pro **Windows 11** (dotykový notebook + pero) a zároveň pro prohlížeč. Z učebnice v PDF dělá
„learning notebook“, podobný poznámkovým aplikacím na iPadu:

| Část | Co umí |
|---|---|
| 📖 **Kniha** | PDF jako opravdová kniha: dvoustrana, otáčení listů ve 3D (prstem, perem, myší, šipkami nebo kolečkem), šustění papíru, záložky (stužka), obsah knihy, přiblížení, sépiový a noční papír. **Do stránek můžeš psát a zvýrazňovat perem.** |
| 💡 **Lekce** | Teorie po krocích s **8 interaktivními animacemi**, řešené příklady krok za krokem, rychlá ověření, definice, tipy a „V angličtině“. Přepínač **CZ / EN / CZ+EN**. |
| ✅ **Testy** | 20 otázek (výběr, číslo, pravda/nepravda, spojovačka, otázky s grafem), pomocný papír na výpočty, série správných odpovědí, výsledky a režim „Opravit chyby“. |
| 🃏 **Kartičky** | Pojmy česky ↔ anglicky s 3D otáčením, Leitnerovy krabičky (chytré opakování) a výslovnost angličtiny. Slovníček s vyhledáváním. |
| ✏️ **Sešit** | Sešity se stránkami (čistý, linkovaný, čtverečkovaný, tečkovaný papír, papír s osami pro grafy). Pero s přítlakem, zvýrazňovač, guma, pravítko, zpět/znovu, export stránky do PNG. |
| ⭐ **Pokrok** | XP, úrovně, série dní, týdenní graf, průběh lekcí. |

Všechno se **ukládá automaticky** v počítači (funguje i bez internetu). V Nastavení jde udělat zálohu do souboru a zase ji načíst.

> Zatím je hotová **kapitola 1, část 1.1 – Funkce a jejich grafy** jako ukázka. Ostatní části se doplní podle tvé knihy.

## Instalace na Windows

1. Na GitHubu otevři záložku **Actions** → poslední běh **Windows build** → dole v sekci **Artifacts** stáhni **Folio-Windows**.
2. Rozbal ZIP. Uvnitř jsou dva soubory:
   * `Folio-Setup-x.y.z.exe` – instalace (zástupce na ploše a ve Startu),
   * `Folio-Portable-x.y.z.exe` – spustí se rovnou bez instalace.
3. Windows SmartScreen může napsat „Systém Windows ochránil váš počítač“ (aplikace není podepsaná certifikátem).
   Klikni na **Další informace → Přesto spustit**.

### Spuštění ze zdrojového kódu

Potřebuješ [Node.js](https://nodejs.org) 20 nebo novější.

```bash
npm install
```

```bash
npm start
```

Vlastní instalačku vyrobíš příkazem `npm run dist` (soubory se objeví ve složce `dist/`).

### Webová verze

Složka `app/` je obyčejná webová aplikace. Stačí ji naservírovat libovolným serverem, třeba:

```bash
npm run web
```

a otevřít `http://localhost:8080`. V Edge jde pak dát **⋯ → Aplikace → Nainstalovat** a bude se chovat jako aplikace.

## Jak to ovládat

* **Vlastní PDF:** v Knize klikni na **Otevřít PDF** (nebo soubor přetáhni do okna). Kniha se uloží a příště se otevře sama.
* **Pero vs. prst:** jakmile poprvé použiješ pero, aplikace přepne do režimu *perem píšeš, prstem listuješ/posouváš*. Dá se to změnit v Nastavení.
* **Listování:** táhni stránku od kraje, klepni na okraj stránky, šipky ← →, mezerník, kolečko myši. `B` = záložka.
* **Lekce ↔ kniha:** tlačítko *Číst v knize* skočí na stranu, kde lekce začíná. U vlastní knihy si začátek nastavíš v obsahu knihy (*Lekce 1.1 začíná na této straně*).
* **Klávesy:** `Ctrl+Z` / `Ctrl+Y` zpět/znovu u kreslení, `F11` celá obrazovka.

## Struktura projektu

```
app/                  webová aplikace (HTML/CSS/JS, bez build kroku)
  content/book.js     struktura knihy (kapitoly, části)
  content/ch1-1.js    obsah části 1.1: kroky lekce, test, slovníček (cs + en)
  js/views/           obrazovky: home, reader, lesson, quiz, cards, notebook, settings
  js/widgets/         interaktivní animace (funkční stroj, grafy, svislá přímka, …)
  js/ink.js           engine pro psaní perem (přítlak, zvýrazňovač, guma, pravítko)
  vendor/             pdf.js, KaTeX, perfect-freehand, fonty (vše offline)
electron/main.js      desktopová aplikace (okno, vlastní protokol folio://)
tools/                skript na ukázkovou knihu v PDF (npm run sample-pdf)
.github/workflows/    automatické sestavení .exe pro Windows
```

### Přidání další části

1. Zkopíruj `app/content/ch1-1.js` jako např. `ch1-2.js` a přepiš kroky (`steps`), test (`quiz`) a pojmy (`glossary`).
2. Zaregistruj ji v `app/content/book.js` (`sections` a `ready: true`).

Bloky lekce: `lead`, `p`, `def`, `note` (`tip` / `warn` / `lang`), `math`, `list`, `example`, `check`, `widget`, `summary`, `cta`.
Matematika se píše v `$…$` (KaTeX), pojmy ze slovníčku jako `[[definiční obor]]`.

## Licence knihoven

pdf.js (Apache-2.0), KaTeX (MIT), perfect-freehand (MIT), fonty Inter, Literata, Fraunces a Caveat (SIL OFL).
