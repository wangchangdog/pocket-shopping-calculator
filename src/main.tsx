import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./router/components/Layout";
import { HomePage } from "./router/index";
import { ShoppingProvider } from "./shared/components/context/ShoppingContext";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <ShoppingProvider>
      <BrowserRouter>
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
  </StrictMode>
);
