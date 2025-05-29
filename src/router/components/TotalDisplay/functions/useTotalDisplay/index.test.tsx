import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ShoppingItem } from '../../../../../types';
import { ShoppingProvider } from '../../../../context/ShoppingContext';
import { useTotalDisplay } from './index';

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
vi.mock('../../../../context/ShoppingContext', async () => {
  const actual = await vi.importActual('../../../../context/ShoppingContext');
  return {
    ...actual,
    useShoppingContext: () => mockUseShoppingContext(),
  };
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <ShoppingProvider>{children}</ShoppingProvider>
);

describe('useTotalDisplay', () => {
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

  it('初期状態で正しい値が返される', () => {
    const { result } = renderHook(() => useTotalDisplay(), { wrapper });

    expect(result.current.totalAmount).toBe(400);
    expect(result.current.itemCount).toBe(3); // 2 + 1
    expect(result.current.taxMode).toBe('included');
    expect(result.current.taxRate).toBe(10);
  });

  it('小計と税額が正しく計算される', () => {
    const { result } = renderHook(() => useTotalDisplay(), { wrapper });

    // 税込モードの場合の小計（税抜）と税額
    expect(result.current.subtotal).toBeGreaterThan(0);
    expect(result.current.taxAmount).toBeGreaterThan(0);
  });

  it('商品点数が正しく計算される', () => {
    const { result } = renderHook(() => useTotalDisplay(), { wrapper });

    // 商品1: 2個 + 商品2: 1個 = 3個
    expect(result.current.itemCount).toBe(3);
  });

  it('税モードと税率が正しく取得される', () => {
    const { result } = renderHook(() => useTotalDisplay(), { wrapper });

    expect(result.current.taxMode).toBe('included');
    expect(result.current.taxRate).toBe(10);
  });
});

// 税抜モードのテスト
describe('useTotalDisplay - 税抜モード', () => {
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

  it('税抜モードで正しい値が返される', () => {
    const { result } = renderHook(() => useTotalDisplay(), { wrapper });

    expect(result.current.taxMode).toBe('excluded');
    expect(result.current.taxRate).toBe(8);
    expect(result.current.totalAmount).toBe(432);
  });
});

// 空の商品リストのテスト
describe('useTotalDisplay - 空の商品リスト', () => {
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

  it('空の商品リストで正しい値が返される', () => {
    const { result } = renderHook(() => useTotalDisplay(), { wrapper });

    expect(result.current.totalAmount).toBe(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.taxAmount).toBe(0);
  });
}); 