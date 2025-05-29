import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaxModeToggleFunction } from './function';
import type { UseTaxModeToggleReturn } from './useTaxModeToggle';

// モックフック作成ヘルパー
const createMockHook = (overrides: Partial<UseTaxModeToggleReturn> = {}): UseTaxModeToggleReturn => ({
  taxMode: 'included',
  taxRate: 10,
  handleTaxModeChange: vi.fn(),
  ...overrides,
});

describe('TaxModeToggleFunction', () => {
  it('税設定のタイトルと税率が表示される', () => {
    const mockHook = createMockHook({ taxRate: 10 });

    render(<TaxModeToggleFunction hook={mockHook} />);

    expect(screen.getByText('税設定')).toBeInTheDocument();
    expect(screen.getByText('消費税率: 10%')).toBeInTheDocument();
  });

  it('税込・税抜ボタンが表示される', () => {
    const mockHook = createMockHook();

    render(<TaxModeToggleFunction hook={mockHook} />);

    expect(screen.getByRole('button', { name: '税込' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '税抜' })).toBeInTheDocument();
  });

  it('税込モードの時は税込ボタンがアクティブになる', () => {
    const mockHook = createMockHook({ taxMode: 'included' });

    render(<TaxModeToggleFunction hook={mockHook} />);

    const includedButton = screen.getByRole('button', { name: '税込' });
    const excludedButton = screen.getByRole('button', { name: '税抜' });

    expect(includedButton).toHaveClass('bg-blue-500', 'text-white', 'shadow-sm');
    expect(excludedButton).toHaveClass('text-gray-600', 'hover:text-gray-800');
    expect(excludedButton).not.toHaveClass('bg-blue-500', 'text-white');
  });

  it('税抜モードの時は税抜ボタンがアクティブになる', () => {
    const mockHook = createMockHook({ taxMode: 'excluded' });

    render(<TaxModeToggleFunction hook={mockHook} />);

    const includedButton = screen.getByRole('button', { name: '税込' });
    const excludedButton = screen.getByRole('button', { name: '税抜' });

    expect(excludedButton).toHaveClass('bg-blue-500', 'text-white', 'shadow-sm');
    expect(includedButton).toHaveClass('text-gray-600', 'hover:text-gray-800');
    expect(includedButton).not.toHaveClass('bg-blue-500', 'text-white');
  });

  it('税込ボタンをクリックするとhandleTaxModeChangeが呼ばれる', () => {
    const mockHook = createMockHook({ taxMode: 'excluded' });

    render(<TaxModeToggleFunction hook={mockHook} />);

    const includedButton = screen.getByRole('button', { name: '税込' });
    fireEvent.click(includedButton);

    expect(mockHook.handleTaxModeChange).toHaveBeenCalledWith('included');
    expect(mockHook.handleTaxModeChange).toHaveBeenCalledTimes(1);
  });

  it('税抜ボタンをクリックするとhandleTaxModeChangeが呼ばれる', () => {
    const mockHook = createMockHook({ taxMode: 'included' });

    render(<TaxModeToggleFunction hook={mockHook} />);

    const excludedButton = screen.getByRole('button', { name: '税抜' });
    fireEvent.click(excludedButton);

    expect(mockHook.handleTaxModeChange).toHaveBeenCalledWith('excluded');
    expect(mockHook.handleTaxModeChange).toHaveBeenCalledTimes(1);
  });

  it('異なる税率が正しく表示される', () => {
    const mockHook = createMockHook({ taxRate: 8 });

    render(<TaxModeToggleFunction hook={mockHook} />);

    expect(screen.getByText('消費税率: 8%')).toBeInTheDocument();
    expect(screen.queryByText('消費税率: 10%')).not.toBeInTheDocument();
  });

  it('ボタンに正しいスタイルクラスが適用される', () => {
    const mockHook = createMockHook();

    render(<TaxModeToggleFunction hook={mockHook} />);

    const includedButton = screen.getByRole('button', { name: '税込' });
    const excludedButton = screen.getByRole('button', { name: '税抜' });

    // 共通のスタイルクラス
    expect(includedButton).toHaveClass('flex-1', 'py-2', 'px-4', 'rounded-md', 'text-sm', 'font-medium', 'transition-colors');
    expect(excludedButton).toHaveClass('flex-1', 'py-2', 'px-4', 'rounded-md', 'text-sm', 'font-medium', 'transition-colors');
  });

  it('コンテナに正しいレイアウトクラスが適用される', () => {
    const mockHook = createMockHook();

    render(<TaxModeToggleFunction hook={mockHook} />);

    const container = screen.getByText('税設定').closest('.bg-white');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'mb-4');

    const buttonContainer = screen.getByRole('button', { name: '税込' }).parentElement;
    expect(buttonContainer).toHaveClass('flex', 'bg-gray-100', 'rounded-lg', 'p-1');
  });
}); 