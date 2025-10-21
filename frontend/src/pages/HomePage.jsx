import {
  Container, Title, Text, Button, Stack, Group, SimpleGrid, ThemeIcon, Paper
} from "@mantine/core";
import { IconWallet, IconChartPie, IconShieldCheck, IconTrendingUp } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        overflow: "hidden",
        background:
          "radial-gradient(80rem 40rem at 20% -10%, rgba(59,130,246,0.20), transparent 60%), radial-gradient(70rem 30rem at 120% 10%, rgba(16,185,129,0.18), transparent 60%)",
      }}
    >
      {/* “Hero” sekcija */}
      <Container size="lg" pt={80} pb={40}>
        <Stack align="center" gap="md" ta="center">
          <ThemeIcon size={56} radius="xl" color="blue" variant="light">
            <IconWallet size={28} />
          </ThemeIcon>

          <Title order={1} fw={800} lh={1.1}>
            Moj Budžet
          </Title>

          <Text size="lg" c="dimmed" maw={720}>
            Jednostavan način da pratiš prihode i rashode, planiraš budžete i
            donosiš pametnije odluke o trošenju — svaki dan.
          </Text>

          <Group mt="xs">
            <Button size="lg" radius="xl" onClick={() => nav("/register")}>
              Registruj se besplatno
            </Button>
            <Button size="lg" radius="xl" variant="outline" onClick={() => nav("/login")}>
              Već imaš nalog? Prijava
            </Button>
          </Group>
        </Stack>
      </Container>

    {/* Benefiti / Features */}
    <Container size="lg" pb={80}>
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {[
        { icon: <IconChartPie size={32} />, title: "Pregled potrošnje", text: "Grafici po kategorijama i vremenu.", color: "blue" },
        { icon: <IconTrendingUp size={32} />, title: "Budžeti i ciljevi", text: "Postavi limite i prati napredak.", color: "teal" },
        { icon: <IconShieldCheck size={32} />, title: "Sigurnost", text: "Prijava tokenom i izolovan nalog.", color: "grape" },
        { icon: <IconWallet size={32} />, title: "Brz unos troškova", text: "Unos u par klikova, gde god da si.", color: "orange" },
        ].map((item, i) => (
        <Paper
            key={i}
            withBorder
            p="xl"
            radius="lg"
            ta="center"
            style={{
            backdropFilter: "blur(8px)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            transition: "all 0.3s ease",
            cursor: "default",
            }}
            onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px)";
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.boxShadow = "none";
            }}
        >
            <ThemeIcon
            size={64}
            radius="xl"
            color={item.color}
            variant="light"
            mx="auto"
            mb="md"
            style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
            }}
            >
            {item.icon}
            </ThemeIcon>

            <Text fw={600} mb={4}>
            {item.title}
            </Text>
            <Text size="sm" c="dimmed">
            {item.text}
            </Text>
        </Paper>
        ))}
    </SimpleGrid>
    </Container>

      
    </div>
  );
}