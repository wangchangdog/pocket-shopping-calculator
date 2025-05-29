import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ShoppingProvider } from '../../context/ShoppingContext';
import type { ShoppingItem } from '../../types';
import { ItemListFunction } from './function';
import type { UseItemListReturn } from './useItemList';

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

// テスト用商品データ
const testItems: ShoppingItem[] = [
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

// モックフック作成ヘルパー
const createMockHook = (overrides: Partial<UseItemListReturn> = {}): UseItemListReturn => ({
  items: testItems,
  handleClearAll: vi.fn(),
  ...overrides,
});

describe('ItemListFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockUseShoppingContext.mockReturnValue({
      dispatch: mockDispatch,
      session: {
        items: testItems,
        taxMode: 'included',
        taxRate: 10,
        totalAmount: 500,
        sessionId: 'test-session',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('商品がある場合は商品一覧が表示される', () => {
    const mockHook = createMockHook();

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    expect(screen.getByText('商品一覧 (2件)')).toBeInTheDocument();
    expect(screen.getByText('商品1')).toBeInTheDocument();
    expect(screen.getByText('商品2')).toBeInTheDocument();
  });

  it('すべて削除ボタンが表示される', () => {
    const mockHook = createMockHook();

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    const clearButton = screen.getByRole('button', { name: 'すべて削除' });
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveClass('text-red-600', 'hover:text-red-800', 'underline');
  });

  it('すべて削除ボタンをクリックするとhandleClearAllが呼ばれる', () => {
    const mockHook = createMockHook();

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    const clearButton = screen.getByRole('button', { name: 'すべて削除' });
    fireEvent.click(clearButton);

    expect(mockHook.handleClearAll).toHaveBeenCalledTimes(1);
  });

  it('商品が空の場合は空状態メッセージが表示される', () => {
    const mockHook = createMockHook({ items: [] });

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    expect(screen.getByText('まだ商品が追加されていません')).toBeInTheDocument();
    expect(screen.queryByText('商品一覧')).not.toBeInTheDocument();
    expect(screen.queryByText('すべて削除')).not.toBeInTheDocument();
  });

  it('空状態で正しいアイコンが表示される', () => {
    const mockHook = createMockHook({ items: [] });

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    const svg = screen.getByLabelText('空のカゴ');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-12', 'h-12', 'mx-auto');
  });

  it('商品数が正しく表示される', () => {
    const mockHook = createMockHook({ items: testItems });

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    expect(screen.getByText('商品一覧 (2件)')).toBeInTheDocument();
  });

  it('商品が1件の場合も正しく表示される', () => {
    const singleItem = [testItems[0]];
    const mockHook = createMockHook({ items: singleItem });

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    expect(screen.getByText('商品一覧 (1件)')).toBeInTheDocument();
    expect(screen.getByText('商品1')).toBeInTheDocument();
    expect(screen.queryByText('商品2')).not.toBeInTheDocument();
  });

  it('商品リストが正しいレイアウトクラスを持つ', () => {
    const mockHook = createMockHook();

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    const container = screen.getByText('商品一覧 (2件)').closest('.space-y-4');
    expect(container).toHaveClass('space-y-4');

    const itemsContainer = screen.getByText('商品1').closest('.space-y-3');
    expect(itemsContainer).toHaveClass('space-y-3');
  });

  it('空状態が正しいレイアウトクラスを持つ', () => {
    const mockHook = createMockHook({ items: [] });

    render(<ItemListFunction hook={mockHook} />, { wrapper });

    const emptyContainer = screen.getByText('まだ商品が追加されていません').closest('.bg-gray-50');
    expect(emptyContainer).toHaveClass('bg-gray-50', 'rounded-lg', 'p-8', 'text-center');
  });
}); 