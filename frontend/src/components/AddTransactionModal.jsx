import * as React from "react";
import {
  Modal, Textarea, Button, Group, Stack, SegmentedControl, Select, NumberInput, TextInput
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconPlus } from "@tabler/icons-react";
import api from "../services/api";

// Modal za kreiranje kategorije (dinamički tip: INCOME/EXPENSE)
function NewCategoryModal({ opened, onClose, onCreated, type }) {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (opened) setName("");
  }, [opened]);

  const submit = async (e) => {
    e?.preventDefault?.();
    const n = name.trim();
    if (!n) return;
    setLoading(true);
    try {
      const res = await api.post("/categories/", { name: n, type });
      onCreated?.(res.data); // {id, name, type}
      onClose?.();
    } catch (err) {
      alert(err?.response?.data?.message || "Greška pri dodavanju kategorije");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={`Nova kategorija — ${type === "INCOME" ? "PRIHOD" : "RASHOD"}`} centered>
      <form onSubmit={submit}>
        <Stack gap="sm">
          <TextInput
            label="Naziv"
            placeholder={type === "INCOME" ? "Plata, Freelance..." : "Hrana, Prevoz..."}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={onClose}>Otkaži</Button>
            <Button type="submit" loading={loading}>Sačuvaj</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default function AddTransactionModal({
  opened,
  onClose,
  categories,
  onAdded,
  onCategoriesRefresh,
  defaultDate, 
}) {
  const [loading, setLoading] = React.useState(false);
  const [type, setType] = React.useState("INCOME");
  const [form, setForm] = React.useState({
    title: "",
    amount: 0,
    category_id: null,
    date: defaultDate || new Date(),
    note: "",
  });

  const [openNewCat, setOpenNewCat] = React.useState(false);

  
  React.useEffect(() => {
    if (opened) {
      setType("INCOME");
      setForm({
        title: "",
        amount: 0,
        category_id: null,
        date: defaultDate || new Date(),
        note: "",
      });
    }
  }, [opened, defaultDate]);

  const catOptions = React.useMemo(
    () =>
      (categories || [])
        .filter((c) => c.type === type)
        .map((c) => ({ value: String(c.id), label: c.name })),
    [categories, type]
  );

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!form.amount || !form.category_id) return;

    setLoading(true);
    try {
      await api.post("/transactions/", {
        type,
        title: form.title?.trim() || null,
        amount: Number(form.amount),
        category_id: Number(form.category_id),
        date: form.date?.toISOString?.() ?? new Date().toISOString(),
        note: form.note?.trim() || null,
      });
      onAdded?.(); 
      onClose?.();
    } catch (err) {
      const msg = err?.response?.data?.message || "Greška pri čuvanju transakcije";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatedCategory = async (cat) => {
    await onCategoriesRefresh?.();
    setForm((f) => ({ ...f, category_id: String(cat.id) }));
  };

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="Dodaj transakciju" centered>
        <form onSubmit={submit}>
          <Stack gap="sm">
            <SegmentedControl
              fullWidth
              value={type}
              onChange={setType}
              data={[
                { label: "Prihod", value: "INCOME" },
                { label: "Rashod", value: "EXPENSE" },
              ]}
            />

            <NumberInput
              label="Iznos *"
              placeholder="0"
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v || 0 })}
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              required
            />

            <Group align="end" gap="sm" wrap="nowrap">
              <Select
                style={{ flex: 1 }}
                label="Kategorija *"
                placeholder={catOptions.length ? "Izaberi kategoriju" : "Nema kategorija — kreiraj novu"}
                data={catOptions}
                value={form.category_id}
                onChange={(v) => setForm({ ...form, category_id: v })}
                searchable
                required
                disabled={!catOptions.length}
              />
              <Button variant="light" onClick={() => setOpenNewCat(true)}>
                Nova kategorija
              </Button>
            </Group>

            <TextInput
              label="Naslov (opciono)"
              placeholder={type === "INCOME" ? "npr. Plata" : "npr. Ručak"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
            />

            <DateInput
              label="Datum"
              value={form.date}
              onChange={(d) => setForm({ ...form, date: d || (defaultDate || new Date()) })}
              required
            />

            <Textarea
              label="Napomena (opciono)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.currentTarget.value })}
              autosize
              minRows={2}
            />

            <Group justify="flex-end" mt="sm">
              <Button variant="light" onClick={onClose}>Otkaži</Button>
              <Button type="submit" leftSection={<IconPlus size={16} />} loading={loading}>
                Sačuvaj
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal za kreiranje nove kategorije */}
      <NewCategoryModal
        opened={openNewCat}
        onClose={() => setOpenNewCat(false)}
        onCreated={handleCreatedCategory}
        type={type}
      />
    </>
  );
}