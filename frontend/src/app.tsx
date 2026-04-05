import { Routes, Route, Navigate } from 'react-router-dom';

// Routes will be expanded in Phase 9.
// For now this provides a minimal shell for the app to boot.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<div>Coming soon</div>} />
    </Routes>
  );
}
