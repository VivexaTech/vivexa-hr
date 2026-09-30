import { ImageResponse } from "next/og";

export const alt = "Vivexa HR — HR Management, Simplified.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f6f4f0",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 28, color: "#1b4d4a", fontWeight: 600 }}>Vivexa HR</div>
        <div style={{ marginTop: 24, fontSize: 64, color: "#12202a", fontWeight: 600 }}>HR Management, Simplified.</div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#5b6b75" }}>Free for 1 Company + 5 Employees</div>
      </div>
    ),
    size,
  );
}
