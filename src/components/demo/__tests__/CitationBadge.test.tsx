/**
 * Tests for `CitationBadge`.
 *
 * Covers the confidence → tier mapping defined in design.md (color signal palette):
 *   - confidence ≥ 0.9   → "high"   (emerald token)
 *   - 0.7 ≤ conf < 0.9   → "medium" (cobalt accent)
 *   - confidence < 0.7   → "low"    (muted-foreground)
 *
 * Validates Requirements: 7.7, 10.5.
 *
 * The exported `confidenceTier` helper is the source of truth for the mapping;
 * we exercise it directly and also assert that the rendered trigger button
 * carries the matching `data-confidence-tier` attribute so a viewer can
 * verify the visual tier without depending on Tailwind class strings.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CitationBadge, confidenceTier } from "../CitationBadge";

const mkCitation = (confidence: number) => ({
  chunk_id: "00000000-0000-0000-0000-000000000001",
  source: "whatsapp:demo.txt",
  date: "2024-03-15T09:42:00Z",
  confidence,
  excerpt: "test excerpt",
});

describe("CitationBadge", () => {
  it("uses emerald tier for confidence ≥ 0.9", () => {
    expect(confidenceTier(0.95)).toBe("high");

    render(<CitationBadge citation={mkCitation(0.95)} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-confidence-tier",
      "high",
    );
  });

  it("uses cobalt tier for 0.7 ≤ confidence < 0.9", () => {
    expect(confidenceTier(0.8)).toBe("medium");

    render(<CitationBadge citation={mkCitation(0.8)} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-confidence-tier",
      "medium",
    );
  });

  it("uses muted-foreground tier for confidence < 0.7", () => {
    expect(confidenceTier(0.5)).toBe("low");

    render(<CitationBadge citation={mkCitation(0.5)} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-confidence-tier",
      "low",
    );
  });
});
