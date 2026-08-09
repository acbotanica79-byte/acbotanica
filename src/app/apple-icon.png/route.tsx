import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          background: "#1b4332",
          color: "#95d5b2",
          fontSize: 72,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        AC
      </div>
    ),
    { width: 180, height: 180 }
  );
}
