import { Paper, TextInput, PasswordInput, Button, Title, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password: pass });
      login(data.access_token, data.user);
      notifications.show({ color: "green", message: "Dobrodošao!" });
      nav("/dashboard");
    } catch (e) {
      const msg = e?.response?.data?.message || "Pogrešan email ili lozinka";
      notifications.show({ color: "red", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" h="100dvh" px="md">
      <Paper withBorder p="lg" radius="md" w={360}>
        <Title order={3} mb="sm">Prijava</Title>
        <TextInput label="Email" placeholder="you@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <PasswordInput label="Lozinka" mt="sm" value={pass} onChange={(e)=>setPass(e.target.value)} required />
        <Button fullWidth mt="lg" loading={loading} onClick={onSubmit}>Uloguj se</Button>
      </Paper>
    </Stack>
  );
}
