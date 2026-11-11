"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { Container, PageHeader, Spinner, Stat } from "@/components/ui/page";
import { Tab, TabsList, TabsPanel, TabsRoot } from "@/components/ui/tabs";
import { formatNaira } from "@/lib/format";
import { errorMessage, useAdminQuery, useAdminUpdateUserMutation, useAdminUpdateVideoMutation } from "@/store/api";
import { useAuth } from "@/store/auth";
import { TransactionsTable, UsersTable, VideosTable } from "./_components/admin-tables";

export default function AdminPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login?next=/admin");
  }, [ready, user, router]);

  if (!ready || !user) return <Spinner />;
  if (!user.isAdmin) {
    return (
      <Container className="flex flex-1 flex-col items-center py-16">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-sunken text-muted ring-1 ring-line">
            <ShieldAlert size={26} aria-hidden />
          </span>
          <h1 className="text-2xl font-extrabold">Admins only</h1>
          <p className="text-[15px] text-muted">The admin dashboard is for the Àmì team. Your account can still upload and license videos as usual.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={async () => {
                await logout();
                router.push("/login?next=/admin");
              }}
            >
              Log in as an admin
            </Button>
            <LinkButton href="/browse" variant="secondary">
              Browse videos
            </LinkButton>
          </div>
        </div>
      </Container>
    );
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data, error, isLoading } = useAdminQuery();
  const [updateUser] = useAdminUpdateUserMutation();
  const [updateVideo] = useAdminUpdateVideoMutation();
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    setActionError(null);
    try {
      await fn();
    } catch (e) {
      setActionError(errorMessage(e, "That didn't work. Try again."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-8">
        <PageHeader eyebrow="Admin" title="Àmì dashboard" description="Everyone on the platform, every video and every payment. Hide videos, suspend accounts and mark creators as verified." />

        {isLoading ? (
          <Spinner label="Loading dashboard" />
        ) : error ? (
          <FormError>{errorMessage(error)}</FormError>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Stat label="Users" value={data.counts.users.toLocaleString("en-NG")} />
              <Stat label="Videos" value={data.counts.videos.toLocaleString("en-NG")} />
              <Stat label="Licences sold" value={data.counts.licencesSold.toLocaleString("en-NG")} />
              <Stat label="Total value" value={formatNaira(data.counts.totalValueKobo)} hint="Paid licences" />
              <Stat label="Àmì fees" value={formatNaira(data.counts.feesKobo)} hint="15% of each sale" />
            </div>

            <FormError>{actionError}</FormError>

            <TabsRoot defaultValue="users" className="flex flex-col gap-5">
              <div className="overflow-x-auto pb-1">
                <TabsList>
                  <Tab value="users">
                    Users <span className="tabular opacity-70">{data.users.length}</span>
                  </Tab>
                  <Tab value="videos">
                    Videos <span className="tabular opacity-70">{data.videos.length}</span>
                  </Tab>
                  <Tab value="transactions">
                    Transactions <span className="tabular opacity-70">{data.transactions.length}</span>
                  </Tab>
                </TabsList>
              </div>
              <TabsPanel value="users">
                <UsersTable
                  users={data.users}
                  busy={busy}
                  act={act}
                  onVerify={(id, verified) => updateUser({ id, verified }).unwrap()}
                  onSuspend={(id, suspended) => updateUser({ id, suspended }).unwrap()}
                />
              </TabsPanel>
              <TabsPanel value="videos">
                <VideosTable videos={data.videos} busy={busy} act={act} onStatus={(id, status) => updateVideo({ id, status }).unwrap()} />
              </TabsPanel>
              <TabsPanel value="transactions">
                <TransactionsTable transactions={data.transactions} />
              </TabsPanel>
            </TabsRoot>
          </>
        ) : null}
      </div>
    </Container>
  );
}
