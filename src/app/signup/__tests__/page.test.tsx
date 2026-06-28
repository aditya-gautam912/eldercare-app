import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import SignupPage from "@/app/signup/page";

const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

function renderPage() {
  return render(
    <ThemeProvider>
      <SignupPage />
    </ThemeProvider>
  );
}

beforeEach(() => {
  mockPush.mockClear();
  mockSearchParamsGet.mockReturnValue(null);
});

describe("Signup page", () => {
  it("renders the heading", () => {
    renderPage();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });

  it("renders name, email, and password inputs", () => {
    renderPage();
    expect(screen.getByPlaceholderText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("At least 6 characters")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderPage();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("renders log in link", () => {
    renderPage();
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("submits the form", async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText("Jane Smith"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("At least 6 characters"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Create account"));
  });
});
