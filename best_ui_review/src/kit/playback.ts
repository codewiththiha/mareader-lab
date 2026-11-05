import { useEffect, useState } from "react";

export const SENTENCE = `When she is secure of him, there will be more leisure for falling in love as much as she chooses.`;
export const WORDS = SENTENCE.split(" ");
export const BOOK = "Pride and Prejudice, by Jane Austen";

/** A fake narrator: advances one word every ~330 ms at 1×. */
export function usePlayback(start = 8) {
  const [playing, setPlaying] = useState(true);
  const [word, setWord] = useState(start);
  const [progress, setProgress] = useState(0.06);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setWord((w) => (w + 1) % WORDS.length);
      setProgress((p) => (p >= 1 ? 0 : p + 0.0025));
    }, 330 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);
  return { playing, setPlaying, toggle: () => setPlaying((p) => !p), word, progress, setProgress, speed, setSpeed };
}
export type Playback = ReturnType<typeof usePlayback>;

export function leftText(progress: number, totalH = 14.9) {
  const h = totalH * (1 - progress);
  return h >= 1 ? `${Math.round(h)}h` : `${Math.round(h * 60)}m`;
}
