import * as React from "react";
import {
  Modal,
  Stack,
  Group,
  Button,
  Select,
  NumberInput,
  Text,
} from "@mantine/core";
import api from "../services/api";
import MonthSelector from "./MonthSelector";

export default function BudgetEditorModal({
  opened,
  onClose,
  categories = [],
  initial = null,          
  defaultMonth,           
  onSaved,
  onCategoriesRefresh,
}) {
  const expenseOptions = React.useMemo(
    () =>
      (categories || [])
        .filter((c) => c.type === "EXPENSE")
        .map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  const [form, setForm] = React.useState({
    category_id: null,
    month: defaultMonth || null, // 'YYYY-MM'
    limit_amount: 0,
  });
  const [loading, setLoading] = React.useState(false);

  
  React.useEffect(() => {
    if (!opened) return;
    if (initial) {
      setForm({
        category_id: String(initial.category_id),
        month: initial.month, 
        limit_amount: Number(initial.limit_amount) || 0,
      });
    } else {
      setForm({
        category_id: null,
        month: defaultMonth || null,
        limit_amount: 0,
      });
    }
  }, [opened, initial, defaultMonth]);

  const canSave =
    !!form.category_id && !!form.month && Number(form.limit_amount) > 0;

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!canSave) return;
    setLoading(true);
    try {
      if (initial?.id) {
        await api.put(`/budgets/${initial.id}`, {
          category_id: Number(form.category_id),
          month: form.month, // 'YYYY-MM'
          limit_amount: Number(form.limit_amount),
        });
      } else {
        await api.post("/budgets/", {
          category_id: Number(form.category_id),
          month: form.month, // 'YYYY-MM'
          limit_amount: Number(form.limit_amount),
        });
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Greška pri čuvanju budžeta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initial ? "Izmeni budžet" : "Novi budžet"}
      centered
    >
      <form onSubmit={submit}>
        <Stack gap="sm">
          <Select
            label="Kategorija (rashodi) *"
            placeholder={
              expenseOptions.length
                ? "Izaberi kategoriju"
                : "Nema kategorija tipa EXPENSE"
            }
            data={expenseOptions}
            value={form.category_id}
            onChange={(v) => setForm((f) => ({ ...f, category_id: v }))}
            searchable
            required
            disabled={!expenseOptions.length}
          />

          <div>
            <Text size="sm" c="dimmed" mb={4}>
              Mesec *
            </Text>
            <MonthSelector
              value={form.month || (defaultMonth ?? "")}
              onChange={(m) => setForm((f) => ({ ...f, month: m }))}
              inputWidth={160}
            />
          </div>

          <NumberInput
            label="Limit (RSD) *"
            value={form.limit_amount}
            onChange={(v) =>
              setForm((f) => ({ ...f, limit_amount: Number(v) || 0 }))
            }
            min={0}
            thousandSeparator="."
            decimalSeparator=","
            required
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="light" onClick={onClose}>
              Otkaži
            </Button>
            <Button type="submit" loading={loading} disabled={!canSave}>
              Sačuvaj
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}