import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@mantine/core";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage.jsx";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BudgetsPage from "./pages/Budgets"; // ⬅️ dodato

export default function App() {
  return (
    <AppShell header={{ height: 56 }} withBorder={false}>
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Main>
        <Routes>
          {/* Početna */}
          <Route path="/" element={<HomePage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Zaštićeno */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/budgets" element={<BudgetsPage />} /> {/* ⬅️ dodato */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </AppShell.Main>
    </AppShell>
  );
}