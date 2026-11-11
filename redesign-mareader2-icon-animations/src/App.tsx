import { useEffect } from "react";
import { Dock, Formula } from "./components/Formula";
import { Diagnosis, Hero, Nav } from "./components/Intro";
import { Inspector, Library } from "./components/Library";
import { Footer, InPlace, Port } from "./components/Place";
import { LabProvider, useLab } from "./lab";

const PAPER = { Light: "#ffffff", Dark: "#131316", Dim: "#1a1c1f", Black: "#000000" };

function Shell() {
  const { theme, selected } = useLab();

  // The page behind the app takes the paper colour too, so overscroll matches.
  useEffect(() => {
    document.documentElement.style.background = PAPER[theme];
    document.body.style.background = PAPER[theme];
  }, [theme]);

  return (
    <div
      className={`theme-${theme.toLowerCase()} min-h-screen bg-paper font-sans text-ink transition-colors duration-200`}
    >
      <Nav />
      <main className={selected ? "lg:pr-[452px]" : undefined}>
        <Hero />
        <Diagnosis />
        <Formula />
        <Library />
        <InPlace />
        <Port />
        <Footer />
      </main>
      <Dock />
      <Inspector />
    </div>
  );
}

export default function App() {
  return (
    <LabProvider>
      <Shell />
    </LabProvider>
  );
}
