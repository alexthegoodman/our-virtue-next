export default function UnsubscribedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#faf8f3",
        fontFamily: "Georgia, 'Times New Roman', Times, serif",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "420px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "#96742f",
            margin: "0 0 20px",
          }}
        >
          Our Virtue
        </p>
        <h1
          style={{
            fontSize: "24px",
            fontStyle: "italic",
            fontWeight: 500,
            color: "#3a362e",
            margin: "0 0 16px",
          }}
        >
          You&rsquo;ve been unsubscribed
        </h1>
        <p style={{ fontSize: "16px", lineHeight: "26px", color: "#3a362e" }}>
          You won&rsquo;t receive any more verse emails from us. You&rsquo;re
          always welcome back at{" "}
          <a href="https://our-virtue.com" style={{ color: "#96742f" }}>
            our-virtue.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
