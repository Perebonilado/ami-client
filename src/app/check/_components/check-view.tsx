"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Still } from "@/components/clip-card";
import { VerifiedTick } from "@/components/icons";
import { Loading } from "@/components/loading";
import { formatDate, formatPart, formatSeconds } from "@/lib/format";
import { normaliseLicenceNumber, tidyLicenceInput } from "@/lib/pricing";
import type { LicenceCheck } from "@/lib/types";
import { errorMessage, useCheckLicenceQuery } from "@/store/api";

const FULL_LENGTH = "AMI-XXXX-XXXX".length;

/** Public licence check. The form sits on /check; a result lives at /check/AMI-XXXX-XXXX (where certificate QR codes point). */
export function CheckView({ params }: { params?: Promise<{ number: string }> }) {
  const number = params ? normaliseLicenceNumber(decodeURIComponent(use(params).number)) : null;
  const router = useRouter();
  const [value, setValue] = useState(number ?? "");
  const [tooShort, setTooShort] = useState(false);

  return (
    <section className="lookup">
      <h1>Check a licence</h1>
      <form
        className="bar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const tidy = tidyLicenceInput(value);
          setValue(tidy);
          if (tidy.length < FULL_LENGTH) return setTooShort(true);
          setTooShort(false);
          router.push(`/check/${tidy}`);
        }}
      >
        <input
          value={value}
          onChange={(e) => {
            const raw = e.target.value;
            // Shape what people type into AMI-XXXX-XXXX, but leave the first few letters alone while they start typing
            setValue(raw.trim() && (raw.length >= 4 || /^ami/i.test(raw)) ? tidyLicenceInput(raw) : raw.toUpperCase());
          }}
          placeholder="Licence number, like AMI-7K3Q-92XD"
          aria-label="Licence number"
          autoComplete="off"
          spellCheck={false}
          maxLength={FULL_LENGTH}
          autoFocus={!number}
          enterKeyHint="search"
        />
        <button className="btn btn-ink" type="submit">
          Check
        </button>
      </form>

      <div aria-live="polite">
        {tooShort ? (
          <div className="none">
            <h2>That number looks too short</h2>
            <p>Licence numbers look like AMI-7K3Q-92XD.</p>
          </div>
        ) : number ? (
          <Result key={number} number={number} />
        ) : null}
      </div>
    </section>
  );
}

function Result({ number }: { number: string }) {
  const { data, error, refetch } = useCheckLicenceQuery(number);

  if (error)
    return (
      <div className="none">
        <h2>We couldn’t check this licence right now</h2>
        <p>{errorMessage(error)}</p>
        <button type="button" className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  if (!data) return <Loading label="Checking licence" />;
  if (data.status === "not_found" || !data.licence)
    return (
      <div className="none">
        <h2>We couldn’t find {number}</h2>
        <p>Check the number on the certificate and try again.</p>
      </div>
    );

  const l = data.licence;
  const valid = data.status === "valid";
  return (
    <article className={`result${valid ? "" : " is-off"}`}>
      <div className="top">
        <span className="num">{l.licenceNumber}</span>
        <span className={`status ${valid ? "ok" : "off"}`}>
          <i aria-hidden />
          {statusText(data)}
        </span>
      </div>
      <div className="clip">
        <div className="pic">
          <Still thumbnailUrl={l.video.thumbnailUrl} poster={l.video.poster} />
        </div>
        <div>
          <h2>{l.video.title}</h2>
          <p>
            by {l.creator.name}
            {l.creator.verified && <VerifiedTick />}
          </p>
        </div>
      </div>
      <dl className="rows">
        <div>
          <dt>Licensed to</dt>
          <dd>{l.buyer.businessName ?? l.buyer.name}</dd>
        </div>
        <div>
          <dt>Part</dt>
          <dd>
            {formatPart(l.part)}
            {l.part && <span>{formatSeconds(l.part.endSec - l.part.startSec)}</span>}
          </dd>
        </div>
        <div>
          <dt>{valid ? "Valid until" : "Ended"}</dt>
          <dd>{l.endsAt ? formatDate(l.endsAt) : "Forever"}</dd>
        </div>
      </dl>
    </article>
  );
}

function statusText({ status, licence }: LicenceCheck) {
  if (status !== "valid") return `Expired ${formatDate(licence?.endsAt ?? null)}`;
  if (!licence?.endsAt) return "Valid · forever";
  const days = Math.max(0, Math.ceil((new Date(licence.endsAt).getTime() - Date.now()) / 86_400_000));
  return `Valid · ${days} ${days === 1 ? "day" : "days"} left`;
}
