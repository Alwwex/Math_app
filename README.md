# Folio 3 – interaktivní učebnice k *Mathematical Methods for Physics and Engineering*

Folio dělá z učebnice Riley · Hobson · Bence (3. vydání, 1 363 stran) aplikaci na učení:
knihu, kterou listuješ jako papírovou, lekce s animacemi ke všem 31 kapitolám, testy, kartičky a sešit na psaní perem.
Běží na **Windows** (dotyk + pero), **macOS**, **Linuxu** a ve **webovém prohlížeči** (i na iPadu a Androidu).

## Co v aplikaci je

| | |
|---|---|
| 🔐 **Přihlášení** | Obrazovka jako zamčený iPhone: hodiny, profily s 3D avatary, volitelný PIN. Každý profil má vlastní pokrok, poznámky i sešity. |
| ☀️ **Dnes** | Pokračování tam, kde jsi skončil(a), denní cíle (kroužky), vzorec dne, týdenní aktivita. |
| 📚 **Knihovna** | Všech 31 kapitol podle témat + rozcvička. Každá kapitola má přehled oddílů s čísly stran v knize. |
| 📖 **Kniha** | Tvoje PDF jako opravdová kniha: dvoustrana, otáčení listů ve 3D (prstem, perem, myší), záložky, český obsah, režim na celou plochu, psaní a zvýrazňování přímo do stránek. Nahoře vždy vidíš, ve které kapitole a oddílu jsi. |
| 💡 **Lekce** | 148 kroků výkladu česky / anglicky / obojí, řešené příklady, rychlé otázky, odkaz na stranu v knize. 21 interaktivních animací (komplexní rovina, vektory, matice, vektorová pole, směrová pole ODR, normální módy, Fourierovy řady, brachistochrona, Galtonova deska, Newtonova metoda, regrese, grupy symetrií…). |
| ✅ **Testy** | 235 otázek – test ke každé kapitole, mix z celé knihy, oprava chyb, pomocný papír na výpočty. |
| 🃏 **Kartičky** | 283 pojmů a jejich význam – vše česky i anglicky zároveň. Tři režimy: *Co to znamená?* (pojem → význam), *Který pojem?* (význam → pojem) a *Výběr* ze čtyř významů. Chytré opakování (Leitnerovy krabičky), předčítání v obou jazycích, slovníček s hledáním i podle významu. |
| ✏️ **Sešity** | Papír linkovaný, čtverečkovaný, tečkovaný nebo s osami; pero s přítlakem, zvýrazňovač, guma, pravítko, export do PNG. |
| 📝 **Pomocný papír** | Plovoucí okno, které jde chytit a přesunout kamkoli (myší, prstem i perem), zvětšit tahem za roh, zmenšit na lísteček nebo přichytit k pravému okraji. Je v lekcích, testech, knize i všude jinde (tlačítko v postranním panelu). |
| 🔊 **Předčítání** | Lekce i otázky z testů čte nahlas česky i anglicky, vzorce převádí na slova („integrál od 0 do nekonečna…"), zvýrazňuje čtený odstavec. Hlas a rychlost v Nastavení. |
| 🎵 **Hudba ke studiu** | Sedm klidných skladeb, které se generují přímo v aplikaci (lo-fi klavír, déšť, moře, krb, noční knihovna, hnědý šum…), plus vlastní hudba (MP3, M4A, OGG, WAV). Mini přehrávač v postranním panelu. |
| 😊 **Emoji** | 1 800+ 3D emoji (Microsoft Fluent) – všechna emoji v aplikaci, i ta napsaná, vypadají na každém zařízení stejně. Výběr emoji ve stylu Figmy pro avatar a nálepky na sešity. |

Všechno se ukládá automaticky v zařízení a funguje bez internetu. Zálohu profilu lze uložit a načíst v Nastavení.

## Instalace

Na GitHubu otevři **Actions → Build apps → poslední běh** a dole v sekci **Artifacts** stáhni:

* **Folio-Windows** – `Folio-Setup-3.0.0.exe` (instalace) nebo `Folio-Portable-3.0.0.exe` (bez instalace).
  Na hlášku SmartScreen klikni *Další informace → Přesto spustit* (aplikace není podepsaná certifikátem).
* **Folio-macOS** – `.dmg`. Poprvé otevři přes pravé tlačítko → *Otevřít*.
* **Folio-Linux** – `.AppImage` (nastav jako spustitelný soubor).

Aplikace se spouští **na celou obrazovku**. Vlevo nahoře je „semafor“ jako na Macu: 🔴 zavře aplikaci, 🟡 ji schová do lišty, 🟢 přepíná celou obrazovku ↔ okno (s `Alt` okno maximalizuje). Okno jde přesouvat za horní okraj postranního panelu. `F11` přepíná okno/celou obrazovku, `Ctrl+Q` aplikaci ukončí.

### Ze zdrojového kódu

```bash
npm install
```

```bash
npm start
```

### Web (iPad, Android, prohlížeč)

```bash
npm run web
```

Pak otevři `http://localhost:8080`. V Safari / Chrome jde stránku přidat na plochu a chová se jako aplikace.

## Ovládání

* **Pero vs. prst:** po prvním dotyku perem aplikace přepne na *perem píšeš, prstem listuješ*. Změna v Nastavení.
* **Kniha:** táhni stránku od okraje, klepni na okraj, šipky ← →, kolečko myši; klepnutí doprostřed schová lišty. `B` = záložka.
* **Lekce:** šipky a seznam kroků v horní liště, `Alt+←/→`, nebo klepnutí na proužky průběhu. U každého kroku je odkaz na příslušnou stranu knihy.
* **Zvuky:** jemné ťuknutí u tlačítek a přepínačů, zvuk dokončení kroku, otáčení listů – vše jde vypnout v Nastavení.

## Struktura

```
app/
  book/mmpe.pdf          učebnice (PDF) + obálka
  content/toc.js         obsah knihy s čísly stran (generuje tools/gen-toc.py)
  content/book.js        kapitoly, skupiny, emoji, barvy
  content/chapters/      ch00–ch31: lekce, testy a pojmy (cs + en)
  js/views/              obrazovky (lock, home, library, chapter, lesson, quiz, tests, cards, notebook, reader, settings)
  js/widgets/            interaktivní animace
  emoji/                 3D emoji (Microsoft Fluent Emoji, MIT); emoji/u/ = celá sada, index.json pro výběr
electron/                desktopová aplikace (celá obrazovka, vlastní protokol folio://)
.github/workflows/       sestavení pro Windows, macOS a Linux
```

## Autorská práva

PDF knihy je © Cambridge University Press a je v repozitáři jen pro osobní studium.
Pokud je repozitář veřejný, kniha (i sestavené aplikace, které ji obsahují) je volně ke stažení – doporučuji
repozitář přepnout na **soukromý** (*Settings → General → Danger Zone → Change visibility*).
Lekce, testy a kartičky jsou vlastní studijní materiál, ne text knihy.

Knihovny: pdf.js (Apache-2.0), KaTeX (MIT), perfect-freehand (MIT), Fluent Emoji 3D (MIT, přes @lobehub/fluent-emoji-3d), emojibase-data (MIT, názvy emoji), fonty Inter, Literata, Caveat (OFL).
Apple emoji v aplikaci nejsou – jsou majetkem Applu a jejich licence nedovoluje je přibalit; 3D Fluent emoji mají velmi podobný styl.
