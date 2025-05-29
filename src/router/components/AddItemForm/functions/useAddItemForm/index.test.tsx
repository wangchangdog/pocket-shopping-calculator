import { ShoppingProvider } from "@/context/ShoppingContext";
import { act, renderHook } from "@testing-library/react";
import type React from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAddItemForm } from "./index";

// ShoppingContextのモック
const mockDispatch = vi.fn();

vi.mock("@/context/ShoppingContext", async () => {
  const actual = await vi.importActual("@/context/ShoppingContext");
  return {
    ...actual,
    useShoppingContext: () => ({
      dispatch: mockDispatch,
      session: {
        sessionId: "test-session",
        taxMode: "included" as const,
        taxRate: 0.1,
        items: [],
        totalAmount: 0,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
    }),
  };
});

// テスト用のWrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe("useAddItemForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // alertのモック
    vi.spyOn(window, "alert").mockImplementation(() => {
      /* no-op */
    });
  });

  it("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.formData).toEqual({
      name: "",
      price: "",
      quantity: "1",
    });
  });

  it("フォームを開くことができる", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });

    act(() => {
      result.current.handleOpenForm();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("フォームデータを更新できる", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });

    const newFormData = {
      name: "テスト商品",
      price: "100",
      quantity: "2",
    };

    act(() => {
      result.current.setFormData(newFormData);
    });

    expect(result.current.formData).toEqual(newFormData);
  });

  it("有効なデータでフォームを送信できる", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });

    // フォームを開く
    act(() => {
      result.current.setIsOpen(true);
    });

    // フォームデータを設定
    act(() => {
      result.current.setFormData({
        name: "テスト商品",
        price: "100",
        quantity: "2",
      });
    });

    // フォームを送信
    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    // dispatchが正しく呼ばれることを確認
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_ITEM",
      payload: {
        name: "テスト商品",
        price: 100,
        quantity: 2,
      },
    });

    // フォームがリセットされることを確認
    expect(result.current.isOpen).toBe(false);
    expect(result.current.formData).toEqual({
      name: "",
      price: "",
      quantity: "1",
    });
  });

  it("商品名が空の場合はデフォルト名が使用される", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });

    act(() => {
      result.current.setFormData({
        name: "",
        price: "100",
        quantity: "1",
      });
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_ITEM",
      payload: {
        name: "商品",
        price: 100,
        quantity: 1,
      },
    });
  });

  it("無効な価格の場合はエラーが表示される", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    act(() => {
      result.current.setFormData({
        name: "テスト商品",
        price: "0",
        quantity: "1",
      });
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(alertSpy).toHaveBeenCalledWith("正しい価格を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("無効な数量の場合はエラーが表示される", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    act(() => {
      result.current.setFormData({
        name: "テスト商品",
        price: "100",
        quantity: "0",
      });
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(alertSpy).toHaveBeenCalledWith("正しい数量を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("キャンセル時にフォームがリセットされる", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });

    // フォームを開いてデータを設定
    act(() => {
      result.current.setIsOpen(true);
      result.current.setFormData({
        name: "テスト商品",
        price: "100",
        quantity: "2",
      });
    });

    // キャンセル
    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.formData).toEqual({
      name: "",
      price: "",
      quantity: "1",
    });
  });

  it("NaNの価格の場合はエラーが表示される", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    act(() => {
      result.current.setFormData({
        name: "テスト商品",
        price: "invalid",
        quantity: "1",
      });
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(alertSpy).toHaveBeenCalledWith("正しい価格を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("NaNの数量の場合はエラーが表示される", () => {
    const { result } = renderHook(() => useAddItemForm(), { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    act(() => {
      result.current.setFormData({
        name: "テスト商品",
        price: "100",
        quantity: "invalid",
      });
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    expect(alertSpy).toHaveBeenCalledWith("正しい数量を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
