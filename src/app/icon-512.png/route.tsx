import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div
          style={{
            width: "82%",
            height: "82%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#1b4332",
            color: "#95d5b2",
            fontSize: 90,
            fontWeight: 700,
            fontFamily: "serif",
          }}
        >
          ACCFG
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
