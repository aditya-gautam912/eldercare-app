import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import ForgotPasswordPage from "@/app/forgot-password/page";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

function renderPage() {
  return render(
    <ThemeProvider>
      <ForgotPasswordPage />
    </ThemeProvider>
  );
}

describe("Forgot password page", () => {
  it("renders heading", () => {
    renderPage();
    expect(screen.getByText("Reset your password")).toBeInTheDocument();
  });

  it("renders email input and submit button", () => {
    renderPage();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByText("Send reset link")).toBeInTheDocument();
  });

  it("renders login link", () => {
    renderPage();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("submits email and shows success state", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByText("Send reset link"));
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
  });
});
