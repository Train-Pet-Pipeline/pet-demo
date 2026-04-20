import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F4E9D8",
          color: "#2A1F14",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          borderRadius: 8,
        }}
      >
        P
      </div>
    ),
    size,
  );
}
