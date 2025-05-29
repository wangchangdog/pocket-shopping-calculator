import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TotalDisplayFunction } from './function';
import type { UseTotalDisplayReturn } from './useTotalDisplay';

// モックフック作成ヘルパー
const createMockHook = (overrides: Partial<UseTotalDisplayReturn> = {}): UseTotalDisplayReturn => ({
  totalAmount: 1000,
  subtotal: 909,
  taxAmount: 91,
  itemCount: 3,
  taxMode: 'included',
  taxRate: 10,
  ...overrides,
});

describe('TotalDisplayFunction', () => {
  it('合計金額が正しく表示される', () => {
    const mockHook = createMockHook({ totalAmount: 1000 });

    render(<TotalDisplayFunction hook={mockHook} />);

    expect(screen.getByText('合計金額')).toBeInTheDocument();
    // 合計金額の大きな表示を確認
    const totalAmountElement = screen.getByText('¥1,000').closest('.text-4xl');
    expect(totalAmountElement).toBeInTheDocument();
  });

  it('商品点数が正しく表示される', () => {
    const mockHook = createMockHook({ itemCount: 5 });

    render(<TotalDisplayFunction hook={mockHook} />);

    expect(screen.getByText('商品点数:')).toBeInTheDocument();
    expect(screen.getByText('5点')).toBeInTheDocument();
  });

  it('税込モードで小計と税額が表示される', () => {
    const mockHook = createMockHook({
      taxMode: 'included',
      subtotal: 909,
      taxAmount: 91,
      taxRate: 10,
    });

    render(<TotalDisplayFunction hook={mockHook} />);

    expect(screen.getByText('小計（税抜）:')).toBeInTheDocument();
    expect(screen.getByText('¥909')).toBeInTheDocument();
    expect(screen.getByText('消費税（10%）:')).toBeInTheDocument();
    expect(screen.getByText('¥91')).toBeInTheDocument();
  });

  it('税抜モードで小計と税額が表示される', () => {
    const mockHook = createMockHook({
      taxMode: 'excluded',
      subtotal: 1000,
      taxAmount: 80,
      taxRate: 8,
      totalAmount: 1080,
    });

    render(<TotalDisplayFunction hook={mockHook} />);

    expect(screen.getByText('小計（税抜）:')).toBeInTheDocument();
    // 小計の表示を確認
    const subtotalElement = screen.getByText('小計（税抜）:').closest('.flex')?.querySelector('span:last-child');
    expect(subtotalElement).toHaveTextContent('¥1,000');

    expect(screen.getByText('消費税（8%）:')).toBeInTheDocument();
    expect(screen.getByText('¥80')).toBeInTheDocument();
  });

  it('異なる税率が正しく表示される', () => {
    const mockHook = createMockHook({ taxRate: 5 });

    render(<TotalDisplayFunction hook={mockHook} />);

    expect(screen.getByText('消費税（5%）:')).toBeInTheDocument();
  });

  it('大きな金額が正しくフォーマットされる', () => {
    const mockHook = createMockHook({
      totalAmount: 1234567,
      subtotal: 1122334,
      taxAmount: 112233,
    });

    render(<TotalDisplayFunction hook={mockHook} />);

    // 合計金額の大きな表示を確認
    const totalAmountElement = screen.getByText('¥1,234,567').closest('.text-4xl');
    expect(totalAmountElement).toBeInTheDocument();

    expect(screen.getByText('¥1,122,334')).toBeInTheDocument();
    expect(screen.getByText('¥112,233')).toBeInTheDocument();
  });

  it('0円の場合も正しく表示される', () => {
    const mockHook = createMockHook({
      totalAmount: 0,
      subtotal: 0,
      taxAmount: 0,
      itemCount: 0,
    });

    render(<TotalDisplayFunction hook={mockHook} />);

    // 複数の¥0表示があることを確認
    const zeroElements = screen.getAllByText('¥0');
    expect(zeroElements.length).toBeGreaterThan(0);

    // 合計金額の大きな表示を確認
    const totalAmountElement = zeroElements.find(el => el.closest('.text-4xl'));
    expect(totalAmountElement).toBeInTheDocument();

    expect(screen.getByText('0点')).toBeInTheDocument();
  });

  it('正しいレイアウトクラスが適用される', () => {
    const mockHook = createMockHook();

    render(<TotalDisplayFunction hook={mockHook} />);

    // 最外側のコンテナを取得
    const container = screen.getByText('合計金額').closest('.bg-white');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'p-6', 'mb-6');

    const totalAmountElement = screen.getByText('¥1,000').closest('.text-4xl');
    expect(totalAmountElement).toHaveClass('text-4xl', 'font-bold', 'text-blue-600', 'mb-4');
  });

  it('詳細情報が正しいレイアウトで表示される', () => {
    const mockHook = createMockHook();

    render(<TotalDisplayFunction hook={mockHook} />);

    // 詳細情報のコンテナを取得
    const detailsContainer = screen.getByText('商品点数:').closest('.space-y-2');
    expect(detailsContainer).toHaveClass('space-y-2', 'text-sm', 'text-gray-600');

    const itemCountRow = screen.getByText('商品点数:').closest('.flex');
    expect(itemCountRow).toHaveClass('flex', 'justify-between');
  });
}); 