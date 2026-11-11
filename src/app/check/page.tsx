import type { Metadata } from "next";
import { CheckView } from "./_components/check-view";
import "./check.css";

export const metadata: Metadata = { title: "Check a licence" };

export default function CheckPage() {
  return (
    <div className="p-check wrap">
      <CheckView />
    </div>
  );
}
