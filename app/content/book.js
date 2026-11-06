// Struktura knihy: kapitoly a části. Každá hotová část má svůj soubor s obsahem.
import s11 from './ch1-1.js';

export const book = {
  id: 'kniha-matematika',
  title: { cs: 'Matematika', en: 'Mathematics' },
  subtitle: { cs: 'Interaktivní učebnice', en: 'Interactive textbook' },
  samplePdf: 'assets/ukazka-kniha.pdf',
  chapters: [
    {
      n: 1,
      title: { cs: 'Funkce a modely', en: 'Functions and Models' },
      sections: [
        { id: '1-1', n: '1.1', title: s11.title, ready: true, pdfPage: 3 },
        { id: '1-2', n: '1.2', title: { cs: 'Matematické modely', en: 'Mathematical Models' }, ready: false },
        { id: '1-3', n: '1.3', title: { cs: 'Nové funkce ze starých', en: 'New Functions from Old' }, ready: false },
        { id: '1-4', n: '1.4', title: { cs: 'Exponenciální funkce', en: 'Exponential Functions' }, ready: false },
        { id: '1-5', n: '1.5', title: { cs: 'Inverzní funkce a logaritmy', en: 'Inverse Functions and Logarithms' }, ready: false },
      ],
    },
  ],
};

export const sections = { '1-1': s11 };

export function getSection(id) { return sections[id] || null; }
export function sectionMeta(id) {
  for (const ch of book.chapters) for (const s of ch.sections) if (s.id === id) return { ...s, chapter: ch };
  return null;
}

const allGlossary = Object.values(sections).flatMap(s => s.glossary);
export function glossaryLookup(id) { return allGlossary.find(g => g.id === id) || null; }
export function glossaryAll() { return allGlossary; }
