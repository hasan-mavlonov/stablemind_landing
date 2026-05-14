export { default as Ada } from "./Ada";
export { default as Vex } from "./Vex";
export { default as Mox } from "./Mox";
export { default as Hale } from "./Hale";
export { default as June } from "./June";
export { default as Orin } from "./Orin";

import Ada from "./Ada";
import Vex from "./Vex";
import Mox from "./Mox";
import Hale from "./Hale";
import June from "./June";
import Orin from "./Orin";

import type { ComponentType } from "react";

export const CastIllustration: Record<string, ComponentType<{ className?: string; title?: string }>> = {
  ada: Ada,
  vex: Vex,
  mox: Mox,
  hale: Hale,
  june: June,
  orin: Orin,
};
