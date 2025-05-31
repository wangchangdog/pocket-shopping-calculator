import type React from "react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useReducer } from "react";
import type {
  ShoppingAction,
  ShoppingItem,
  ShoppingSession,
} from "../../../types";
import { calculateTotal } from "../../utils/calculations";
import {
  createDefaultSession,
  loadSession,
  loadSettings,
  saveSession,
} from "../../utils/storage";

interface ShoppingContextType {
  session: ShoppingSession;
  dispatch: React.Dispatch<ShoppingAction>;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined
);

const shoppingReducer = (
  state: ShoppingSession,
  action: ShoppingAction
): ShoppingSession => {
  const now = new Date().toISOString();

  switch (action.type) {
    case "ADD_ITEM": {
      const newItem: ShoppingItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...action.payload,
        addedAt: now,
      };

      const newItems = [...state.items, newItem];
      const totalAmount = calculateTotal(
        newItems,
        state.taxMode,
        state.taxRate
      );

      return {
        ...state,
        items: newItems,
        totalAmount,
        updatedAt: now,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const totalAmount = calculateTotal(
        newItems,
        state.taxMode,
        state.taxRate
      );

      return {
        ...state,
        items: newItems,
        totalAmount,
        updatedAt: now,
      };
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      const totalAmount = calculateTotal(
        newItems,
        state.taxMode,
        state.taxRate
      );

      return {
        ...state,
        items: newItems,
        totalAmount,
        updatedAt: now,
      };
    }

    case "SET_TAX_MODE": {
      const totalAmount = calculateTotal(
        state.items,
        action.payload,
        state.taxRate
      );

      return {
        ...state,
        taxMode: action.payload,
        totalAmount,
        updatedAt: now,
      };
    }

    case "SET_TAX_RATE": {
      const totalAmount = calculateTotal(
        state.items,
        state.taxMode,
        action.payload
      );

      return {
        ...state,
        taxRate: action.payload,
        totalAmount,
        updatedAt: now,
      };
    }

    case "CLEAR_SESSION": {
      const settings = loadSettings();
      return createDefaultSession(settings || undefined);
    }

    case "LOAD_SESSION": {
      return action.payload;
    }

    default:
      return state;
  }
};

interface ShoppingProviderProps {
  children: ReactNode;
}

export const ShoppingProvider: React.FC<ShoppingProviderProps> = ({
  children,
}) => {
  const initialSession = createDefaultSession();

  const [session, dispatch] = useReducer(shoppingReducer, initialSession);

  // 初期化時にローカルストレージからデータを読み込み
  useEffect(() => {
    const savedSession = loadSession();
    if (savedSession) {
      dispatch({ type: "LOAD_SESSION", payload: savedSession });
    }
  }, []);

  // セッションが変更されるたびにローカルストレージに保存
  useEffect(() => {
    saveSession(session);
  }, [session]);

  return (
    <ShoppingContext.Provider value={{ session, dispatch }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShoppingContext = (): ShoppingContextType => {
  const context = useContext(ShoppingContext);
  if (context === undefined) {
    throw new Error(
      "useShoppingContext must be used within a ShoppingProvider"
    );
  }
  return context;
};
