"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";

/**
 * Display-only range switch for Analytics (the server page renders the same
 * real data regardless; this is the canonical segmented control surfaced here).
 */
export function AnalyticsRange() {
  const [range, setRange] = useState("30d");
  return (
    <div className="mb-[18px]">
      <SegmentedControl
        value={range}
        onValueChange={setRange}
        tone="accent"
        aria-label="Date range"
        options={[
          { value: "30d", label: "Last 30 days" },
          { value: "quarter", label: "This quarter" },
          { value: "all", label: "All time" },
        ]}
      />
    </div>
  );
}
