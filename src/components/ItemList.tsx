import React, { useState } from 'react';
import { useShoppingContext } from '../context/ShoppingContext';
import type { ShoppingItem } from '../types';
import { formatPrice } from '../utils/calculations';

interface ItemRowProps {
  item: ShoppingItem;
}

const ItemRow: React.FC<ItemRowProps> = ({ item }) => {
  const { dispatch } = useShoppingContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());

  const handleDelete = () => {
    if (window.confirm(`「${item.name}」を削除しますか？`)) {
      dispatch({ type: 'REMOVE_ITEM', payload: item.id });
    }
  };

  const handleQuantityEdit = () => {
    setIsEditing(true);
    setEditQuantity(item.quantity.toString());
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(editQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      alert('正しい数量を入力してください');
      return;
    }

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: item.id, quantity: newQuantity },
    });
    setIsEditing(false);
  };

  const handleQuantityCancel = () => {
    setEditQuantity(item.quantity.toString());
    setIsEditing(false);
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </h4>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <span>¥{formatPrice(item.price)}</span>
            <span>×</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  min="1"
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleQuantitySubmit}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  ✓
                </button>
                <button
                  onClick={handleQuantityCancel}
                  className="text-gray-600 hover:text-gray-800 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuantityEdit}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {item.quantity}個
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              ¥{formatPrice(totalPrice)}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-1"
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ItemList: React.FC = () => {
  const { session, dispatch } = useShoppingContext();
  const { items } = session;

  const handleClearAll = () => {
    if (items.length === 0) return;

    if (window.confirm('すべての商品を削除しますか？')) {
      dispatch({ type: 'CLEAR_SESSION' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">まだ商品が追加されていません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          商品一覧 ({items.length}件)
        </h3>
        <button
          onClick={handleClearAll}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          すべて削除
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}; 