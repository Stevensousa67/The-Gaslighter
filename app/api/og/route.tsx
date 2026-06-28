import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const message = searchParams.get("message") ?? "User claimed something"
  const response =
    searchParams.get("response") ?? "Actually, you are wrong about that."
  const persona = searchParams.get("persona") ?? "academic"

  const truncatedResponse =
    response.length > 200 ? response.slice(0, 197) + "..." : response
  const truncatedMessage =
    message.length > 100 ? message.slice(0, 97) + "..." : message

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "1200px",
          height: "630px",
          backgroundColor: "#18101c",
          padding: "60px",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "52px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              backgroundColor: "#7c3aed",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            🔥
          </div>
          <span
            style={{
              color: "#e2d9f3",
              fontSize: "26px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            The Gaslighter
          </span>
        </div>

        {/* User message */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: "36px",
            paddingLeft: "4px",
            borderLeft: "3px solid #4c1d95",
          }}
        >
          <span
            style={{
              color: "#a78bca",
              fontSize: "15px",
              fontStyle: "italic",
              marginBottom: "6px",
              paddingLeft: "12px",
            }}
          >
            User claimed:
          </span>
          <span
            style={{
              color: "#c4b5e8",
              fontSize: "18px",
              fontStyle: "italic",
              paddingLeft: "12px",
              lineHeight: "1.5",
            }}
          >
            &ldquo;{truncatedMessage}&rdquo;
          </span>
        </div>

        {/* AI response — the burn */}
        <div
          style={{
            display: "flex",
            flex: "1",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              color: "#f5f0ff",
              fontSize: "34px",
              fontWeight: "700",
              lineHeight: "1.35",
            }}
          >
            {truncatedResponse}
          </span>
        </div>

        {/* Bottom: persona badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "36px",
          }}
        >
          <div
            style={{
              backgroundColor: "#2e1065",
              border: "1px solid #5b21b6",
              borderRadius: "100px",
              padding: "6px 18px",
              color: "#c4b5fd",
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.3px",
              textTransform: "capitalize",
            }}
          >
            {persona}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
