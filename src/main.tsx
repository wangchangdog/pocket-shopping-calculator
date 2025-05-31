import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./router/components/Layout";
import { HomePage } from "./router/index";
import { ShoppingProvider } from "./shared/components/context/ShoppingContext";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// GitHub Pagesのbase URLを設定
const basename = import.meta.env.PROD ? '/pocket-shopping-calculator' : '';

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <ShoppingProvider>
        <BrowserRouter basename={basename}>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              {/* 将来的に追加するルートをここに定義 */}
              {/* 例: <Route path="/settings" element={<SettingsPage />} /> */}
              {/* 例: <Route path="/history" element={<HistoryPage />} /> */}
            </Routes>
          </Layout>
        </BrowserRouter>
      </ShoppingProvider>
    </ErrorBoundary>
  </StrictMode>
);
