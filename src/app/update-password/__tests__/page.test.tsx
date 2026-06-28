import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import UpdatePasswordPage from "@/app/update-password/page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "test-user" } } },
      }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

function renderPage() {
  return render(
    <ThemeProvider>
      <UpdatePasswordPage />
    </ThemeProvider>
  );
}

describe("Update password page", () => {
  it("renders heading after session check", async () => {
    renderPage();
    expect(await screen.findByText("Set new password")).toBeInTheDocument();
  });

  it("renders password input and submit button", async () => {
    renderPage();
    expect(await screen.findByPlaceholderText("At least 6 characters")).toBeInTheDocument();
    expect(await screen.findByText("Update password")).toBeInTheDocument();
  });
});
