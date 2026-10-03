"use client";

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main
          role="alert"
          style={{ textAlign: "center", marginTop: "4rem", padding: "0 1rem", fontSize: 24 }}
        >
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred.</p>
        </main>
      </body>
    </html>
  );
}
