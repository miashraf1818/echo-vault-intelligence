import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  prefix: string;
  highlight: string;
  className?: string;
}

/** Word-by-word cinematic reveal — slow, calm, Interstellar-grade. */
export function CinematicHeadline({ prefix, highlight, className }: Props) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelectorAll(".word"), { opacity: 1, y: 0, filter: "blur(0px)" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".word",
        { opacity: 0, y: 28, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.4,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const prefixWords = prefix.split(" ");
  const highlightWords = highlight.split(" ");

  return (
    <h1 ref={ref} className={className}>
      {prefixWords.map((w, i) => (
        <span key={`p-${i}`} className="word inline-block">
          {w}&nbsp;
        </span>
      ))}
      <span className="text-gradient">
        {highlightWords.map((w, i) => (
          <span key={`h-${i}`} className="word inline-block">
            {w}
            {i < highlightWords.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </span>
    </h1>
  );
}
