"use client";

/** Opens the (short-lived) signed link to the clean file in a new tab, where it can be saved. */
export function openDownload(url: string) {
  window.open(url, "_blank", "noopener");
}
