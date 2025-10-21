import * as React from "react";
import {
  Popover,
  TextInput,
  Paper,
  Group,
  ActionIcon,
  Button,
  Grid,
  Text,
} from "@mantine/core";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

const M_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function pad2(n){ return String(n).padStart(2,"0"); }
function toYYYYMM(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}`; }
function fromYYYYMM(s){
  const [yy,mm] = (s||"").split("-").map(Number);
  const d = !yy||!mm ? new Date() : new Date(yy,mm-1,1,12,0,0,0);
  return d;
}

export default function MonthSelector({ value, onChange, inputWidth = 160 }) {
  const [opened, setOpened] = React.useState(false);
  const selected = React.useMemo(() => fromYYYYMM(value), [value]);
  const [year, setYear] = React.useState(selected.getFullYear());
  React.useEffect(() => { setYear(selected.getFullYear()); }, [selected]);

  const monthIdx = selected.getMonth();
  const label = `${M_SHORT[monthIdx]} ${selected.getFullYear()}`;

  const pick = (mIndex) => {
    const next = new Date(year, mIndex, 1, 12);
    onChange?.(toYYYYMM(next));
    setOpened(false);
  };

  const thisMonth = () => {
    const now = new Date();
    onChange?.(toYYYYMM(new Date(now.getFullYear(), now.getMonth(), 1, 12)));
    setOpened(false);
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom"
      withArrow
      shadow="md"
      width={300}
      radius="md"
    >
      <Popover.Target>
        <TextInput
          value={label}
          readOnly
          onClick={() => setOpened((o) => !o)}
          rightSection={<IconCalendar size={16} color="white" />}
          styles={{
            input: {
              width: inputWidth,
              textAlign: "center",
              height: 36,
              cursor: "pointer",
              borderRadius: 10,
              color: "white",
              backgroundColor: "rgba(255,255,255,0.05)",
            },
          }}
          aria-label="Izbor meseca"
        />
      </Popover.Target>

      <Popover.Dropdown p="xs" style={{ backgroundColor: "#222", color: "white" }}>
        <Paper p="xs" radius="md" style={{ backgroundColor: "#222", color: "white" }}>
          <Group justify="space-between" align="center" mb="xs">
            <ActionIcon
              size="md"
              variant="subtle"
              onClick={() => setYear((y) => y - 1)}
              style={{ color: "white" }}
              title="Prethodna godina"
            >
              <IconChevronLeft size={18} />
            </ActionIcon>

            <Text fw={700} fz="sm" c="white">{year}</Text>

            <ActionIcon
              size="md"
              variant="subtle"
              onClick={() => setYear((y) => y + 1)}
              style={{ color: "white" }}
              title="Sledeća godina"
            >
              <IconChevronRight size={18} />
            </ActionIcon>
          </Group>

          <Grid gutter={6} mb="xs">
            {M_SHORT.map((m, idx) => {
              const isSelected = idx === monthIdx && year === selected.getFullYear();
              return (
                <Grid.Col key={m} span={4}>
                  <Button
                    fullWidth
                    size="xs"
                    variant={isSelected ? "filled" : "subtle"}
                    onClick={() => pick(idx)}
                    style={{
                      borderRadius: 8,
                      height: 30,
                      backgroundColor: isSelected
                        ? "#228be6"
                        : "rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }}
                  >
                    {m}
                  </Button>
                </Grid.Col>
              );
            })}
          </Grid>

          <Group justify="space-between" mt="xs">
            <Button
              size="xs"
              variant="subtle"
              style={{
                color: "white",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={() => setOpened(false)}
            >
              Zatvori
            </Button>

            <Button
              size="xs"
              variant="subtle"
              style={{
                color: "white",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={thisMonth}
            >
              Ovaj mesec
            </Button>
          </Group>
        </Paper>
      </Popover.Dropdown>
    </Popover>
  );
}