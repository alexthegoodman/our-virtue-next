import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

interface VerseEmailProps {
  verseText: string;
  poemTitle: string;
  categoryTitle: string;
  readMoreUrl: string;
  unsubscribeUrl: string;
}

export default function VerseEmail({
  verseText,
  poemTitle,
  categoryTitle,
  readMoreUrl,
  unsubscribeUrl,
}: VerseEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{`From "${poemTitle}" — a verse from Our Virtue`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={kicker}>Our Virtue</Text>
          <Hr style={rule} />

          <Text style={eyebrow}>
            {categoryTitle} &middot; {poemTitle}
          </Text>

          {verseText.split("\n\n").map((line, index) => (
            <Text style={verse} key={index}>
              {line}
            </Text>
          ))}

          <Link href={readMoreUrl} style={readMore}>
            Read the full poem &rarr;
          </Link>

          <Hr style={rule} />

          <Text style={share}>
            If this spoke to you, consider sharing Our Virtue with someone
            who needs it. Send them to{" "}
            <Link href="https://our-virtue.com" style={shareLink}>
              our-virtue.com
            </Link>
            .
          </Text>

          <Text style={footer}>
            You're receiving this because you signed up at{" "}
            <Link href="https://our-virtue.com" style={footerLink}>
              our-virtue.com
            </Link>
            . <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
          </Text>
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

const eyebrow = {
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "#8a8370",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const verse = {
  fontSize: "20px",
  fontStyle: "italic",
  lineHeight: "32px",
  color: "#3a362e",
  textAlign: "center" as const,
  margin: "0 0 18px",
};

const readMore = {
  display: "block",
  textAlign: "center" as const,
  fontSize: "14px",
  color: "#96742f",
  margin: "24px 0 0",
};

const share = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#3a362e",
  textAlign: "center" as const,
  margin: "0 0 8px",
};

const shareLink = {
  color: "#96742f",
};

const footer = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#8a8370",
  textAlign: "center" as const,
  margin: "16px 0 0",
};

const footerLink = {
  color: "#8a8370",
  textDecoration: "underline",
};
