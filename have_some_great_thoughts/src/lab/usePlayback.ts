import { useCallback, useEffect, useState } from "react";

/** The sentences are from the README's own screenshot (Pride and Prejudice, ch. 6). */
export const SENTENCES = [
  "Jane should therefore make the most of every half-hour in which she can command his attention.",
  "When she is secure of him, there will be more leisure for falling in love as much as she chooses.",
  "\u201CYour plan is a good one,\u201D replied Elizabeth, \u201Cwhere nothing is in question but the desire of being well married.\u201D",
];

export function usePlayback(initial = true) {
  const [playing, setPlaying] = useState(initial);
  const [progress, setProgress] = useState(0.06);
  const [sentence, setSentence] = useState(1);
  const [word, setWord] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setWord((w) => {
        const n = SENTENCES[sentence].split(" ").length;
        if (w + 1 >= n) {
          setSentence((s) => (s + 1) % SENTENCES.length);
          return 0;
        }
        return w + 1;
      });
      setProgress((p) => (p >= 0.995 ? 0.02 : p + 0.0016 * rate));
    }, 340 / rate);
    return () => clearInterval(id);
  }, [playing, sentence, rate]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);
  const step = useCallback((d: number) => {
    setSentence((s) => (s + d + SENTENCES.length) % SENTENCES.length);
    setWord(0);
  }, []);
  return { playing, toggle, progress, setProgress, sentence, word, step, rate, setRate };
}

export type Playback = ReturnType<typeof usePlayback>;

export const RATES = [0.75, 1, 1.25, 1.5, 2];

/** "14h" style: hours left until the end of a ~16 h book. */
export function left(progress: number, totalMin = 16 * 60) {
  const m = Math.round(totalMin * (1 - progress));
  return m >= 90 ? `${Math.round(m / 60)}h` : `${m}m`;
}
