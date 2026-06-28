import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

beforeEach(() => {
  mockPush.mockClear();
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

describe("Header", () => {
  it("renders CareCircle brand link", () => {
    renderWithProvider(<Header />);
    const links = screen.getAllByText("CareCircle");
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("renders user name when provided", () => {
    renderWithProvider(<Header userName="john@example.com" />);
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("renders back button when backHref is provided", () => {
    renderWithProvider(<Header backHref="/dashboard" />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("does not render back button when backHref is not provided", () => {
    renderWithProvider(<Header />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("renders log out button on desktop", () => {
    renderWithProvider(<Header />);
    expect(screen.getAllByText("Log out").length).toBeGreaterThanOrEqual(1);
  });

  it("renders dark mode toggle button", () => {
    renderWithProvider(<Header />);
    const buttons = screen.getAllByRole("button", { name: /toggle dark mode/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("opens mobile menu when hamburger is clicked", () => {
    renderWithProvider(<Header userName="john@example.com" />);
    const menuButton = screen.getByRole("button", { name: /menu/i });
    fireEvent.click(menuButton);
    const elements = screen.getAllByText("john@example.com");
    expect(elements.length).toBe(2);
  });
});
