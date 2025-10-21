import { Container, Grid, Card, Title, Text, Button, Group } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { formatRSD } from "../utils/money";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionsTable from "../components/TransactionsTable";
import { IconPlus } from "@tabler/icons-react";
import MonthSelector from "../components/MonthSelector";

/* ---------------- helpers ---------------- */
function toYYYYMM(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function fromYYYYMM(s) {
  const [yy, mm] = s.split("-").map(Number);
  // uvek 1. u mesecu u 12:00 (lokalno) da nema TZ/DST problema
  return new Date(yy, mm - 1, 1, 12, 0, 0, 0);
}
function firstDayOfMonthNoon(yyyyMm) {
  const d = fromYYYYMM(yyyyMm);
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
}
function firstDayOfMonthDate(yyyyMm) {
  // za API filter (od 00:00)
  const d = fromYYYYMM(yyyyMm);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function lastDayOfMonthDate(yyyyMm) {
  // za API filter (do 23:59:59.999)
  const d = fromYYYYMM(yyyyMm);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
/* ----------------------------------------- */

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);

  // glavni state: 'YYYY-MM'
  const [monthStr, setMonthStr] = useState(() => toYYYYMM(new Date()));
  const monthDate = useMemo(() => fromYYYYMM(monthStr), [monthStr]);

  const monthLabel = useMemo(
    () =>
      new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toLocaleDateString("sr-Latn-RS", {
        year: "numeric",
        month: "long",
      }),
    [monthDate]
  );

  const load = async () => {
    try {
      const from = firstDayOfMonthDate(monthStr).toISOString();
      const to = lastDayOfMonthDate(monthStr).toISOString();

      const [cats, tx] = await Promise.all([
        api.get("/categories/").then((r) => r.data),
        api
          .get("/transactions/", {
            params: { from, to, date_from: from, date_to: to }, 
          })
          .then((r) => r.data),
      ]);

      setCategories(Array.isArray(cats) ? cats : []);
      setTransactions(Array.isArray(tx) ? tx : []);
    } catch {
      setTransactions([]);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthStr]);

  const categoriesById = useMemo(() => {
    const m = {};
    for (const c of categories) m[c.id] = c;
    return m;
  }, [categories]);

  const { income, expense, balance } = useMemo(() => {
    let income = 0,
      expense = 0;
    for (const t of transactions) {
      const a = Number(t.amount) || 0;
      if (t.type === "INCOME") income += a;
      if (t.type === "EXPENSE") expense += a;
    }
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recent = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    [transactions]
  );

  return (
    <Container py="lg">
      <Group justify="space-between" mb="md">
        <Group gap="sm" align="center">
          <Title order={3}>Pregled — Moj Budžet</Title>

          {/* stabilni kompaktni picker */}
          <MonthSelector value={monthStr} onChange={setMonthStr} />
        </Group>

        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpenAdd(true)}>
          Dodaj transakciju
        </Button>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="md">
            <Text c="dimmed" size="sm">Prihodi ({monthLabel})</Text>
            <Title order={4}>{formatRSD(income)}</Title>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="md">
            <Text c="dimmed" size="sm">Rashodi ({monthLabel})</Text>
            <Title order={4}>{formatRSD(expense)}</Title>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder p="md">
            <Text c="dimmed" size="sm">Stanje</Text>
            <Title
              order={4}
              style={{
                color: balance > 0 ? "#51cf66" : balance < 0 ? "#fa5252" : "#868e96",
              }}
            >
              {formatRSD(balance)}
            </Title>
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Card withBorder p="md" mih={160}>
            <Text c="dimmed" size="sm" mb="xs">Poslednje transakcije ({monthLabel})</Text>
            <TransactionsTable items={recent} categoriesById={categoriesById} />
          </Card>
        </Grid.Col>

        <Grid.Col span={12}>
          <Card withBorder p="md" mih={120}>
            <Text c="dimmed" size="sm" mb="xs">Tvoje kategorije:</Text>
            <Text size="sm">
              {categories.map((c) => `${c.name} (${c.type})`).join(", ") || "—"}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <AddTransactionModal
        opened={openAdd}
        onClose={() => setOpenAdd(false)}
        categories={categories}
        onAdded={load}
        //  prvi dan izabranog meseca u 12:00 (lokalno)
        defaultDate={firstDayOfMonthNoon(monthStr)}
        onCategoriesRefresh={async () => {
          const cats = await api.get("/categories/").then((r) => r.data);
          setCategories(Array.isArray(cats) ? cats : []);
        }}
      />
    </Container>
  );
}