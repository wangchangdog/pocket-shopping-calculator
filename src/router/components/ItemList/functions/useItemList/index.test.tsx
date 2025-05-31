import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShoppingProvider } from "../../../../../shared/components/context/ShoppingContext";
import type { ShoppingItem } from "../../../../../types";
import { useItemList } from "./index";

// テスト用商品データ
const mockItems: ShoppingItem[] = [
  {
    id: "item-1",
    name: "商品1",
    price: 100,
    quantity: 1,
    addedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "item-2",
    name: "商品2",
    price: 200,
    quantity: 2,
    addedAt: "2024-01-01T00:00:00.000Z",
  },
];

// モック関数
const mockDispatch = vi.fn();

vi.mock(
  "../../../../../shared/components/context/ShoppingContext",
  async () => {
    const actual = await vi.importActual(
      "../../../../../shared/components/context/ShoppingContext"
    );
    return {
      ...actual,
      useShoppingContext: () => ({
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
      }),
    };
  }
);

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe("useItemList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockDispatch.mockReturnValue({
      dispatch: mockDispatch,
      session: {
        items: mockItems,
        taxMode: "included",
        taxRate: 10,
        totalAmount: 500,
        sessionId: "test-session",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    });
  });

  it("商品一覧を取得できる", () => {
    const { result } = renderHook(() => useItemList(), { wrapper });

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.items).toHaveLength(2);
  });

  it("商品がある場合に全削除確認後にCLEAR_SESSIONが実行される", () => {
    const { result } = renderHook(() => useItemList(), { wrapper });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    act(() => {
      result.current.handleClearAll();
    });

    expect(confirmSpy).toHaveBeenCalledWith("すべての商品を削除しますか？");
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLEAR_SESSION" });
  });

  it("全削除をキャンセルできる", () => {
    const { result } = renderHook(() => useItemList(), { wrapper });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    act(() => {
      result.current.handleClearAll();
    });

    expect(confirmSpy).toHaveBeenCalledWith("すべての商品を削除しますか？");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("商品が空の場合は全削除処理を実行しない", () => {
    // 空の商品リスト用のモック
    mockDispatch.mockReturnValue({
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

    const { result } = renderHook(() => useItemList(), { wrapper });
    const confirmSpy = vi.spyOn(window, "confirm");

    act(() => {
      result.current.handleClearAll();
    });

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
