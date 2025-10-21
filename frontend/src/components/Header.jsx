import { Group, Button, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChartPie, IconLogin, IconUserPlus } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";
import UserMenu from "../components/UserMenu";

export default function Header() {
  const { isAuthed, logout, user } = useAuth();

  return (
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        backdropFilter: "blur(12px)",
        background: "rgba(20,20,20,0.55)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      
      <Group gap="sm">
        <Group gap="xs" align="center">
          <IconChartPie size={20} />
          <Text
            fw={600}
            fz="lg"
            component={Link}
            to="/"
            style={{ textDecoration: "none" }}
          >
            Moj Budžet
          </Text>
        </Group>

        {isAuthed && (
          <>
            <Button
              component={Link}
              to="/dashboard"
              variant="subtle"
              size="compact-sm"
            >
              Pregled stanja
            </Button>
            <Button
              component={Link}
              to="/budgets"
              variant="subtle"
              size="compact-sm"
            >
              Budžeti
            </Button>
          </>
        )}
      </Group>

      
      <Group>
        {!isAuthed ? (
          <>
            <Button
              component={Link}
              to="/login"
              variant="subtle"
              leftSection={<IconLogin size={16} />}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="subtle"
              leftSection={<IconUserPlus size={16} />}
            >
              Registracija
            </Button>
          </>
        ) : (
          <UserMenu user={user} onLogout={logout} />
        )}
      </Group>
    </div>
  );
}
