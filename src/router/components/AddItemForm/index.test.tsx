import { ShoppingProvider } from "@/shared/components/context/ShoppingContext";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddItemForm } from "./index";

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

describe("AddItemForm Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // alertのモック
    vi.spyOn(window, "alert").mockImplementation(() => {
      /* no-op */
    });
  });

  it("初期状態では追加ボタンが表示される", () => {
    render(<AddItemForm />, { wrapper });

    expect(screen.getByText("商品を追加")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("追加ボタンをクリックするとフォームが開く", () => {
    render(<AddItemForm />, { wrapper });

    const addButton = screen.getByRole("button", { name: /商品を追加/ });
    fireEvent.click(addButton);

    expect(screen.getByLabelText("商品名（任意）")).toBeInTheDocument();
    expect(screen.getByLabelText("価格 *")).toBeInTheDocument();
    expect(screen.getByLabelText("数量")).toBeInTheDocument();
  });

  it("完全なフォーム送信フローが動作する", async () => {
    render(<AddItemForm />, { wrapper });

    // フォームを開く
    const addButton = screen.getByRole("button", { name: /商品を追加/ });
    fireEvent.click(addButton);

    // フォームに入力
    const nameInput = screen.getByLabelText("商品名（任意）");
    const priceInput = screen.getByLabelText("価格 *");
    const quantityInput = screen.getByLabelText("数量");

    fireEvent.change(nameInput, { target: { value: "テスト商品" } });
    fireEvent.change(priceInput, { target: { value: "100" } });
    fireEvent.change(quantityInput, { target: { value: "2" } });

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "追加" });
    fireEvent.click(submitButton);

    // dispatchが正しく呼ばれることを確認
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_ITEM",
      payload: {
        name: "テスト商品",
        price: 100,
        quantity: 2,
      },
    });

    // フォームが閉じることを確認
    await waitFor(() => {
      expect(screen.getByText("商品を追加")).toBeInTheDocument();
      expect(screen.queryByLabelText("商品名（任意）")).not.toBeInTheDocument();
    });
  });

  it("キャンセルボタンでフォームが閉じる", async () => {
    render(<AddItemForm />, { wrapper });

    // フォームを開く
    const addButton = screen.getByRole("button", { name: /商品を追加/ });
    fireEvent.click(addButton);

    // フォームに入力
    const nameInput = screen.getByLabelText("商品名（任意）");
    fireEvent.change(nameInput, { target: { value: "テスト商品" } });

    // キャンセル
    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    fireEvent.click(cancelButton);

    // フォームが閉じることを確認
    await waitFor(() => {
      expect(screen.getByText("商品を追加")).toBeInTheDocument();
      expect(screen.queryByLabelText("商品名（任意）")).not.toBeInTheDocument();
    });

    // dispatchが呼ばれないことを確認
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("無効な価格でエラーが表示される", () => {
    render(<AddItemForm />, { wrapper });
    const alertSpy = vi.spyOn(window, "alert");

    // フォームを開く
    const addButton = screen.getByRole("button", { name: /商品を追加/ });
    fireEvent.click(addButton);

    // 無効な価格を入力
    const priceInput = screen.getByLabelText("価格 *");
    fireEvent.change(priceInput, { target: { value: "0" } });

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "追加" });
    fireEvent.click(submitButton);

    expect(alertSpy).toHaveBeenCalledWith("正しい価格を入力してください");
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("商品名が空の場合はデフォルト名が使用される", () => {
    render(<AddItemForm />, { wrapper });

    // フォームを開く
    const addButton = screen.getByRole("button", { name: /商品を追加/ });
    fireEvent.click(addButton);

    // 商品名を空のまま、価格のみ入力
    const priceInput = screen.getByLabelText("価格 *");
    fireEvent.change(priceInput, { target: { value: "100" } });

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "追加" });
    fireEvent.click(submitButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "ADD_ITEM",
      payload: {
        name: "商品",
        price: 100,
        quantity: 1,
      },
    });
  });

  it("フォーム送信後にフィールドがリセットされる", async () => {
    render(<AddItemForm />, { wrapper });

    // フォームを開く
    const addButton = screen.getByRole("button", { name: /商品を追加/ });
    fireEvent.click(addButton);

    // フォームに入力
    const nameInput = screen.getByLabelText("商品名（任意）");
    const priceInput = screen.getByLabelText("価格 *");
    const quantityInput = screen.getByLabelText("数量");

    fireEvent.change(nameInput, { target: { value: "テスト商品" } });
    fireEvent.change(priceInput, { target: { value: "100" } });
    fireEvent.change(quantityInput, { target: { value: "3" } });

    // フォームを送信
    const submitButton = screen.getByRole("button", { name: "追加" });
    fireEvent.click(submitButton);

    // フォームを再度開く
    await waitFor(() => {
      const newAddButton = screen.getByRole("button", { name: /商品を追加/ });
      fireEvent.click(newAddButton);
    });

    // フィールドがリセットされていることを確認
    const newNameInput = screen.getByLabelText("商品名（任意）");
    const newPriceInput = screen.getByLabelText("価格 *");
    const newQuantityInput = screen.getByLabelText("数量");

    expect(newNameInput).toHaveValue("");
    expect(newPriceInput).toHaveValue(null);
    expect(newQuantityInput).toHaveValue(1);
  });
});
