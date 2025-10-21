import { Group, Text, ActionIcon, Anchor, Container } from "@mantine/core";
import { IconBrandInstagram, IconBrandFacebook, IconMail } from "@tabler/icons-react";

export default function Footer() {
  return (
    <div
      style={{
        marginTop: 56,                      
        paddingTop: 32,
        paddingBottom: 32,
        
        background:
          "radial-gradient(60rem 14rem at 50% 0%, rgba(255,255,255,0.05), transparent 60%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Container size="lg" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Text size="sm" c="dimmed">
          © {new Date().getFullYear()} Moj Budžet — planiraj, troši i štedi pametno.
        </Text>

        <Group gap="xs">
          <ActionIcon
            size="lg"
            variant="light"
            color="grape"
            component="a"
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <IconBrandInstagram size={18} />
          </ActionIcon>

          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            component="a"
            href="https://www.facebook.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <IconBrandFacebook size={18} />
          </ActionIcon>

          <ActionIcon
            size="lg"
            variant="light"
            color="teal"
            component="a"
            href=""
            aria-label="Pošalji email"
            title="kontakt@mojbudzet.app"
          >
            <IconMail size={18} />
          </ActionIcon>

          <Anchor size="sm" c="dimmed" href="" underline="never" ml="xs">
            kontakt@mojbudzet.app
          </Anchor>
        </Group>
      </Container>
    </div>
  );
}
