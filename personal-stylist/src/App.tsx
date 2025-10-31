import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StylistPage from "./PersonalStylistUI/StylistPage";
import SavedList from "./PersonalStylistUI/SavedList";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StylistPage />} />
        <Route path="/saved" element={<SavedList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
