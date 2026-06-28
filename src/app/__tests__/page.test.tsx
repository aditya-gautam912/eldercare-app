import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/app/page";

function renderPage() {
  return render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  );
}

describe("Landing page", () => {
  it("renders the hero heading", () => {
    renderPage();
    expect(screen.getByText("Caring for your loved ones,")).toBeInTheDocument();
    expect(screen.getByText("together")).toBeInTheDocument();
  });

  it("renders Get started and Log in buttons", () => {
    renderPage();
    const links = screen.getAllByText("Get started");
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Log in").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the features section", () => {
    renderPage();
    expect(screen.getByText("Everything your family needs")).toBeInTheDocument();
    expect(screen.getByText("Medication tracking")).toBeInTheDocument();
    expect(screen.getByText("Daily check-ins")).toBeInTheDocument();
    expect(screen.getByText("Family feed")).toBeInTheDocument();
    expect(screen.getByText("Emergency alerts")).toBeInTheDocument();
    expect(screen.getByText("Emergency contacts")).toBeInTheDocument();
    expect(screen.getByText("Invite family")).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    renderPage();
    expect(screen.getByText("Ready to get started?")).toBeInTheDocument();
    expect(screen.getByText("Create your free account")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    renderPage();
    expect(
      screen.getByText(
        "CareCircle helps families coordinate care for aging parents and loved ones. Track medications, share daily check-ins, and keep everyone in the loop."
      )
    ).toBeInTheDocument();
  });

  it("renders footer with current year", () => {
    renderPage();
    expect(
      screen.getByText(new RegExp(`© ${new Date().getFullYear()} CareCircle`))
    ).toBeInTheDocument();
  });
});
