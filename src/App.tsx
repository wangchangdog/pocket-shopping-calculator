import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./router/components/Layout";
import { HomePage } from "./router/index";

export function AppRouter() {
  return (
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
  );
}

export default AppRouter;
