"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, PaymentStatusBadge, VideoStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoThumb } from "@/components/video-thumb";
import { formatDate, formatNaira } from "@/lib/format";
import type { AdminOverview } from "@/lib/types";
import { EmptyRow, matches, SearchInput, TableShell, Td, Th } from "./table";

type Act = (key: string, fn: () => Promise<unknown>) => void;

export function UsersTable({ users, busy, act, onVerify, onSuspend }: {
  users: AdminOverview["users"];
  busy: string | null;
  act: Act;
  onVerify: (id: string, verified: boolean) => Promise<unknown>;
  onSuspend: (id: string, suspended: boolean) => Promise<unknown>;
}) {
  const [q, setQ] = useState("");
  const rows = users.filter((u) => matches(q, u.name, u.email, u.businessName, ...u.socialAccounts.map((s) => s.handle)));
  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={q} onChange={setQ} placeholder="Search name, email or business" />
      <TableShell minWidth={980}>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Business</Th>
            <Th align="right">Handles</Th>
            <Th align="right">Videos</Th>
            <Th align="right">Licences bought</Th>
            <Th>Status</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={8}>No users match “{q}”.</EmptyRow>}
          {rows.map((u) => (
            <tr key={u.id} className="last:[&>td]:border-b-0">
              <Td>
                <span className="font-semibold">{u.name}</span>
                {u.isAdmin && <span className="ml-2 text-[11px] font-bold tracking-wide text-ember-ink uppercase">Admin</span>}
              </Td>
              <Td className="text-muted">{u.email}</Td>
              <Td className="text-muted">{u.businessName ?? "—"}</Td>
              <Td align="right" className="tabular">{u.socialAccounts.length}</Td>
              <Td align="right" className="tabular">{u.videoCount}</Td>
              <Td align="right" className="tabular">{u.licenceCount}</Td>
              <Td>
                <span className="flex flex-wrap gap-1.5">
                  {u.verified ? <Badge tone="ok">Verified</Badge> : <Badge>Unverified</Badge>}
                  {u.suspended && <Badge tone="bad">Suspended</Badge>}
                </span>
              </Td>
              <Td align="right">
                <span className="inline-flex gap-2">
                  <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => act(`verify:${u.id}`, () => onVerify(u.id, !u.verified))}>
                    {busy === `verify:${u.id}` ? "Saving…" : u.verified ? "Unverify" : "Mark verified"}
                  </Button>
                  {!u.isAdmin && (
                    <Button size="sm" variant={u.suspended ? "secondary" : "danger"} disabled={busy !== null} onClick={() => act(`suspend:${u.id}`, () => onSuspend(u.id, !u.suspended))}>
                      {busy === `suspend:${u.id}` ? "Saving…" : u.suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  )}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

export function VideosTable({ videos, busy, act, onStatus }: {
  videos: AdminOverview["videos"];
  busy: string | null;
  act: Act;
  onStatus: (id: string, status: "live" | "hidden") => Promise<unknown>;
}) {
  const [q, setQ] = useState("");
  const rows = videos.filter((v) => matches(q, v.title, v.creator.name, v.category, v.status.replace("_", " "), ...v.tags));
  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={q} onChange={setQ} placeholder="Search title, creator or category" />
      <TableShell minWidth={860}>
        <thead>
          <tr>
            <Th>Video</Th>
            <Th>Creator</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Uploaded</Th>
            <Th align="right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={6}>No videos match “{q}”.</EmptyRow>}
          {rows.map((v) => (
            <tr key={v.id} className="last:[&>td]:border-b-0">
              <Td>
                <Link href={`/videos/${v.id}`} className="flex items-center gap-3 hover:underline">
                  <VideoThumb thumbnailUrl={v.thumbnailUrl} poster={v.poster} title="" showPlay={false} className="aspect-[4/5] w-10 shrink-0 rounded-lg" />
                  <span className="line-clamp-2 font-semibold">{v.title}</span>
                </Link>
              </Td>
              <Td className="text-muted">{v.creator.name}</Td>
              <Td className="text-muted">{v.category}</Td>
              <Td>
                <VideoStatusBadge status={v.status} />
              </Td>
              <Td className="whitespace-nowrap text-muted tabular">{formatDate(v.createdAt)}</Td>
              <Td align="right">
                {v.status === "live" ? (
                  <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => act(`video:${v.id}`, () => onStatus(v.id, "hidden"))}>
                    {busy === `video:${v.id}` ? "Saving…" : "Hide"}
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" disabled={busy !== null} onClick={() => act(`video:${v.id}`, () => onStatus(v.id, "live"))}>
                    {busy === `video:${v.id}` ? "Saving…" : "Make live"}
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}

export function TransactionsTable({ transactions }: { transactions: AdminOverview["transactions"] }) {
  const [q, setQ] = useState("");
  const rows = transactions.filter((t) => matches(q, t.reference, t.licenceNumber, t.videoTitle, t.buyerName, t.creatorName, t.status));
  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={q} onChange={setQ} placeholder="Search reference, licence, video or person" />
      <TableShell minWidth={1080}>
        <thead>
          <tr>
            <Th>Reference</Th>
            <Th>Licence</Th>
            <Th>Video</Th>
            <Th>Buyer</Th>
            <Th>Creator</Th>
            <Th align="right">Amount</Th>
            <Th align="right">Àmì fee</Th>
            <Th>Status</Th>
            <Th>Paid</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={9}>No transactions match “{q}”.</EmptyRow>}
          {rows.map((t) => (
            <tr key={t.reference} className="last:[&>td]:border-b-0">
              <Td className="code text-[13px] whitespace-nowrap text-muted">{t.reference}</Td>
              <Td className="whitespace-nowrap">
                <Link href={`/check/${t.licenceNumber}`} className="code text-[13px] font-semibold underline-offset-4 hover:text-ember-ink hover:underline">
                  {t.licenceNumber}
                </Link>
              </Td>
              <Td>
                <span className="line-clamp-2 max-w-56">{t.videoTitle}</span>
              </Td>
              <Td className="text-muted">{t.buyerName}</Td>
              <Td className="text-muted">{t.creatorName}</Td>
              <Td align="right" className="font-semibold whitespace-nowrap tabular">{formatNaira(t.amountKobo)}</Td>
              <Td align="right" className="whitespace-nowrap text-muted tabular">{formatNaira(t.platformFeeKobo)}</Td>
              <Td>
                <PaymentStatusBadge status={t.status} />
              </Td>
              <Td className="whitespace-nowrap text-muted tabular">{formatDate(t.paidAt)}</Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
}
