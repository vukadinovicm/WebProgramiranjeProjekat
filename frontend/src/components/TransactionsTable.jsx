import * as React from "react";
import { Table, Badge, Group, Text } from "@mantine/core";
import { formatRSD } from "../utils/money";

export default function TransactionsTable({ items = [], categoriesById = {} }) {
  return (
    <Table verticalSpacing="xs" highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Datum</Table.Th>
          <Table.Th>Kategorija</Table.Th>
          <Table.Th>Tip</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Iznos</Table.Th>
          <Table.Th>Napomena</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.length === 0 ? (
          <Table.Tr><Table.Td colSpan={5}><Text c="dimmed">Nema transakcija.</Text></Table.Td></Table.Tr>
        ) : items.map(t => {
          const cat = categoriesById[t.category_id];
          const typeColor = t.type === "INCOME" ? "green" : "red";
          const amountSign = t.type === "INCOME" ? "" : "-";
          const d = new Date(t.date);
          const ds = d.toLocaleDateString("sr-RS");
          return (
            <Table.Tr key={t.id}>
              <Table.Td>{ds}</Table.Td>
              <Table.Td>{cat?.name || "—"}</Table.Td>
              <Table.Td>
                <Badge color={typeColor} variant="light">
                  {t.type === "INCOME" ? "Prihod" : "Rashod"}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: "right", fontWeight: 600 }}>
                <Group justify="flex-end" gap={6} wrap="nowrap">
                  <Text c={typeColor}>{amountSign}{formatRSD(t.amount)}</Text>
                </Group>
              </Table.Td>
              <Table.Td>{t.note || "—"}</Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}