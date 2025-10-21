import * as React from "react";
import {
  Menu,
  Avatar,
  Text,
  Group,
  UnstyledButton,
  Divider,
  Box,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChevronDown, IconLogout2, IconUser } from "@tabler/icons-react";

function initialsFrom(nameOrEmail = "") {
  const s = String(nameOrEmail).trim();
  if (!s) return "U";
  const parts = s.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (s.includes("@")) return s[0].toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

export default function UserMenu({ user, onLogout }) {
  const displayName = user?.name || user?.fullName || user?.email || "Korisnik";

  return (
    <Menu
      width={220}
      position="bottom-end"
      shadow="md"
      offset={6}
      transitionProps={{ transition: "pop", duration: 120 }}
      withinPortal
    >
      <Menu.Target>
        <UnstyledButton
          aria-label="Korisnički meni"
          style={{
            padding: "6px 10px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
          }}
        >
          <Group gap="xs" wrap="nowrap" align="center">
            <Avatar
              src={user?.avatarUrl || null}
              alt={displayName}
              radius="xl"
              size={28}
              variant="filled"
              color="dark"
            >
              {initialsFrom(displayName)}
            </Avatar>
            <Text fw={600} fz="sm" style={{ color: "white" }}>
              {displayName}
            </Text>
            <IconChevronDown size={16} style={{ opacity: 0.8 }} />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown
        style={{
          background: "rgba(20,20,20,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box px="sm" py={8}>
          <Group gap="sm">
            <Avatar src={user?.avatarUrl || null} radius="xl" size={32} color="dark">
              {initialsFrom(displayName)}
            </Avatar>
            <Box style={{ minWidth: 0 }}>
              <Text fw={600} fz="sm" c="gray.1" style={{ lineHeight: 1.1 }}>
                {displayName}
              </Text>
              {user?.email && (
                <Text fz="xs" c="gray.5" truncate="end">
                  {user.email}
                </Text>
              )}
            </Box>
          </Group>
        </Box>

        <Divider my={6} style={{ borderColor: "rgba(255,255,255,0.08)" }} />
        {/*
        <Menu.Item
          leftSection={<IconUser size={16} />}
          component={Link}
          to="/profile"
          c="gray.1"
          style={{ borderRadius: 8 }}
        >
          Profil
        </Menu.Item>
        */}
        <Menu.Divider style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <Menu.Item
          color="red"
          leftSection={<IconLogout2 size={16} />}
          onClick={onLogout}
          style={{ borderRadius: 8 }}
        >
          Odjava
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}