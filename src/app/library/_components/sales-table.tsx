import Link from "next/link";
import { LicenceStatusBadge } from "@/components/ui/badge";
import { formatDate, formatNaira } from "@/lib/format";
import { platformLabel, labelForUseType } from "@/lib/pricing";
import type { Sale } from "@/lib/types";

/** Who licensed what, on which platform, and when it expires. */
export function SalesTable({ sales, showVideo = true }: { sales: Sale[]; showVideo?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-bold tracking-[0.08em] text-muted uppercase">
            {showVideo && <th className="px-4 py-3 font-bold">Video</th>}
            <th className="px-4 py-3 font-bold">Licensed by</th>
            <th className="px-4 py-3 font-bold">Licence</th>
            <th className="px-4 py-3 font-bold">Accounts covered</th>
            <th className="px-4 py-3 font-bold">Expires</th>
            <th className="px-4 py-3 text-right font-bold">Your share</th>
            <th className="px-4 py-3 font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sales.map((s) => (
            <tr key={s.licenceNumber} className="align-top">
              {showVideo && (
                <td className="max-w-56 px-4 py-3.5">
                  <Link href={`/library/videos/${s.videoId}`} className="line-clamp-2 font-semibold text-ink hover:underline">
                    {s.videoTitle}
                  </Link>
                </td>
              )}
              <td className="px-4 py-3.5">
                <p className="font-semibold text-ink">{s.buyerBusinessName ?? s.buyerName}</p>
                {s.buyerBusinessName && <p className="text-[12px] text-muted">{s.buyerName}</p>}
              </td>
              <td className="px-4 py-3.5">
                <p className="font-semibold text-ink">{labelForUseType(s.useType)}</p>
                <p className="text-[12px] text-muted">{platformLabel(s.platform)}</p>
              </td>
              <td className="px-4 py-3.5 text-[13px] text-ink">{s.coveredAccounts.join(", ")}</td>
              <td className="px-4 py-3.5 whitespace-nowrap text-ink tabular">{s.endsAt ? formatDate(s.endsAt) : "Lifetime"}</td>
              <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap text-ink tabular">{formatNaira(s.creatorShareKobo)}</td>
              <td className="px-4 py-3.5">
                <LicenceStatusBadge status={s.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
