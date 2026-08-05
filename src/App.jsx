import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import OrderPage from "./pages/OrderPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import KitchenPage from "./pages/KitchenPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/order" element={<OrderPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="*" element={<Navigate to="/order" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
