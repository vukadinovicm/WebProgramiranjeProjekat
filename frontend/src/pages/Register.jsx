import { useState } from "react";
import {
  Paper, TextInput, PasswordInput, Button, Title, Stack, Checkbox, Text
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", pass: "", confirm: "", agree: "" });

  const validatePassword = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumberOrSymbol = /[\d\W]/.test(password);
    return hasUpper && hasLower && hasNumberOrSymbol && password.length >= 8;
  };

  const validate = () => {
    const next = { name: "", email: "", pass: "", confirm: "", agree: "" };

    if (!name.trim()) next.name = "Ime i prezime su obavezni";
    if (!email) next.email = "Email je obavezan";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Neispravan email";

    if (!pass) next.pass = "Lozinka je obavezna";
    else if (!validatePassword(pass))
      next.pass = "Lozinka mora imati najmanje 8 karaktera, veliko i malo slovo i broj/simbol";

    if (!confirm) next.confirm = "Potvrdite lozinku";
    else if (confirm !== pass) next.confirm = "Lozinke se ne poklapaju";

    if (!agree) next.agree = "Morate prihvatiti uslove";

    setErrors(next);
    return Object.values(next).every((v) => v === "");
  };

  const onSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", { email, password: pass, name });
      login(data.access_token, data.user);
      notifications.show({ color: "green", message: "Uspešna registracija" });
      nav("/dashboard");
    } catch (e) {
      const msg = e?.response?.data?.message || "Greška pri registraciji";
      notifications.show({ color: "red", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" h="100dvh" px="md">
      <Paper withBorder p="lg" radius="md" w={380}>
        <Title order={3} mb="sm">Registracija</Title>

        <TextInput
          label="Ime i prezime *"
          placeholder="Petar Petrović"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoComplete="name"
        />

        <TextInput
          label="Email *"
          placeholder="you@example.com"
          mt="sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />

        <PasswordInput
          label="Lozinka *"
          mt="sm"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          error={errors.pass}
          autoComplete="new-password"
          description={<Text size="xs" c="dimmed">Najmanje 8 karaktera, veliko i malo slovo, broj/simbol</Text>}
        />

        <PasswordInput
          label="Potvrdi lozinku *"
          mt="sm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
        />

        <Checkbox
          mt="md"
          label="Prihvatam uslove korišćenja"
          checked={agree}
          onChange={(e) => setAgree(e.currentTarget.checked)}
        />
        {errors.agree && <Text size="xs" c="red" mt={4}>{errors.agree}</Text>}

        <Button fullWidth mt="lg" loading={loading} onClick={onSubmit}>
          Kreiraj nalog
        </Button>
      </Paper>
    </Stack>
  );
}
