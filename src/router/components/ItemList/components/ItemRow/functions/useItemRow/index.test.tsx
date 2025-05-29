import { ShoppingProvider } from "@/context/ShoppingContext";
import type { ShoppingItem } from "@/types";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useItemRow } from "./index";

// モック設定
const mockDispatch = vi.fn();

vi.mock("@/context/ShoppingContext", async () => {
  const actual = await vi.importActual("@/context/ShoppingContext");
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
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

// テスト用商品データ
const testItem: ShoppingItem = {
  id: "test-item-1",
  name: "テスト商品",
  price: 100,
  quantity: 2,
  addedAt: "2024-01-01T00:00:00.000Z",
};

describe("useItemRow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(window, "confirm").mockImplementation(() => true);
  });

  it("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editQuantity).toBe("2");
  });

  it("編集モードを開始できる", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });

    act(() => {
      result.current.handleQuantityEdit();
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.editQuantity).toBe("2");
  });

  it("編集数量を更新できる", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });

    act(() => {
      result.current.setEditQuantity("5");
    });

    expect(result.current.editQuantity).toBe("5");
  });

  it("有効な数量で更新を送信できる", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });

    act(() => {
      result.current.handleQuantityEdit();
    });

    act(() => {
      result.current.setEditQuantity("3");
    });

    act(() => {
      result.current.handleQuantitySubmit();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "UPDATE_QUANTITY",
      payload: { id: "test-item-1", quantity: 3 },
    });
    expect(result.current.isEditing).toBe(false);
  });

  it("無効な数量でエラーが表示される", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    act(() => {
      result.current.handleQuantityEdit();
    });

    act(() => {
      result.current.setEditQuantity("0");
    });

    act(() => {
      result.current.handleQuantitySubmit();
    });

    expect(alertSpy).toHaveBeenCalledWith("正しい数量を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  it("NaNの数量でエラーが表示される", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    act(() => {
      result.current.handleQuantityEdit();
    });

    act(() => {
      result.current.setEditQuantity("abc");
    });

    act(() => {
      result.current.handleQuantitySubmit();
    });

    expect(alertSpy).toHaveBeenCalledWith("正しい数量を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("編集をキャンセルできる", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });

    act(() => {
      result.current.handleQuantityEdit();
    });

    act(() => {
      result.current.setEditQuantity("5");
    });

    act(() => {
      result.current.handleQuantityCancel();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.editQuantity).toBe("2"); // 元の値に戻る
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("削除確認後に商品を削除できる", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    act(() => {
      result.current.handleDelete();
    });

    expect(confirmSpy).toHaveBeenCalledWith("「テスト商品」を削除しますか？");
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "REMOVE_ITEM",
      payload: "test-item-1",
    });
  });

  it("削除をキャンセルできる", () => {
    const { result } = renderHook(() => useItemRow(testItem), { wrapper });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    act(() => {
      result.current.handleDelete();
    });

    expect(confirmSpy).toHaveBeenCalledWith("「テスト商品」を削除しますか？");
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
