import type React from "react";
import { TaxModeToggleFunction } from "./function";
import { useTaxModeToggle } from "./useTaxModeToggle";

export const TaxModeToggle: React.FC = () => {
  const hook = useTaxModeToggle();

  return <TaxModeToggleFunction hook={hook} />;
}; 