import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ShoppingItem } from "../../../../../types";
import { ItemRow } from "./index";

// テスト用商品データ
const testItem: ShoppingItem = {
  id: "test-item-1",
  name: "テスト商品",
  price: 100,
  quantity: 2,
  addedAt: "2024-01-01T00:00:00.000Z",
};

// useItemRowのモック
const mockUseItemRow = vi.fn();

vi.mock("./functions/useItemRow", () => ({
  useItemRow: () => mockUseItemRow(),
}));

// モックフック作成ヘルパー
const createMockHook = (overrides = {}) => ({
  isEditing: false,
  editQuantity: "2",
  setEditQuantity: vi.fn(),
  handleDelete: vi.fn(),
  handleQuantityEdit: vi.fn(),
  handleQuantitySubmit: vi.fn(),
  handleQuantityCancel: vi.fn(),
  ...overrides,
});

describe("ItemRow", () => {
  it("商品情報が正しく表示される", () => {
    mockUseItemRow.mockReturnValue(createMockHook());

    render(<ItemRow item={testItem} />);

    expect(screen.getByText("テスト商品")).toBeInTheDocument();
    expect(screen.getByText("¥100")).toBeInTheDocument();
    expect(screen.getByText("2個")).toBeInTheDocument();
    expect(screen.getByText("¥200")).toBeInTheDocument(); // 合計金額
  });

  it("編集モードでない時は数量ボタンが表示される", () => {
    mockUseItemRow.mockReturnValue(createMockHook({ isEditing: false }));

    render(<ItemRow item={testItem} />);

    const quantityButton = screen.getByRole("button", { name: "2個" });
    expect(quantityButton).toBeInTheDocument();
    expect(quantityButton).toHaveClass(
      "text-blue-600",
      "hover:text-blue-800",
      "underline"
    );
  });

  it("数量ボタンをクリックするとhandleQuantityEditが呼ばれる", () => {
    const mockHook = createMockHook({ isEditing: false });
    mockUseItemRow.mockReturnValue(mockHook);

    render(<ItemRow item={testItem} />);

    const quantityButton = screen.getByRole("button", { name: "2個" });
    fireEvent.click(quantityButton);

    expect(mockHook.handleQuantityEdit).toHaveBeenCalledTimes(1);
  });

  it("編集モードの時は入力フィールドと確定・キャンセルボタンが表示される", () => {
    mockUseItemRow.mockReturnValue(
      createMockHook({
        isEditing: true,
        editQuantity: "3",
      })
    );

    render(<ItemRow item={testItem} />);

    const input = screen.getByDisplayValue("3");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1");

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("編集モードで入力値を変更するとsetEditQuantityが呼ばれる", () => {
    const mockHook = createMockHook({
      isEditing: true,
      editQuantity: "2",
    });
    mockUseItemRow.mockReturnValue(mockHook);

    render(<ItemRow item={testItem} />);

    const input = screen.getByDisplayValue("2");
    fireEvent.change(input, { target: { value: "5" } });

    expect(mockHook.setEditQuantity).toHaveBeenCalledWith("5");
  });

  it("確定ボタンをクリックするとhandleQuantitySubmitが呼ばれる", () => {
    const mockHook = createMockHook({ isEditing: true });
    mockUseItemRow.mockReturnValue(mockHook);

    render(<ItemRow item={testItem} />);

    const submitButton = screen.getByText("✓");
    fireEvent.click(submitButton);

    expect(mockHook.handleQuantitySubmit).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンをクリックするとhandleQuantityCancelが呼ばれる", () => {
    const mockHook = createMockHook({ isEditing: true });
    mockUseItemRow.mockReturnValue(mockHook);

    render(<ItemRow item={testItem} />);

    const cancelButton = screen.getByText("✕");
    fireEvent.click(cancelButton);

    expect(mockHook.handleQuantityCancel).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンをクリックするとhandleDeleteが呼ばれる", () => {
    const mockHook = createMockHook();
    mockUseItemRow.mockReturnValue(mockHook);

    render(<ItemRow item={testItem} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    fireEvent.click(deleteButton);

    expect(mockHook.handleDelete).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンに正しいアクセシビリティ属性が設定されている", () => {
    mockUseItemRow.mockReturnValue(createMockHook());

    render(<ItemRow item={testItem} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    expect(deleteButton).toHaveAttribute("title", "削除");

    const svg = deleteButton.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "削除");
  });

  it("長い商品名が正しく切り詰められる", () => {
    const longNameItem: ShoppingItem = {
      ...testItem,
      name: "とても長い商品名でテストするためのアイテムです",
    };
    mockUseItemRow.mockReturnValue(createMockHook());

    render(<ItemRow item={longNameItem} />);

    const nameElement = screen.getByText(
      "とても長い商品名でテストするためのアイテムです"
    );
    expect(nameElement).toHaveClass("truncate");
  });

  it("価格が正しくフォーマットされて表示される", () => {
    const expensiveItem: ShoppingItem = {
      ...testItem,
      price: 1234567,
      quantity: 1,
    };
    mockUseItemRow.mockReturnValue(createMockHook());

    render(<ItemRow item={expensiveItem} />);

    // 単価と合計金額の両方が表示されることを確認
    const priceElements = screen.getAllByText("¥1,234,567");
    expect(priceElements).toHaveLength(2); // 単価と合計金額

    // 合計金額の表示を確認（より具体的なセレクター）
    const totalPriceElement = priceElements.find((el) =>
      el.closest(".text-right")
    );
    expect(totalPriceElement).toBeInTheDocument();
  });
});
