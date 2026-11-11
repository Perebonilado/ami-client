"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Still } from "@/components/clip-card";
import { Loading } from "@/components/loading";
import { formatNaira, formatPart } from "@/lib/format";
import { durationLabel } from "@/lib/pricing";
import { useRequireUser } from "@/lib/use-require-user";
import { useConfirmPaymentMutation, useGetPaymentQuery, useSimulatePaymentMutation } from "@/store/api";

type Phase = "confirming" | "failed" | "waiting";

const CHECK_EVERY_MS = 4000;
const MAX_CHECKS = 12;

/** True when the "bank page" is this page itself: the mock API's stand-in checkout. */
function isStandIn(paymentUrl: string | null, reference: string) {
  if (!paymentUrl) return true;
  try {
    const url = new URL(paymentUrl, window.location.href);
    return url.origin === window.location.origin && url.pathname === `/pay/${reference}`;
  } catch {
    return true;
  }
}

/**
 * Where people land after paying.
 * With the real bank (Xtradot sandbox), the bank sends them back here when it couldn't confirm straight
 * away, and this page asks the server to verify with the bank until the payment settles.
 * With the mock API there is no bank page, so this page stands in for it and simulates the payment.
 * Demo switch for the mock: add ?status=failed to the URL to see a failed payment.
 */
export function PayView({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const failFirst = useSearchParams().get("status") === "failed";
  const user = useRequireUser(`/pay/${reference}`);
  const router = useRouter();
  const { data, error } = useGetPaymentQuery(reference, { skip: !user });
  const [simulatePayment] = useSimulatePaymentMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [phase, setPhase] = useState<Phase>("confirming");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!data || phase !== "confirming") return;
    if (data.status === "paid") return void router.replace(`/licences/${data.licence.licenceNumber}?paid=1`);

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settle = (status: string, licenceNumber: string) => {
      if (cancelled) return true;
      if (status === "paid") router.replace(`/licences/${licenceNumber}?paid=1`);
      else if (status === "failed") setPhase("failed");
      return status === "paid" || status === "failed";
    };

    if (isStandIn(data.paymentUrl, reference)) {
      const outcome = failFirst && attempt === 0 ? "failed" : "paid";
      timer = setTimeout(async () => {
        try {
          const res = await simulatePayment({ reference, outcome }).unwrap();
          if (!settle(res.status, res.licence.licenceNumber) && !cancelled) setPhase("failed");
        } catch {
          if (!cancelled) setPhase("failed");
        }
      }, 1800);
    } else {
      let checks = 0;
      const check = async () => {
        try {
          const res = await confirmPayment(reference).unwrap();
          if (settle(res.status, res.licence.licenceNumber)) return;
        } catch {
          if (cancelled) return;
        }
        checks += 1;
        if (checks >= MAX_CHECKS) setPhase("waiting");
        else timer = setTimeout(check, CHECK_EVERY_MS);
      };
      timer = setTimeout(check, 600);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, phase, attempt, failFirst, reference, router, simulatePayment, confirmPayment]);

  if (error)
    return (
      <div className="empty">
        <h2>We couldn’t find this payment</h2>
        <p>Start again from the video you want to license.</p>
        <Link href="/browse" className="btn btn-ghost">
          Browse videos
        </Link>
      </div>
    );
  if (!data) return <Loading label="Loading payment" />;

  const { licence, video } = data;
  const summary = [video.title, formatPart(licence.part), durationLabel(licence.duration), formatNaira(data.amountKobo)].join(" · ");
  const checkAgain = () => {
    setAttempt((a) => a + 1);
    setPhase("confirming");
  };
  const tryAgain = () => {
    if (data.paymentUrl && !isStandIn(data.paymentUrl, reference)) window.location.assign(data.paymentUrl);
    else checkAgain();
  };

  return (
    <section className="pay" aria-live="polite">
      <div className="pic">
        <Still thumbnailUrl={video.thumbnailUrl} poster={video.poster} />
      </div>
      {phase === "confirming" ? (
        <>
          <h1>Confirming your payment</h1>
          <p className="sum">{summary}</p>
          <div className="wait" aria-hidden>
            <span />
          </div>
        </>
      ) : (
        <>
          <h1>{phase === "failed" ? "Your payment didn’t go through" : "Still waiting for the bank"}</h1>
          <p className="sum">{summary}</p>
          <div className="actions">
            <button type="button" className="btn btn-ink" onClick={phase === "failed" ? tryAgain : checkAgain}>
              {phase === "failed" ? "Try again" : "Check again"}
            </button>
            <Link href={`/videos/${video.id}`} className="btn btn-ghost">
              Back to the video
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
