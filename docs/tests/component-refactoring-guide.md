# コンポーネントリファクタリング & テスト実装ガイド

## 概要

このガイドでは、Reactコンポーネントをロジックとプレゼンテーション層に分離し、包括的なテストを実装する手順を説明します。

## 目標

- **関心の分離**: ロジックとUIの明確な分離
- **テスタビリティ**: 各層を独立してテスト可能
- **再利用性**: カスタムフックの他コンポーネントでの利用
- **保守性**: 変更時の影響範囲の明確化
- **型安全性**: TypeScriptによる厳密な型チェック

## 前提条件

### 必要な依存関係

```json
{
  "devDependencies": {
    "vitest": "^3.1.4",
    "@testing-library/react": "^16.3.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.1.0"
  }
}
```

### 設定ファイル

#### vite.config.ts
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

#### src/test/setup.ts
```typescript
import '@testing-library/jest-dom'
```

#### package.json scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## リファクタリング手順

### ステップ1: 現在のコンポーネント分析

元のコンポーネントを分析し、以下を特定します：

1. **状態管理ロジック** - useState, useEffect等
2. **ビジネスロジック** - バリデーション、計算処理等
3. **イベントハンドラー** - onClick, onSubmit等
4. **プレゼンテーション部分** - JSX、スタイリング等

### ステップ2: ディレクトリ構造の作成

```
src/components/ComponentName/
├── index.tsx              # メインコンポーネント
├── useComponentName.tsx   # カスタムフック（ロジック）
├── function.tsx           # JSXコンポーネント（プレゼンテーション）
├── index.test.tsx         # 統合テスト
├── useComponentName.test.tsx # カスタムフックテスト
└── function.test.tsx      # JSXコンポーネントテスト
```

### ステップ3: カスタムフック作成

#### useComponentName.tsx

```typescript
import { useState } from "react";
import { useContext } from "../context/SomeContext";

// 型定義
export interface FormData {
  // フォームデータの型定義
}

export interface UseComponentNameReturn {
  // 戻り値の型定義
  state: SomeState;
  handlers: {
    handleSubmit: (e: React.FormEvent) => void;
    handleCancel: () => void;
    // その他のハンドラー
  };
  // その他の戻り値
}

// 初期値定義
const initialState = {
  // 初期状態
};

export const useComponentName = (): UseComponentNameReturn => {
  // 状態管理
  const [state, setState] = useState(initialState);
  
  // コンテキストの使用
  const { dispatch } = useContext();
  
  // ヘルパー関数
  const resetState = () => {
    setState(initialState);
  };
  
  const validateData = (data: FormData): { isValid: boolean; error?: string } => {
    // バリデーションロジック
  };
  
  // イベントハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateData(state);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    // ビジネスロジック実行
    dispatch({
      type: "SOME_ACTION",
      payload: processedData,
    });
    
    resetState();
  };
  
  const handleCancel = () => {
    resetState();
  };
  
  return {
    state,
    handlers: {
      handleSubmit,
      handleCancel,
    },
    // その他の戻り値
  };
};
```

### ステップ4: JSXコンポーネント作成

#### function.tsx

```typescript
import type React from "react";
import type { UseComponentNameReturn } from "./useComponentName";

interface ComponentNameFunctionProps {
  hook: UseComponentNameReturn;
}

export const ComponentNameFunction: React.FC<ComponentNameFunctionProps> = ({
  hook,
}) => {
  const { state, handlers } = hook;
  
  // 条件分岐による表示切り替え
  if (someCondition) {
    return (
      <div>
        {/* 条件付き表示 */}
      </div>
    );
  }
  
  return (
    <div>
      <form onSubmit={handlers.handleSubmit}>
        {/* フォーム要素 */}
        <input
          type="text"
          value={state.someValue}
          onChange={(e) => handlers.handleChange(e.target.value)}
        />
        
        <button type="submit">送信</button>
        <button type="button" onClick={handlers.handleCancel}>
          キャンセル
        </button>
      </form>
    </div>
  );
};
```

### ステップ5: メインコンポーネント作成

#### index.tsx

```typescript
import type React from "react";
import { ComponentNameFunction } from "./function";
import { useComponentName } from "./useComponentName";

export const ComponentName: React.FC = () => {
  const hook = useComponentName();
  
  return <ComponentNameFunction hook={hook} />;
};
```

## テスト実装手順

### ステップ1: カスタムフックテスト

#### useComponentName.test.tsx

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { useComponentName } from './useComponentName';
import { SomeProvider } from '../../context/SomeContext';

// モック設定
const mockDispatch = vi.fn();

vi.mock('../../context/SomeContext', async () => {
  const actual = await vi.importActual('../../context/SomeContext');
  return {
    ...actual,
    useSomeContext: () => ({
      dispatch: mockDispatch,
      // その他のモックデータ
    }),
  };
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <SomeProvider>{children}</SomeProvider>
);

describe('useComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 必要に応じてグローバルモック
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useComponentName(), { wrapper });
    
    expect(result.current.state).toEqual(expectedInitialState);
  });

  it('状態を更新できる', () => {
    const { result } = renderHook(() => useComponentName(), { wrapper });
    
    act(() => {
      result.current.handlers.handleSomeAction(newValue);
    });
    
    expect(result.current.state.someProperty).toBe(newValue);
  });

  it('有効なデータで送信できる', () => {
    const { result } = renderHook(() => useComponentName(), { wrapper });
    
    // データ設定
    act(() => {
      result.current.handlers.setData(validData);
    });
    
    // 送信実行
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    act(() => {
      result.current.handlers.handleSubmit(mockEvent);
    });
    
    // 期待される動作の確認
    expect(mockDispatch).toHaveBeenCalledWith(expectedAction);
    expect(result.current.state).toEqual(expectedStateAfterSubmit);
  });

  it('無効なデータでエラーが表示される', () => {
    const { result } = renderHook(() => useComponentName(), { wrapper });
    const alertSpy = vi.spyOn(window, 'alert');
    
    // 無効なデータ設定
    act(() => {
      result.current.handlers.setData(invalidData);
    });
    
    // 送信実行
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
    act(() => {
      result.current.handlers.handleSubmit(mockEvent);
    });
    
    // エラー表示の確認
    expect(alertSpy).toHaveBeenCalledWith(expectedErrorMessage);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('キャンセル時に状態がリセットされる', () => {
    const { result } = renderHook(() => useComponentName(), { wrapper });
    
    // データ設定
    act(() => {
      result.current.handlers.setData(someData);
    });
    
    // キャンセル実行
    act(() => {
      result.current.handlers.handleCancel();
    });
    
    // 状態リセットの確認
    expect(result.current.state).toEqual(expectedInitialState);
  });
});
```

### ステップ2: JSXコンポーネントテスト

#### function.test.tsx

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComponentNameFunction } from './function';
import type { UseComponentNameReturn } from './useComponentName';

// モックフック作成ヘルパー
const createMockHook = (overrides: Partial<UseComponentNameReturn> = {}): UseComponentNameReturn => ({
  state: {
    // デフォルト状態
  },
  handlers: {
    handleSubmit: vi.fn(),
    handleCancel: vi.fn(),
    // その他のハンドラー
  },
  ...overrides,
});

describe('ComponentNameFunction', () => {
  it('初期状態で正しく表示される', () => {
    const mockHook = createMockHook();
    
    render(<ComponentNameFunction hook={mockHook} />);
    
    expect(screen.getByText('期待されるテキスト')).toBeInTheDocument();
  });

  it('ユーザーインタラクションでハンドラーが呼ばれる', () => {
    const mockHook = createMockHook();
    
    render(<ComponentNameFunction hook={mockHook} />);
    
    const button = screen.getByRole('button', { name: 'ボタン名' });
    fireEvent.click(button);
    
    expect(mockHook.handlers.handleSomeAction).toHaveBeenCalledTimes(1);
  });

  it('フォーム送信でhandleSubmitが呼ばれる', () => {
    const mockHook = createMockHook();
    
    render(<ComponentNameFunction hook={mockHook} />);
    
    const form = screen.getByRole('button', { name: '送信' }).closest('form');
    fireEvent.submit(form!);
    
    expect(mockHook.handlers.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('入力値が正しく表示される', () => {
    const mockHook = createMockHook({
      state: { someValue: 'テスト値' }
    });
    
    render(<ComponentNameFunction hook={mockHook} />);
    
    expect(screen.getByDisplayValue('テスト値')).toBeInTheDocument();
  });

  it('条件付き表示が正しく動作する', () => {
    const mockHook = createMockHook({
      state: { showCondition: true }
    });
    
    render(<ComponentNameFunction hook={mockHook} />);
    
    expect(screen.getByText('条件付きテキスト')).toBeInTheDocument();
  });

  it('フォーム要素に正しい属性が設定されている', () => {
    const mockHook = createMockHook();
    
    render(<ComponentNameFunction hook={mockHook} />);
    
    const input = screen.getByLabelText('ラベル名');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('required');
  });
});
```

### ステップ3: 統合テスト

#### index.test.tsx

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { ComponentName } from './index';
import { SomeProvider } from '../../context/SomeContext';

// コンテキストのモック
const mockDispatch = vi.fn();

vi.mock('../../context/SomeContext', async () => {
  const actual = await vi.importActual('../../context/SomeContext');
  return {
    ...actual,
    useSomeContext: () => ({
      dispatch: mockDispatch,
      // その他のモックデータ
    }),
  };
});

// テスト用Wrapper
const wrapper = ({ children }: { children: ReactNode }) => (
  <SomeProvider>{children}</SomeProvider>
);

describe('ComponentName Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('初期状態で正しく表示される', () => {
    render(<ComponentName />, { wrapper });
    
    expect(screen.getByText('期待されるテキスト')).toBeInTheDocument();
  });

  it('完全なユーザーフローが動作する', async () => {
    render(<ComponentName />, { wrapper });
    
    // ユーザーアクション実行
    const input = screen.getByLabelText('入力フィールド');
    fireEvent.change(input, { target: { value: 'テスト値' } });
    
    const submitButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitButton);
    
    // 期待される結果の確認
    expect(mockDispatch).toHaveBeenCalledWith(expectedAction);
    
    // 状態変更の確認
    await waitFor(() => {
      expect(screen.getByText('成功メッセージ')).toBeInTheDocument();
    });
  });

  it('エラーハンドリングが正しく動作する', () => {
    render(<ComponentName />, { wrapper });
    const alertSpy = vi.spyOn(window, 'alert');
    
    // エラーを発生させるアクション
    const input = screen.getByLabelText('入力フィールド');
    fireEvent.change(input, { target: { value: '無効な値' } });
    
    const submitButton = screen.getByRole('button', { name: '送信' });
    fireEvent.click(submitButton);
    
    // エラー処理の確認
    expect(alertSpy).toHaveBeenCalledWith('エラーメッセージ');
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('キャンセル機能が正しく動作する', async () => {
    render(<ComponentName />, { wrapper });
    
    // データ入力
    const input = screen.getByLabelText('入力フィールド');
    fireEvent.change(input, { target: { value: 'テスト値' } });
    
    // キャンセル実行
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);
    
    // 状態リセットの確認
    await waitFor(() => {
      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
    
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
```

## テスト実行とデバッグ

### テスト実行コマンド

```bash
# 全テスト実行（ウォッチモード）
npm test

# 全テスト実行（一回のみ）
npm run test:run

# 特定ファイルのテスト実行
npm test -- ComponentName

# カバレッジ付きテスト実行
npm test -- --coverage
```

### よくある問題と解決方法

#### 1. JSXの構文エラー
**問題**: `.ts`ファイルでJSXを使用している
**解決**: ファイル拡張子を`.tsx`に変更

#### 2. モックが効かない
**問題**: モックの設定が正しくない
**解決**: 
- `vi.mock()`の位置を確認
- `async/await`を使用してモジュールを正しくインポート

#### 3. HTMLの制約によるテスト失敗
**問題**: `min`属性などによりブラウザが値を自動修正
**解決**: 
- カスタムフックレベルでロジックをテスト
- 統合テストでは現実的なシナリオのみテスト

#### 4. 非同期処理のテスト
**問題**: 状態変更が非同期で発生
**解決**: `waitFor()`を使用して状態変更を待機

## ベストプラクティス

### 1. テスト設計
- **単体テスト**: 各関数・フックの個別動作
- **統合テスト**: コンポーネント全体の動作
- **E2Eテスト**: 実際のユーザーフロー

### 2. モック戦略
- **外部依存**: API、コンテキスト等は必ずモック
- **内部ロジック**: 可能な限り実際のコードを使用
- **副作用**: `alert`、`console.log`等はモック

### 3. テストデータ
- **現実的なデータ**: 実際の使用ケースに近いデータを使用
- **エッジケース**: 境界値、異常値もテスト
- **型安全性**: TypeScriptの型定義を活用

### 4. 保守性
- **DRY原則**: ヘルパー関数でテストコードの重複を避ける
- **明確な命名**: テストケース名は動作を明確に表現
- **適切な粒度**: 一つのテストで一つの動作のみ検証

## まとめ

このガイドに従うことで、以下の利点を得られます：

1. **高品質なコード**: 関心の分離により保守性向上
2. **包括的なテスト**: 各層を独立してテスト可能
3. **開発効率**: 問題の早期発見と修正
4. **チーム開発**: 一貫した開発手法の共有
5. **リファクタリング安全性**: テストによる回帰防止

継続的にこの手法を適用することで、プロジェクト全体の品質向上を図ることができます。 