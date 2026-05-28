/**
 * Tests for `ReflectionChat`.
 *
 * Covers Requirements 7.7, 7.8, 11.2:
 *   - The "Analytical Companion Mode" indicator is visible on mount.
 *   - The send button is disabled while the `reflect` mutation is pending
 *     (we keep the mock pending with a never-resolving Promise).
 *   - Clicking a suggested-question chip populates the composer input
 *     rather than auto-sending, so the user stays in control.
 *
 * The api-client is mocked so no real network call is made — `reflect` is
 * stubbed and we never resolve it for the disabled-state test, which mirrors
 * the natural pending state of a React Query mutation.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock the api-client BEFORE importing ReflectionChat so the mutation hook
// picks up our stub for `reflect` (the hook closes over the imported symbol).
vi.mock("../../../services/api-client", async () => {
  const actual = await vi.importActual<
    typeof import("../../../services/api-client")
  >("../../../services/api-client");
  return {
    ...actual,
    reflect: vi.fn(),
  };
});

// Importing AFTER the mock so the module graph wires our spy in.
import { ReflectionChat } from "../ReflectionChat";
import { reflect } from "../../../services/api-client";

const mockedReflect = vi.mocked(reflect);

function renderWithClient(ui: ReactNode) {
  // Fresh QueryClient per test, with retries off so failures surface immediately.
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

function getComposerInput(): HTMLInputElement {
  // Exact match avoids collision with the send button's aria-label
  // ("Send reflection prompt"), which also contains the substring.
  return screen.getByLabelText("Reflection prompt") as HTMLInputElement;
}

function getSendButton(): HTMLButtonElement {
  return screen.getByRole("button", {
    name: "Send reflection prompt",
  }) as HTMLButtonElement;
}

describe("ReflectionChat", () => {
  beforeEach(() => {
    mockedReflect.mockReset();
    // jsdom doesn't implement scrollIntoView, but the component calls it in a
    // useEffect to keep the message list pinned to the latest turn. Stubbing
    // it once per test keeps the effect from blowing up the render.
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = vi.fn();
    }
  });

  it('displays the "Analytical Companion Mode" indicator', () => {
    renderWithClient(<ReflectionChat />);
    expect(
      screen.getByText(/analytical companion mode/i),
    ).toBeInTheDocument();
  });

  it("disables the send button while the reflect mutation is pending", async () => {
    const user = userEvent.setup();
    // Never-resolving promise → mutation stays pending for the duration of
    // the test, which is exactly what we need to assert the disabled state.
    mockedReflect.mockImplementation(() => new Promise(() => {}));

    renderWithClient(<ReflectionChat />);

    // Button starts disabled because the composer is empty.
    expect(getSendButton()).toBeDisabled();

    await user.type(getComposerInput(), "What patterns do you see?");
    // Now enabled because we have non-empty input and no pending mutation.
    expect(getSendButton()).not.toBeDisabled();

    await user.click(getSendButton());

    // Mutation fired and is pending → button must be disabled again.
    expect(mockedReflect).toHaveBeenCalledTimes(1);
    expect(getSendButton()).toBeDisabled();
  });

  it("populates the composer when a suggested-question chip is clicked", async () => {
    const user = userEvent.setup();
    const starter = "How did my view of growth shift over time?";
    renderWithClient(
      <ReflectionChat suggestedQuestions={[starter, "Other question"]} />,
    );

    // The chip is rendered as a button with the question as its accessible name.
    const chip = screen.getByRole("button", { name: starter });
    await user.click(chip);

    // Composer should now hold the chip text and the mutation must NOT have
    // been called — chips populate, they don't auto-send.
    expect(getComposerInput().value).toBe(starter);
    expect(mockedReflect).not.toHaveBeenCalled();
  });
});
