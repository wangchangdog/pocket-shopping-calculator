import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShoppingProvider } from '../../context/ShoppingContext';
import type { ShoppingItem } from '../../types';
import { ItemList } from './index';

// テスト用商品データ
const mockItems: ShoppingItem[] = [
  {
    id: 'item-1',
    name: '商品1',
    price: 100,
    quantity: 1,
    addedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'item-2',
    name: '商品2',
    price: 200,
    quantity: 2,
    addedAt: '2024-01-01T00:00:00.000Z',
  },
];

// モック関数
const mockDispatch = vi.fn();
const mockUseShoppingContext = vi.fn();

// モック設定
vi.mock('../../context/ShoppingContext', async () => {
  const actual = await vi.importActual('../../context/ShoppingContext');
  return {
    ...actual,
    useShoppingContext: () => mockUseShoppingContext(),
  };
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe('ItemList Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => { });
    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    // デフォルトのモック設定
    mockUseShoppingContext.mockReturnValue({
      dispatch: mockDispatch,
      session: {
        items: mockItems,
        taxMode: 'included',
        taxRate: 10,
        totalAmount: 500,
        sessionId: 'test-session',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('初期状態で商品一覧が正しく表示される', () => {
    render(<ItemList />, { wrapper });

    expect(screen.getByText('商品一覧 (2件)')).toBeInTheDocument();
    expect(screen.getByText('商品1')).toBeInTheDocument();
    expect(screen.getByText('商品2')).toBeInTheDocument();
    expect(screen.getByText('すべて削除')).toBeInTheDocument();
  });

  it('商品の数量編集フローが動作する', async () => {
    render(<ItemList />, { wrapper });

    // 商品1の数量ボタンをクリック
    const quantityButton = screen.getByRole('button', { name: '1個' });
    fireEvent.click(quantityButton);

    // 編集モードになることを確認
    const input = screen.getByDisplayValue('1');
    expect(input).toBeInTheDocument();

    // 数量を変更
    fireEvent.change(input, { target: { value: '3' } });

    // 確定ボタンをクリック
    const submitButton = screen.getByText('✓');
    fireEvent.click(submitButton);

    // UPDATE_QUANTITYアクションが実行されることを確認
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'UPDATE_QUANTITY',
      payload: { id: 'item-1', quantity: 3 },
    });
  });

  it('商品の数量編集をキャンセルできる', async () => {
    render(<ItemList />, { wrapper });

    // 商品1の数量ボタンをクリック
    const quantityButton = screen.getByRole('button', { name: '1個' });
    fireEvent.click(quantityButton);

    // 数量を変更
    const input = screen.getByDisplayValue('1');
    fireEvent.change(input, { target: { value: '5' } });

    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('✕');
    fireEvent.click(cancelButton);

    // dispatchが呼ばれないことを確認
    expect(mockDispatch).not.toHaveBeenCalled();

    // 編集モードが終了することを確認
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '1個' })).toBeInTheDocument();
    });
  });

  it('無効な数量でエラーが表示される', () => {
    render(<ItemList />, { wrapper });
    const alertSpy = vi.spyOn(window, 'alert');

    // 商品1の数量ボタンをクリック
    const quantityButton = screen.getByRole('button', { name: '1個' });
    fireEvent.click(quantityButton);

    // 無効な数量を入力
    const input = screen.getByDisplayValue('1');
    fireEvent.change(input, { target: { value: '0' } });

    // 確定ボタンをクリック
    const submitButton = screen.getByText('✓');
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    expect(alertSpy).toHaveBeenCalledWith('正しい数量を入力してください');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('商品削除フローが動作する', () => {
    render(<ItemList />, { wrapper });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログが表示されることを確認
    expect(confirmSpy).toHaveBeenCalledWith('「商品1」を削除しますか？');

    // REMOVE_ITEMアクションが実行されることを確認
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_ITEM',
      payload: 'item-1',
    });
  });

  it('商品削除をキャンセルできる', () => {
    render(<ItemList />, { wrapper });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    // 削除ボタンをクリック
    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]);

    // 確認ダイアログが表示されることを確認
    expect(confirmSpy).toHaveBeenCalledWith('「商品1」を削除しますか？');

    // dispatchが呼ばれないことを確認
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('すべて削除フローが動作する', () => {
    render(<ItemList />, { wrapper });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    // すべて削除ボタンをクリック
    const clearAllButton = screen.getByRole('button', { name: 'すべて削除' });
    fireEvent.click(clearAllButton);

    // 確認ダイアログが表示されることを確認
    expect(confirmSpy).toHaveBeenCalledWith('すべての商品を削除しますか？');

    // CLEAR_SESSIONアクションが実行されることを確認
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLEAR_SESSION' });
  });

  it('すべて削除をキャンセルできる', () => {
    render(<ItemList />, { wrapper });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    // すべて削除ボタンをクリック
    const clearAllButton = screen.getByRole('button', { name: 'すべて削除' });
    fireEvent.click(clearAllButton);

    // 確認ダイアログが表示されることを確認
    expect(confirmSpy).toHaveBeenCalledWith('すべての商品を削除しますか？');

    // dispatchが呼ばれないことを確認
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

// 空の商品リストのテスト
describe('ItemList Integration - 空の商品リスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 空の商品リスト用のモック
    mockUseShoppingContext.mockReturnValue({
      dispatch: mockDispatch,
      session: {
        items: [],
        taxMode: 'included',
        taxRate: 10,
        totalAmount: 0,
        sessionId: 'test-session',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('空状態が正しく表示される', () => {
    render(<ItemList />, { wrapper });

    expect(screen.getByText('まだ商品が追加されていません')).toBeInTheDocument();
    expect(screen.getByLabelText('空のカゴ')).toBeInTheDocument();
    expect(screen.queryByText('商品一覧')).not.toBeInTheDocument();
    expect(screen.queryByText('すべて削除')).not.toBeInTheDocument();
  });
}); 