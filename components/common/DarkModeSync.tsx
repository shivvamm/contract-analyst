"use client";

import { useEffect } from "react";
import { useContractStore } from "@/stores/contract-store";

export function DarkModeSync() {
  const darkMode = useContractStore((s) => s.settings.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return null;
}
