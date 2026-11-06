#!/usr/bin/env python3
"""Vygeneruje app/content/toc.js z osnovy (bookmarků) PDF + české překlady názvů.
Použití: python3 tools/gen-toc.py   (potřebuje pypdf)"""
import json, re, sys, pathlib
import pypdf

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF = ROOT / 'app' / 'book' / 'mmpe.pdf'

CS = {
 '1': 'Předběžná algebra',
 '1.1': 'Jednoduché funkce a rovnice', '1.2': 'Goniometrické identity', '1.3': 'Analytická geometrie', '1.4': 'Parciální zlomky',
 '1.5': 'Binomický rozvoj', '1.6': 'Vlastnosti binomických koeficientů', '1.7': 'Některé metody důkazu',
 '2': 'Základy diferenciálního a integrálního počtu',
 '2.1': 'Derivace', '2.2': 'Integrace',
 '3': 'Komplexní čísla a hyperbolické funkce',
 '3.1': 'Proč potřebujeme komplexní čísla', '3.2': 'Počítání s komplexními čísly', '3.3': 'Goniometrický a exponenciální tvar',
 '3.4': 'Moivreova věta', '3.5': 'Komplexní logaritmus a komplexní mocniny', '3.6': 'Použití při derivování a integrování', '3.7': 'Hyperbolické funkce',
 '4': 'Řady a limity',
 '4.1': 'Řady', '4.2': 'Sčítání řad', '4.3': 'Konvergence nekonečných řad', '4.4': 'Operace s řadami', '4.5': 'Mocninné řady',
 '4.6': 'Taylorovy řady', '4.7': 'Výpočet limit',
 '5': 'Parciální derivace',
 '5.1': 'Definice parciální derivace', '5.2': 'Totální diferenciál a totální derivace', '5.3': 'Úplné a neúplné diferenciály',
 '5.4': 'Užitečné věty o parciálních derivacích', '5.5': 'Řetízkové pravidlo', '5.6': 'Záměna proměnných',
 '5.7': 'Taylorova věta pro funkce více proměnných', '5.8': 'Stacionární body funkcí více proměnných', '5.9': 'Vázané extrémy',
 '5.10': 'Obálky', '5.11': 'Termodynamické vztahy', '5.12': 'Derivování integrálů',
 '6': 'Vícenásobné integrály',
 '6.1': 'Dvojné integrály', '6.2': 'Trojné integrály', '6.3': 'Použití vícenásobných integrálů', '6.4': 'Substituce ve vícenásobných integrálech',
 '7': 'Vektorová algebra',
 '7.1': 'Skaláry a vektory', '7.2': 'Sčítání a odčítání vektorů', '7.3': 'Násobení skalárem', '7.4': 'Báze a složky',
 '7.5': 'Velikost vektoru', '7.6': 'Násobení vektorů', '7.7': 'Rovnice přímek, rovin a koulí', '7.8': 'Vzdálenosti pomocí vektorů', '7.9': 'Reciproké vektory',
 '8': 'Matice a vektorové prostory',
 '8.1': 'Vektorové prostory', '8.2': 'Lineární operátory', '8.3': 'Matice', '8.4': 'Základní maticová algebra', '8.5': 'Funkce matic',
 '8.6': 'Transponovaná matice', '8.7': 'Komplexně sdružená a hermitovsky sdružená matice', '8.8': 'Stopa matice', '8.9': 'Determinant matice',
 '8.10': 'Inverzní matice', '8.11': 'Hodnost matice', '8.12': 'Speciální typy čtvercových matic', '8.13': 'Vlastní vektory a vlastní čísla',
 '8.14': 'Výpočet vlastních čísel a vektorů', '8.15': 'Změna báze a podobnostní transformace', '8.16': 'Diagonalizace matic',
 '8.17': 'Kvadratické a hermitovské formy', '8.18': 'Soustavy lineárních rovnic',
 '9': 'Normální módy',
 '9.1': 'Typické kmitající soustavy', '9.2': 'Symetrie a normální módy', '9.3': 'Rayleighova–Ritzova metoda',
 '10': 'Vektorová analýza',
 '10.1': 'Derivování vektorů', '10.2': 'Integrování vektorů', '10.3': 'Prostorové křivky', '10.4': 'Vektorové funkce více proměnných',
 '10.5': 'Plochy', '10.6': 'Skalární a vektorová pole', '10.7': 'Vektorové operátory', '10.8': 'Vzorce pro vektorové operátory',
 '10.9': 'Válcové a sférické souřadnice', '10.10': 'Obecné křivočaré souřadnice',
 '11': 'Křivkové, plošné a objemové integrály',
 '11.1': 'Křivkové integrály', '11.2': 'Souvislost oblastí', '11.3': 'Greenova věta v rovině', '11.4': 'Konzervativní pole a potenciály',
 '11.5': 'Plošné integrály', '11.6': 'Objemové integrály', '11.7': 'Integrální tvary gradientu, divergence a rotace',
 '11.8': 'Gaussova věta a příbuzné věty', '11.9': 'Stokesova věta a příbuzné věty',
 '12': 'Fourierovy řady',
 '12.1': 'Dirichletovy podmínky', '12.2': 'Fourierovy koeficienty', '12.3': 'Využití symetrie', '12.4': 'Nespojité funkce',
 '12.5': 'Neperiodické funkce', '12.6': 'Integrace a derivace', '12.7': 'Komplexní Fourierova řada', '12.8': 'Parsevalova věta',
 '13': 'Integrální transformace',
 '13.1': 'Fourierova transformace', '13.2': 'Laplaceova transformace', '13.3': 'Závěrečné poznámky',
 '14': 'Obyčejné diferenciální rovnice 1. řádu',
 '14.1': 'Obecný tvar řešení', '14.2': 'Rovnice prvního řádu a prvního stupně', '14.3': 'Rovnice prvního řádu vyššího stupně',
 '15': 'Obyčejné diferenciální rovnice vyšších řádů',
 '15.1': 'Lineární rovnice s konstantními koeficienty', '15.2': 'Lineární rovnice s proměnnými koeficienty', '15.3': 'Obecné obyčejné diferenciální rovnice',
 '16': 'Řešení diferenciálních rovnic pomocí řad',
 '16.1': 'Lineární ODR druhého řádu', '16.2': 'Řešení řadou kolem regulárního bodu', '16.3': 'Řešení řadou kolem regulárního singulárního bodu',
 '16.4': 'Jak získat druhé řešení', '16.5': 'Polynomiální řešení',
 '17': 'Metody vlastních funkcí pro diferenciální rovnice',
 '17.1': 'Systémy funkcí', '17.2': 'Adjungované, samoadjungované a hermitovské operátory', '17.3': 'Vlastnosti hermitovských operátorů',
 '17.4': 'Sturmovy–Liouvilleovy rovnice', '17.5': 'Superpozice vlastních funkcí: Greenovy funkce', '17.6': 'Užitečné zobecnění',
 '18': 'Speciální funkce',
 '18.1': 'Legendreovy funkce', '18.2': 'Přidružené Legendreovy funkce', '18.3': 'Kulové funkce', '18.4': 'Čebyševovy funkce',
 '18.5': 'Besselovy funkce', '18.6': 'Sférické Besselovy funkce', '18.7': 'Laguerrovy funkce', '18.8': 'Přidružené Laguerrovy funkce',
 '18.9': 'Hermitovy funkce', '18.10': 'Hypergeometrické funkce', '18.11': 'Konfluentní hypergeometrické funkce', '18.12': 'Funkce gama a příbuzné funkce',
 '19': 'Kvantové operátory',
 '19.1': 'Operátorový formalismus', '19.2': 'Fyzikální příklady operátorů',
 '20': 'Parciální diferenciální rovnice: obecná a partikulární řešení',
 '20.1': 'Důležité parciální diferenciální rovnice', '20.2': 'Obecný tvar řešení', '20.3': 'Obecná a partikulární řešení',
 '20.4': 'Vlnová rovnice', '20.5': 'Rovnice difuze', '20.6': 'Charakteristiky a existence řešení', '20.7': 'Jednoznačnost řešení',
 '21': 'Parciální diferenciální rovnice: separace proměnných a další metody',
 '21.1': 'Separace proměnných: obecná metoda', '21.2': 'Superpozice separovaných řešení', '21.3': 'Separace proměnných v polárních souřadnicích',
 '21.4': 'Metody integrálních transformací', '21.5': 'Nehomogenní úlohy – Greenovy funkce',
 '22': 'Variační počet',
 '22.1': 'Eulerova–Lagrangeova rovnice', '22.2': 'Speciální případy', '22.3': 'Některá rozšíření', '22.4': 'Vázaná variace',
 '22.5': 'Fyzikální variační principy', '22.6': 'Obecné úlohy na vlastní čísla', '22.7': 'Odhad vlastních čísel a vlastních funkcí', '22.8': 'Ladění parametrů',
 '23': 'Integrální rovnice',
 '23.1': 'Integrální rovnice z diferenciální rovnice', '23.2': 'Typy integrálních rovnic', '23.3': 'Operátorový zápis a existence řešení',
 '23.4': 'Řešení v uzavřeném tvaru', '23.5': 'Neumannova řada', '23.6': 'Fredholmova teorie', '23.7': 'Schmidtova–Hilbertova teorie',
 '24': 'Funkce komplexní proměnné',
 '24.1': 'Funkce komplexní proměnné', '24.2': 'Cauchyovy–Riemannovy podmínky', '24.3': 'Mocninné řady v komplexní proměnné',
 '24.4': 'Některé elementární funkce', '24.5': 'Mnohoznačné funkce a řezy', '24.6': 'Singularity a nulové body komplexních funkcí',
 '24.7': 'Konformní zobrazení', '24.8': 'Komplexní integrály', '24.9': 'Cauchyova věta', '24.10': 'Cauchyův integrální vzorec',
 '24.11': 'Taylorovy a Laurentovy řady', '24.12': 'Reziduová věta', '24.13': 'Určité integrály pomocí integrace po křivce',
 '25': 'Aplikace funkcí komplexní proměnné',
 '25.1': 'Komplexní potenciály', '25.2': 'Použití konformních zobrazení', '25.3': 'Lokalizace nulových bodů', '25.4': 'Sčítání řad',
 '25.5': 'Inverzní Laplaceova transformace', '25.6': 'Stokesova rovnice a Airyho integrály', '25.7': 'Metoda WKB', '25.8': 'Aproximace integrálů',
 '26': 'Tenzory',
 '26.1': 'Značení', '26.2': 'Změna báze', '26.3': 'Kartézské tenzory', '26.4': 'Kartézské tenzory nultého a prvního řádu',
 '26.5': 'Kartézské tenzory druhého a vyšších řádů', '26.6': 'Algebra tenzorů', '26.7': 'Podílové pravidlo', '26.8': 'Tenzory δij a εijk',
 '26.9': 'Izotropní tenzory', '26.10': 'Nevlastní rotace a pseudotenzory', '26.11': 'Duální tenzory', '26.12': 'Fyzikální aplikace tenzorů',
 '26.13': 'Integrální věty pro tenzory', '26.14': 'Nekartézské souřadnice', '26.15': 'Metrický tenzor', '26.16': 'Obecné transformace souřadnic a tenzory',
 '26.17': 'Relativní tenzory', '26.18': 'Derivace bázových vektorů a Christoffelovy symboly', '26.19': 'Kovariantní derivace',
 '26.20': 'Vektorové operátory v tenzorovém zápisu', '26.21': 'Absolutní derivace podél křivek', '26.22': 'Geodetiky',
 '27': 'Numerické metody',
 '27.1': 'Algebraické a transcendentní rovnice', '27.2': 'Konvergence iteračních schémat', '27.3': 'Soustavy lineárních rovnic',
 '27.4': 'Numerická integrace', '27.5': 'Konečné diference', '27.6': 'Diferenciální rovnice', '27.7': 'Rovnice vyšších řádů', '27.8': 'Parciální diferenciální rovnice',
 '28': 'Teorie grup',
 '28.1': 'Grupy', '28.2': 'Konečné grupy', '28.3': 'Neabelovské grupy', '28.4': 'Permutační grupy', '28.5': 'Zobrazení mezi grupami',
 '28.6': 'Podgrupy', '28.7': 'Rozklad grupy',
 '29': 'Teorie reprezentací',
 '29.1': 'Dipólové momenty molekul', '29.2': 'Volba vhodného formalismu', '29.3': 'Ekvivalentní reprezentace', '29.4': 'Reducibilita reprezentace',
 '29.5': 'Věta o ortogonalitě ireducibilních reprezentací', '29.6': 'Charaktery', '29.7': 'Počítání ireducibilních reprezentací pomocí charakterů',
 '29.8': 'Sestavení tabulky charakterů', '29.9': 'Značení grup', '29.10': 'Součinové reprezentace', '29.11': 'Fyzikální aplikace teorie grup',
 '30': 'Pravděpodobnost',
 '30.1': 'Vennovy diagramy', '30.2': 'Pravděpodobnost', '30.3': 'Permutace a kombinace', '30.4': 'Náhodné veličiny a rozdělení',
 '30.5': 'Vlastnosti rozdělení', '30.6': 'Funkce náhodných veličin', '30.7': 'Vytvořující funkce', '30.8': 'Důležitá diskrétní rozdělení',
 '30.9': 'Důležitá spojitá rozdělení', '30.10': 'Centrální limitní věta', '30.11': 'Sdružená rozdělení', '30.12': 'Vlastnosti sdružených rozdělení',
 '30.13': 'Vytvořující funkce sdružených rozdělení', '30.14': 'Transformace proměnných ve sdružených rozděleních', '30.15': 'Důležitá sdružená rozdělení',
 '31': 'Statistika',
 '31.1': 'Pokusy, výběry a populace', '31.2': 'Výběrové charakteristiky', '31.3': 'Odhady a výběrová rozdělení', '31.4': 'Některé základní odhady',
 '31.5': 'Metoda maximální věrohodnosti', '31.6': 'Metoda nejmenších čtverců', '31.7': 'Testování hypotéz',
}

r = pypdf.PdfReader(str(PDF))
def walk(items, d=0, out=None):
    out = [] if out is None else out
    for it in items:
        if isinstance(it, list): walk(it, d + 1, out)
        else:
            try: p = r.get_destination_page_number(it) + 1
            except Exception: p = None
            out.append((d, it.title, p))
    return out

chapters, cur, started = [], None, False
for d, title, page in walk(r.outline):
    if d == 0 and title == '1 Preliminary algebra': started = True
    if not started: continue
    if d == 0 and title == 'Index': break
    m = re.match(r'^(\d+(?:\.\d+)?)\s+(.*)$', title)
    if not m: continue
    num, name = m.group(1), m.group(2).replace('’', "'")
    if d == 0:
        cur = {'n': int(num), 'page': page, 'title': {'cs': CS[num], 'en': name}, 'sections': []}
        chapters.append(cur)
    elif d == 1 and cur:
        if name.startswith('Exercises'): cur['exercises'] = page; continue
        if name.startswith('Hints and answers'): cur['answers'] = page; continue
        if num == '26.8': name = 'The tensors δij and εijk'
        cur['sections'].append({'n': num, 'page': page, 'title': {'cs': CS[num], 'en': name}})

for i, ch in enumerate(chapters):
    ch['end'] = (chapters[i + 1]['page'] - 1) if i + 1 < len(chapters) else 1334

out = ROOT / 'app' / 'content' / 'toc.js'
out.write_text('// Vygenerováno skriptem tools/gen-toc.py – obsah knihy s čísly stran PDF.\n'
               f'export const PAGES = {len(r.pages)};\n'
               'export const toc = ' + json.dumps(chapters, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
print('chapters', len(chapters), 'sections', sum(len(c['sections']) for c in chapters), '->', out)
