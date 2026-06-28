import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Button,
  Card,
  Input,
  Badge,
  Spinner,
  EmptyState,
  Toast,
  ConfirmDialog,
  Tooltip,
  Skeleton,
} from "@/components/ui";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="danger">Delete</Button>);
    expect(screen.getByText("Delete")).toHaveClass("bg-red-600");

    rerender(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByText("Cancel")).toHaveClass("border");
  });

  it("disables when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as submit button type", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByText("Submit")).toHaveAttribute("type", "submit");
  });
});

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Inside card</p></Card>);
    expect(screen.getByText("Inside card")).toBeInTheDocument();
  });

  it("calls onClick when provided", () => {
    const onClick = vi.fn();
    render(<Card onClick={onClick}><p>Clickable</p></Card>);
    fireEvent.click(screen.getByText("Clickable"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    render(<Card className="custom-class"><p>Styled</p></Card>);
    expect(screen.getByText("Styled").parentElement).toHaveClass("custom-class");
  });
});

describe("Input", () => {
  it("renders label and input", () => {
    render(<Input label="Email" name="email" placeholder="you@example.com" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Input name="name" placeholder="No label" />);
    expect(screen.getByPlaceholderText("No label")).toBeInTheDocument();
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input name="name" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders with required asterisk", () => {
    render(<Input label="Name" name="name" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("handles value and onChange", () => {
    const onChange = vi.fn();
    render(<Input name="name" value="John" onChange={onChange} />);
    const input = screen.getByDisplayValue("John");
    fireEvent.change(input, { target: { value: "Jane" } });
    expect(onChange).toHaveBeenCalled();
  });
});

describe("Badge", () => {
  it("renders text", () => {
    render(<Badge>Admin</Badge>);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("applies default gray color", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveClass("bg-gray-100");
  });

  it("applies blue color", () => {
    render(<Badge color="blue">Blue</Badge>);
    expect(screen.getByText("Blue")).toHaveClass("bg-indigo-100");
  });

  it("applies green color", () => {
    render(<Badge color="green">Green</Badge>);
    expect(screen.getByText("Green")).toHaveClass("bg-emerald-100");
  });

  it("applies red color", () => {
    render(<Badge color="red">Red</Badge>);
    expect(screen.getByText("Red")).toHaveClass("bg-red-100");
  });

  it("applies yellow color", () => {
    render(<Badge color="yellow">Yellow</Badge>);
    expect(screen.getByText("Yellow")).toHaveClass("bg-amber-100");
  });
});

describe("Spinner", () => {
  it("renders an SVG", () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-spinner" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-spinner");
  });
});

describe("Skeleton", () => {
  it("renders a div with skeleton class", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("skeleton");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-8 w-48" />);
    expect(container.firstChild).toHaveClass("h-8", "w-48");
  });
});

describe("EmptyState", () => {
  it("renders icon, title, and description", () => {
    render(<EmptyState icon="👴" title="No items" description="Add your first item." />);
    expect(screen.getByText("👴")).toBeInTheDocument();
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Add your first item.")).toBeInTheDocument();
  });

  it("renders action element", () => {
    render(
      <EmptyState
        icon="👴"
        title="No items"
        description="Add your first item."
        action={<button>Add</button>}
      />
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });
});

describe("Toast", () => {
  it("renders message", () => {
    render(<Toast message="Saved!" onClose={vi.fn()} />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<Toast message="Saved!" onClose={onClose} />);
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows success emoji", () => {
    render(<Toast message="OK" type="success" onClose={vi.fn()} />);
    expect(screen.getByText("✅")).toBeInTheDocument();
  });

  it("shows error emoji", () => {
    render(<Toast message="Error" type="error" onClose={vi.fn()} />);
    expect(screen.getByText("❌")).toBeInTheDocument();
  });

  it("shows info emoji", () => {
    render(<Toast message="Info" type="info" onClose={vi.fn()} />);
    expect(screen.getByText("ℹ️")).toBeInTheDocument();
  });
});

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders title and message when open", () => {
    render(
      <ConfirmDialog
        open
        title="Confirm"
        message="Are you sure?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Confirm"
        message="Are you sure?"
        confirmLabel="Yes"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("Yes"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button clicked", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Confirm"
        message="Are you sure?"
        cancelLabel="No"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("No"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("Tooltip", () => {
  it("renders children", () => {
    render(<Tooltip text="Helpful hint"><button>Hover me</button></Tooltip>);
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("renders tooltip text", () => {
    render(<Tooltip text="Helpful hint"><button>Hover me</button></Tooltip>);
    expect(screen.getByText("Helpful hint")).toBeInTheDocument();
  });
});
