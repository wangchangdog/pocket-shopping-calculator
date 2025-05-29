import { ShoppingProvider } from "@/context/ShoppingContext";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTaxModeToggle } from "./index";

// モック関数
const mockDispatch = vi.fn();
const mockUseShoppingContext = vi.fn();

// モック設定
vi.mock("@/context/ShoppingContext", async () => {
  const actual = await vi.importActual("@/context/ShoppingContext");
  return {
    ...actual,
    useShoppingContext: () => mockUseShoppingContext(),
  };
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe("useTaxModeToggle", () => {
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

  it("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useTaxModeToggle(), { wrapper });

    expect(result.current.taxMode).toBe("included");
    expect(result.current.taxRate).toBe(10);
    expect(typeof result.current.handleTaxModeChange).toBe("function");
  });

  it("税込モードに変更できる", () => {
    const { result } = renderHook(() => useTaxModeToggle(), { wrapper });

    act(() => {
      result.current.handleTaxModeChange("included");
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_TAX_MODE",
      payload: "included",
    });
  });

  it("税抜モードに変更できる", () => {
    const { result } = renderHook(() => useTaxModeToggle(), { wrapper });

    act(() => {
      result.current.handleTaxModeChange("excluded");
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_TAX_MODE",
      payload: "excluded",
    });
  });

  it("複数回の税モード変更が正しく処理される", () => {
    const { result } = renderHook(() => useTaxModeToggle(), { wrapper });

    act(() => {
      result.current.handleTaxModeChange("excluded");
    });

    act(() => {
      result.current.handleTaxModeChange("included");
    });

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
});

// 税抜モードの初期状態テスト
describe("useTaxModeToggle - 税抜モード初期状態", () => {
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

  it("税抜モードの初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useTaxModeToggle(), { wrapper });

    expect(result.current.taxMode).toBe("excluded");
    expect(result.current.taxRate).toBe(8);
  });
});
