import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface SignupFollowUpEmailProps {
  heading: string;
  paragraphs: string[];
  previewText: string;
}

export default function SignupFollowUpEmail({
  heading,
  paragraphs,
  previewText,
}: SignupFollowUpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={kicker}>Our Virtue</Text>
          <Hr style={rule} />
          <Heading style={h1}>{heading}</Heading>
          {paragraphs.map((paragraph, index) => (
            <Text style={text} key={index}>
              {paragraph}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#faf8f3",
  fontFamily:
    "Georgia, 'Times New Roman', Times, serif",
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
  fontSize: "24px",
  fontStyle: "italic",
  fontWeight: 500,
  color: "#96742f",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#3a362e",
  margin: "0 0 16px",
};
