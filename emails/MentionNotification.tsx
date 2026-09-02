import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface MentionNotificationEmailProps {
  mentionerName: string;
  contextLabel: string;
  excerpt: string;
  url: string;
  unsubscribeUrl?: string;
}

export default function MentionNotificationEmail({
  mentionerName,
  contextLabel,
  excerpt,
  url,
  unsubscribeUrl,
}: MentionNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`${mentionerName} mentioned you on Our Virtue`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={kicker}>Our Virtue</Text>
          <Hr style={rule} />
          <Heading style={h1}>{mentionerName} mentioned you</Heading>
          <Text style={text}>{contextLabel}</Text>
          <Text style={quote}>&ldquo;{excerpt}&rdquo;</Text>
          <Button style={button} href={url}>
            View the conversation
          </Button>
          {unsubscribeUrl && (
            <>
              <Hr style={rule} />
              <Text style={footer}>
                You&apos;re receiving this because you&apos;re subscribed to
                Our Virtue.{" "}
                <a href={unsubscribeUrl} style={footerLink}>
                  Unsubscribe
                </a>
              </Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#faf8f3",
  fontFamily: "Georgia, 'Times New Roman', Times, serif",
};

const container = {
  margin: "0 auto",
  padding: "48px 24px",
  maxWidth: "480px",
};

const kicker = {
  fontSize: "12px",
  letterSpacing: "0.3em",
  textTransform: "uppercase" as const,
  fontWeight: 600,
  color: "#96742f",
  textAlign: "center" as const,
};

const rule = {
  width: "56px",
  height: "1px",
  backgroundColor: "#96742f",
  margin: "20px auto 28px",
  border: "none",
};

const h1 = {
  fontSize: "22px",
  fontStyle: "italic",
  fontWeight: 500,
  color: "#96742f",
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#3a362e",
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const quote = {
  fontSize: "16px",
  fontStyle: "italic" as const,
  lineHeight: "26px",
  color: "#3a362e",
  margin: "0 0 24px",
  padding: "16px 20px",
  background: "#ffffff",
  borderLeft: "3px solid #96742f",
};

const button = {
  display: "block" as const,
  width: "fit-content",
  margin: "0 auto",
  backgroundColor: "#96742f",
  color: "#faf8f3",
  padding: "12px 28px",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
};

const footer = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#8a8471",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#96742f",
};
