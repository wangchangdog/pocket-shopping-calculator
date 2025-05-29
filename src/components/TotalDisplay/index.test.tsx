import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShoppingProvider } from '../../context/ShoppingContext';
import type { ShoppingItem } from '../../types';
import { TotalDisplay } from './index';

// テスト用商品データ
const mockItems: ShoppingItem[] = [
  {
    id: 'item-1',
    name: '商品1',
    price: 100,
    quantity: 2,
    addedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'item-2',
    name: '商品2',
    price: 200,
    quantity: 1,
    addedAt: '2024-01-01T00:00:00.000Z',
  },
];

// モック関数
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

describe('TotalDisplay Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトのモック設定
    mockUseShoppingContext.mockReturnValue({
      session: {
        items: mockItems,
        taxMode: 'included',
        taxRate: 10,
        totalAmount: 400,
        sessionId: 'test-session',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('初期状態で正しく表示される', () => {
    render(<TotalDisplay />, { wrapper });

    expect(screen.getByText('合計金額')).toBeInTheDocument();
    // 合計金額の大きな表示を確認
    const totalAmountElement = screen.getByText('¥400').closest('.text-4xl');
    expect(totalAmountElement).toBeInTheDocument();

    expect(screen.getByText('商品点数:')).toBeInTheDocument();
    expect(screen.getByText('3点')).toBeInTheDocument(); // 2 + 1
  });

  it('税込モードで小計と税額が表示される', () => {
    render(<TotalDisplay />, { wrapper });

    expect(screen.getByText('小計（税抜）:')).toBeInTheDocument();
    expect(screen.getByText('消費税（10%）:')).toBeInTheDocument();
  });

  it('金額が正しくフォーマットされて表示される', () => {
    render(<TotalDisplay />, { wrapper });

    // 合計金額の大きな表示を確認
    const totalAmountElement = screen.getByText('¥400').closest('.text-4xl');
    expect(totalAmountElement).toBeInTheDocument();
  });

  it('商品点数が正しく計算されて表示される', () => {
    render(<TotalDisplay />, { wrapper });

    // 商品1: 2個 + 商品2: 1個 = 3個
    expect(screen.getByText('3点')).toBeInTheDocument();
  });

  it('正しいスタイルクラスが適用される', () => {
    render(<TotalDisplay />, { wrapper });

    const container = screen.getByText('合計金額').closest('.bg-white');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-6');

    const totalAmountElement = screen.getByText('¥400').closest('.text-4xl');
    expect(totalAmountElement).toHaveClass('text-4xl', 'font-bold', 'text-blue-600');
  });
});

// 税抜モードのテスト
describe('TotalDisplay Integration - 税抜モード', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 税抜モード用のモック
    mockUseShoppingContext.mockReturnValue({
      session: {
        items: mockItems,
        taxMode: 'excluded',
        taxRate: 8,
        totalAmount: 432, // 400 + 32(税額)
        sessionId: 'test-session',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('税抜モードで正しく表示される', () => {
    render(<TotalDisplay />, { wrapper });

    // 合計金額の大きな表示を確認
    const totalAmountElement = screen.getByText('¥432').closest('.text-4xl');
    expect(totalAmountElement).toBeInTheDocument();

    expect(screen.getByText('消費税（8%）:')).toBeInTheDocument();
  });
});

// 空の商品リストのテスト
describe('TotalDisplay Integration - 空の商品リスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 空の商品リスト用のモック
    mockUseShoppingContext.mockReturnValue({
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

  it('空の商品リストで正しく表示される', () => {
    render(<TotalDisplay />, { wrapper });

    // 複数の¥0表示があることを確認
    const zeroElements = screen.getAllByText('¥0');
    expect(zeroElements.length).toBeGreaterThan(0);

    // 合計金額の大きな表示を確認
    const totalAmountElement = zeroElements.find(el => el.closest('.text-4xl'));
    expect(totalAmountElement).toBeInTheDocument();

    expect(screen.getByText('0点')).toBeInTheDocument();
  });
});

// 大きな金額のテスト
describe('TotalDisplay Integration - 大きな金額', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 大きな金額用のモック
    const expensiveItems: ShoppingItem[] = [
      {
        id: 'item-1',
        name: '高額商品',
        price: 999999,
        quantity: 2,
        addedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    mockUseShoppingContext.mockReturnValue({
      session: {
        items: expensiveItems,
        taxMode: 'included',
        taxRate: 10,
        totalAmount: 1999998,
        sessionId: 'test-session',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('大きな金額が正しくフォーマットされて表示される', () => {
    render(<TotalDisplay />, { wrapper });

    // 合計金額の大きな表示を確認
    const totalAmountElement = screen.getByText('¥1,999,998').closest('.text-4xl');
    expect(totalAmountElement).toBeInTheDocument();

    expect(screen.getByText('2点')).toBeInTheDocument();
  });
}); 