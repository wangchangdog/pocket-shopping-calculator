import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddItemFormFunction } from './function';
import type { UseAddItemFormReturn } from './useAddItemForm';

// モックフック
const createMockHook = (overrides: Partial<UseAddItemFormReturn> = {}): UseAddItemFormReturn => ({
  isOpen: false,
  formData: {
    name: '',
    price: '',
    quantity: '1',
  },
  setIsOpen: vi.fn(),
  setFormData: vi.fn(),
  handleSubmit: vi.fn(),
  handleCancel: vi.fn(),
  handleOpenForm: vi.fn(),
  ...overrides,
});

describe('AddItemFormFunction', () => {
  it('フォームが閉じている時は追加ボタンが表示される', () => {
    const mockHook = createMockHook({ isOpen: false });

    render(<AddItemFormFunction hook={mockHook} />);

    expect(screen.getByText('商品を追加')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('追加ボタンをクリックするとhandleOpenFormが呼ばれる', () => {
    const mockHook = createMockHook({ isOpen: false });

    render(<AddItemFormFunction hook={mockHook} />);

    const addButton = screen.getByRole('button', { name: /商品を追加/ });
    fireEvent.click(addButton);

    expect(mockHook.handleOpenForm).toHaveBeenCalledTimes(1);
  });

  it('フォームが開いている時はフォームが表示される', () => {
    const mockHook = createMockHook({ isOpen: true });

    render(<AddItemFormFunction hook={mockHook} />);

    expect(screen.getByText('商品を追加')).toBeInTheDocument();
    expect(screen.getByLabelText('商品名（任意）')).toBeInTheDocument();
    expect(screen.getByLabelText('価格 *')).toBeInTheDocument();
    expect(screen.getByLabelText('数量')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('商品名の入力値が変更されるとsetFormDataが呼ばれる', () => {
    const mockHook = createMockHook({
      isOpen: true,
      formData: { name: '', price: '', quantity: '1' }
    });

    render(<AddItemFormFunction hook={mockHook} />);

    const nameInput = screen.getByLabelText('商品名（任意）');
    fireEvent.change(nameInput, { target: { value: 'テスト商品' } });

    expect(mockHook.setFormData).toHaveBeenCalledWith({
      name: 'テスト商品',
      price: '',
      quantity: '1',
    });
  });

  it('価格の入力値が変更されるとsetFormDataが呼ばれる', () => {
    const mockHook = createMockHook({
      isOpen: true,
      formData: { name: '', price: '', quantity: '1' }
    });

    render(<AddItemFormFunction hook={mockHook} />);

    const priceInput = screen.getByLabelText('価格 *');
    fireEvent.change(priceInput, { target: { value: '100' } });

    expect(mockHook.setFormData).toHaveBeenCalledWith({
      name: '',
      price: '100',
      quantity: '1',
    });
  });

  it('数量の入力値が変更されるとsetFormDataが呼ばれる', () => {
    const mockHook = createMockHook({
      isOpen: true,
      formData: { name: '', price: '', quantity: '1' }
    });

    render(<AddItemFormFunction hook={mockHook} />);

    const quantityInput = screen.getByLabelText('数量');
    fireEvent.change(quantityInput, { target: { value: '2' } });

    expect(mockHook.setFormData).toHaveBeenCalledWith({
      name: '',
      price: '',
      quantity: '2',
    });
  });

  it('フォームを送信するとhandleSubmitが呼ばれる', () => {
    const mockHook = createMockHook({ isOpen: true });

    render(<AddItemFormFunction hook={mockHook} />);

    const form = screen.getByRole('button', { name: '追加' }).closest('form');
    fireEvent.submit(form!);

    expect(mockHook.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('キャンセルボタンをクリックするとhandleCancelが呼ばれる', () => {
    const mockHook = createMockHook({ isOpen: true });

    render(<AddItemFormFunction hook={mockHook} />);

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(mockHook.handleCancel).toHaveBeenCalledTimes(1);
  });

  it('フォームデータの値が正しく表示される', () => {
    const mockHook = createMockHook({
      isOpen: true,
      formData: {
        name: 'テスト商品',
        price: '100',
        quantity: '2'
      }
    });

    render(<AddItemFormFunction hook={mockHook} />);

    expect(screen.getByDisplayValue('テスト商品')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('価格入力フィールドに正しい属性が設定されている', () => {
    const mockHook = createMockHook({ isOpen: true });

    render(<AddItemFormFunction hook={mockHook} />);

    const priceInput = screen.getByLabelText('価格 *');
    expect(priceInput).toHaveAttribute('type', 'number');
    expect(priceInput).toHaveAttribute('min', '0');
    expect(priceInput).toHaveAttribute('step', '1');
    expect(priceInput).toHaveAttribute('required');
    expect(priceInput).toHaveAttribute('placeholder', '0');
  });

  it('数量入力フィールドに正しい属性が設定されている', () => {
    const mockHook = createMockHook({ isOpen: true });

    render(<AddItemFormFunction hook={mockHook} />);

    const quantityInput = screen.getByLabelText('数量');
    expect(quantityInput).toHaveAttribute('type', 'number');
    expect(quantityInput).toHaveAttribute('min', '1');
    expect(quantityInput).toHaveAttribute('step', '1');
    expect(quantityInput).toHaveAttribute('required');
  });

  it('商品名入力フィールドに正しい属性が設定されている', () => {
    const mockHook = createMockHook({ isOpen: true });

    render(<AddItemFormFunction hook={mockHook} />);

    const nameInput = screen.getByLabelText('商品名（任意）');
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('placeholder', '商品名を入力');
  });
}); 