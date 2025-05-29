import type React from "react";
import { TotalDisplayFunction } from "./function";
import { useTotalDisplay } from "./useTotalDisplay";

export const TotalDisplay: React.FC = () => {
  const hook = useTotalDisplay();

  return <TotalDisplayFunction hook={hook} />;
}; 