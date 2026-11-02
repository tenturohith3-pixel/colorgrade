"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { KeyEntryModal } from "@/components/studio/KeyEntryModal";

export function PricingTools() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={() => setOpen(true)} className="btn-primary gap-2">
        <KeyRound className="size-4" />
        I have a key — activate
      </button>
      <p className="mono-label !text-[9px]">
        KEYS ARE MINTED PRIVATELY BY THE TEAM — CONTACT TO BUY
      </p>
      {open ? <KeyEntryModal onClose={() => setOpen(false)} /> : null}
    </div>
  );
}
