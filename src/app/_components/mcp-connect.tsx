"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

// Where agents connect. Set NEXT_PUBLIC_MCP_URL once the backend's MCP server has its real address.
const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? "https://ami.ai/mcp";

/** The MCP server address with a copy button. */
export function McpConnect() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="connect">
      <span className="tag">MCP</span>
      <code aria-label="Àmì MCP server address">{MCP_URL.replace(/^https?:\/\//, "")}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(MCP_URL);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard blocked; the address is on screen to copy by hand */
          }
        }}
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
