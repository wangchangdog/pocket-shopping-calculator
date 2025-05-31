import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShoppingProvider } from "../../../shared/components/context/ShoppingContext";
import { TaxModeToggle } from "./index";

// モック関数
const mockDispatch = vi.fn();
const mockUseShoppingContext = vi.fn();

// モック設定
vi.mock("../../../shared/components/context/ShoppingContext", async () => {
  const actual = await vi.importActual(
    "../../../shared/components/context/ShoppingContext"
  );
  return {
    ...actual,
    useShoppingContext: () => mockUseShoppingContext(),
  };
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe("TaxModeToggle Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockUseShoppingContext.mockReturnValue({
      dispatch: mockDispatch,
      session: {
        items: [],
        taxMode: "included",
        taxRate: 10,
        totalAmount: 0,
        sessionId: "test-session",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  it("初期状態で正しく表示される", () => {
    render(<TaxModeToggle />, { wrapper });

    expect(screen.getByText("税設定")).toBeInTheDocument();
    expect(screen.getByText("消費税率: 10%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "税込" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "税抜" })).toBeInTheDocument();
  });

  it("税込モードが初期状態でアクティブになっている", () => {
    render(<TaxModeToggle />, { wrapper });

    const includedButton = screen.getByRole("button", { name: "税込" });
    const excludedButton = screen.getByRole("button", { name: "税抜" });

    expect(includedButton).toHaveClass(
      "bg-blue-500",
      "text-white",
      "shadow-sm"
    );
    expect(excludedButton).toHaveClass("text-gray-600", "hover:text-gray-800");
  });

  it("税抜ボタンをクリックすると税モードが変更される", () => {
    render(<TaxModeToggle />, { wrapper });

    const excludedButton = screen.getByRole("button", { name: "税抜" });
    fireEvent.click(excludedButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_TAX_MODE",
      payload: "excluded",
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("税込ボタンをクリックすると税モードが変更される", () => {
    render(<TaxModeToggle />, { wrapper });

    const includedButton = screen.getByRole("button", { name: "税込" });
    fireEvent.click(includedButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_TAX_MODE",
      payload: "included",
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("複数回のクリックが正しく処理される", () => {
    render(<TaxModeToggle />, { wrapper });

    const includedButton = screen.getByRole("button", { name: "税込" });
    const excludedButton = screen.getByRole("button", { name: "税抜" });

    // 税抜に変更
    fireEvent.click(excludedButton);

    // 税込に戻す
    fireEvent.click(includedButton);

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: "SET_TAX_MODE",
      payload: "excluded",
    });
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: "SET_TAX_MODE",
      payload: "included",
    });
  });

  it("同じボタンを複数回クリックしても正しく処理される", () => {
    render(<TaxModeToggle />, { wrapper });

    const includedButton = screen.getByRole("button", { name: "税込" });

    // 同じボタンを2回クリック
    fireEvent.click(includedButton);
    fireEvent.click(includedButton);

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenNthCalledWith(1, {
      type: "SET_TAX_MODE",
      payload: "included",
    });
    expect(mockDispatch).toHaveBeenNthCalledWith(2, {
      type: "SET_TAX_MODE",
      payload: "included",
    });
  });
});

// 税抜モード初期状態のテスト
describe("TaxModeToggle Integration - 税抜モード初期状態", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 税抜モード用のモック
    mockUseShoppingContext.mockReturnValue({
      dispatch: mockDispatch,
      session: {
        items: [],
        taxMode: "excluded",
        taxRate: 8,
        totalAmount: 0,
        sessionId: "test-session",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  it("税抜モードが初期状態でアクティブになっている", () => {
    render(<TaxModeToggle />, { wrapper });

    const includedButton = screen.getByRole("button", { name: "税込" });
    const excludedButton = screen.getByRole("button", { name: "税抜" });

    expect(excludedButton).toHaveClass(
      "bg-blue-500",
      "text-white",
      "shadow-sm"
    );
    expect(includedButton).toHaveClass("text-gray-600", "hover:text-gray-800");
  });

  it("異なる税率が正しく表示される", () => {
    render(<TaxModeToggle />, { wrapper });

    expect(screen.getByText("消費税率: 8%")).toBeInTheDocument();
    expect(screen.queryByText("消費税率: 10%")).not.toBeInTheDocument();
  });
});
