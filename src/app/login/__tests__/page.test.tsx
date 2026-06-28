import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import LoginPage from "@/app/login/page";

const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

function renderPage() {
  return render(
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  );
}

beforeEach(() => {
  mockPush.mockClear();
  mockSearchParamsGet.mockReturnValue(null);
});

describe("Login page", () => {
  it("renders the heading", () => {
    renderPage();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderPage();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderPage();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    renderPage();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    renderPage();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  it("submits the form with email and password", async () => {
    renderPage();
    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByText("Log in");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);
  });
});
