/** Chapter 1 of Pride and Prejudice (public domain), used as the demo page. */
export const PAGE: string[] = [
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
  "“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”",
  "Mr. Bennet replied that he had not.",
  "“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”",
];

export interface Sense {
  pos: string;
  level: string;
  answer: string;
  gloss: string;
  /** The nearest headword, when the word asked is not one itself. */
  near?: string;
}

export interface Entry {
  word: string;
  pair: string;
  senses: Sense[];
}

export const DICT: Record<string, Entry> = {
  acknowledged: {
    word: "acknowledged",
    pair: "English → French",
    senses: [
      { pos: "verb", level: "B1", answer: "reconnaître", gloss: "to admit the knowledge of", near: "acknowledge" },
      { pos: "verb", level: "B2", answer: "accuser réception de", gloss: "to confirm that something has been received", near: "acknowledge" },
      { pos: "adj.", level: "B2", answer: "reconnu", gloss: "generally accepted", near: "acknowledged" },
    ],
  },
  universally: {
    word: "universally",
    pair: "English → French",
    senses: [{ pos: "adv.", level: "C1", answer: "universellement", gloss: "by everyone, everywhere" }],
  },
  fortune: {
    word: "fortune",
    pair: "English → French",
    senses: [
      { pos: "noun", level: "B1", answer: "richesse", gloss: "a large amount of money or property" },
      { pos: "noun", level: "B1", answer: "hasard", gloss: "what happens by chance, good or bad" },
    ],
  },
  possession: {
    word: "possession",
    pair: "English → French",
    senses: [{ pos: "noun", level: "B2", answer: "possession", gloss: "the state of owning something" }],
  },
};

/** CEFR level of each word the page shades. */
export const LEVELS: Record<string, string> = {
  universally: "C1",
  acknowledged: "B1",
  possession: "B2",
  fortune: "B1",
};

export const HIGHLIGHTS = [
  { name: "Yellow", color: "#facc15" },
  { name: "Rose", color: "#fb7185" },
  { name: "Green", color: "#4ade80" },
  { name: "Sky", color: "#60a5fa" },
  { name: "Violet", color: "#c084fc" },
];
