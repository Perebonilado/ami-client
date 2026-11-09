"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { ComponentProps } from "react";

export const TabsRoot = BaseTabs.Root;

export function TabsList({ className = "", children, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List {...props} className={`relative z-0 inline-flex gap-1 rounded-full border border-line bg-white p-1 ${className}`}>
      {children}
      <BaseTabs.Indicator className="absolute top-1/2 left-0 -z-1 h-[calc(100%-0.5rem)] w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-1/2 rounded-full bg-ink transition-[translate,width] duration-200 ease-out" />
    </BaseTabs.List>
  );
}

export function Tab({ className = "", ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      {...props}
      className={`flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap text-muted outline-none transition-colors select-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ink data-active:text-white ${className}`}
    />
  );
}

export function TabsPanel({ className = "", ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return <BaseTabs.Panel {...props} className={`outline-none ${className}`} />;
}
