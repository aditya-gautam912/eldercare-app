import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/components/theme-provider";

function TestConsumer() {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggle}>
        Toggle
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <TestConsumer />
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe("ThemeProvider", () => {
  it("defaults to light theme", () => {
    renderWithProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("toggles from light to dark", () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles from dark to light", () => {
    localStorage.setItem("theme", "dark");
    renderWithProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists theme to localStorage", () => {
    renderWithProvider();
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(localStorage.getItem("theme")).toBe("dark");
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("respects localStorage theme on mount", () => {
    localStorage.setItem("theme", "dark");
    renderWithProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("respects prefers-color-scheme: dark when no stored theme", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    renderWithProvider();
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
