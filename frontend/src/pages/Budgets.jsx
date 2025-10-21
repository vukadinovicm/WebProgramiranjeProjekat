import * as React from "react";
import {
  Container,
  Card,
  Title,
  Text,
  Grid,
  Group,
  Button,
  ActionIcon,
  Table,
  Badge,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import api from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import MonthSelector from "../components/MonthSelector";
import BudgetEditorModal from "../components/BudgetEditorModal";

// helpers
function toYYYYMM(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function BudgetsPage() {
  const [categories, setCategories] = React.useState([]);
  const [budgets, setBudgets] = React.useState([]);
  const [summary, setSummary] = React.useState([]);

  // glavni mesec kao 'YYYY-MM'
  const [month, setMonth] = React.useState(() => toYYYYMM(new Date()));

  const [openEditor, setOpenEditor] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  const load = async () => {
    try {
      const [cats, buds, sum] = await Promise.all([
        api.get("/categories/").then((r) => r.data),
        api.get("/budgets/").then((r) => r.data),
        api
          .get("/budgets/summary", { params: { month } })
          .then((r) => r.data),
      ]);
      setCategories(cats || []);
      setBudgets(buds || []);
      setSummary(sum || []);
    } catch {
      
    }
  };

  React.useEffect(() => {
    load();
    
  }, [month]);

  const expenseCatsById = React.useMemo(() => {
    const m = {};
    (categories || [])
      .filter((c) => c.type === "EXPENSE")
      .forEach((c) => (m[c.id] = c.name));
    return m;
  }, [categories]);

  const remove = async (id) => {
    if (!window.confirm("Obrisati budžet?")) return;
    try {
      await api.delete(`/budgets/${id}`);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Greška pri brisanju");
    }
  };

  const summaryByCat = React.useMemo(() => {
    const byCat = {};
    (summary || []).forEach((s) => (byCat[s.category_id] = s));
    (budgets || [])
      .filter((b) => b.month === month)
      .forEach((b) => {
        if (!byCat[b.category_id]) {
          byCat[b.category_id] = {
            month,
            category_id: b.category_id,
            category_name: expenseCatsById[b.category_id] || "—",
            limit_amount: b.limit_amount,
            spent: 0,
            remaining: Number(b.limit_amount),
          };
        }
      });
    return Object.values(byCat).sort((a, b) =>
      a.category_name.localeCompare(b.category_name)
    );
  }, [summary, budgets, month, expenseCatsById]);

  return (
    <Container py="lg">
      <Group justify="space-between" mb="md">
        <Title order={3}>Budžeti po kategorijama</Title>
        <Group>
          {/* stabilan kompaktan picker */}
          <MonthSelector value={month} onChange={setMonth} inputWidth={160} />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditing(null);
              setOpenEditor(true);
            }}
          >
            Novi budžet
          </Button>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md">
            <Text c="dimmed" size="sm" mb="xs">
              Potrošnja vs. limit — {month}
            </Text>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryByCat}>
                  <XAxis dataKey="category_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="limit_amount"
                    name="Limit"
                    fill="#4dabf7"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="spent"
                    name="Potrošeno"
                    fill="#fa5252"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="md">
            <Text c="dimmed" size="sm" mb="xs">
              Budžeti za {month}
            </Text>
            <Table verticalSpacing="xs" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Kategorija</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Limit</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Potrošeno</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Preostalo</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {summaryByCat.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={5}>
                      <Text c="dimmed">Nema definisanih budžeta.</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  summaryByCat.map((row) => {
                    const over = row.remaining < 0;
                    return (
                      <Table.Tr key={row.category_id}>
                        <Table.Td>{row.category_name}</Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>
                          {Math.round(row.limit_amount).toLocaleString("sr-RS")} RSD
                        </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "right",
                            color: "var(--mantine-color-red-5)",
                          }}
                        >
                          {Math.round(row.spent).toLocaleString("sr-RS")} RSD
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>
                          <Badge color={over ? "red" : "green"} variant="light">
                            {Math.round(row.remaining).toLocaleString("sr-RS")} RSD
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>
                          <Group gap={6} justify="flex-end">
                            <ActionIcon
                              variant="subtle"
                              onClick={() => {
                                const b = (budgets || []).find(
                                  (x) =>
                                    x.category_id === row.category_id &&
                                    x.month === month
                                );
                                if (b) {
                                  setEditing(b);
                                  setOpenEditor(true);
                                }
                              }}
                              title="Izmeni"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                const b = (budgets || []).find(
                                  (x) =>
                                    x.category_id === row.category_id &&
                                    x.month === month
                                );
                                if (b) remove(b.id);
                              }}
                              title="Obriši"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
      </Grid>

      <BudgetEditorModal
        opened={openEditor}
        onClose={() => setOpenEditor(false)}
        categories={categories}
        initial={editing}
        defaultMonth={month}            
        onSaved={load}
        onCategoriesRefresh={async () => {
          const cats = await api.get("/categories/").then((r) => r.data);
          setCategories(cats || []);
        }}
      />
    </Container>
  );
}

