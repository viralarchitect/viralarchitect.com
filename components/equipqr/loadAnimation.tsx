import type { ComponentType } from "react";
import type QRScanPhase from "./QRScanPhase";
import type StateMorphPhase from "./StateMorphPhase";
import type AssetDotsPhase from "./AssetDotsPhase";
import type NationalMapPhase from "./NationalMapPhase";
import type PMChecklistPhase from "./PMChecklistPhase";

export type AnimationPhases = {
  QRScanPhase: typeof QRScanPhase;
  StateMorphPhase: typeof StateMorphPhase;
  AssetDotsPhase: typeof AssetDotsPhase;
  NationalMapPhase: typeof NationalMapPhase;
  PMChecklistPhase: typeof PMChecklistPhase;
};
let pending: Promise<ComponentType> | undefined;

/** Load the whole sequence before mounting, so phase changes never suspend or flash. */
export function loadAnimation(): Promise<ComponentType> {
  if (!pending) {
    pending = Promise.all([
      import("./HeroAnimation"),
      import("./QRScanPhase"),
      import("./StateMorphPhase"),
      import("./AssetDotsPhase"),
      import("./NationalMapPhase"),
      import("./PMChecklistPhase"),
    ])
      .then(([controller, qr, morph, dots, national, checklist]) => {
        const Controller = controller.default;
        const phases = {
          QRScanPhase: qr.default,
          StateMorphPhase: morph.default,
          AssetDotsPhase: dots.default,
          NationalMapPhase: national.default,
          PMChecklistPhase: checklist.default,
        };
        return function LoadedAnimation() {
          return <Controller phases={phases} />;
        };
      })
      .catch((error) => {
        pending = undefined;
        throw error;
      });
  }
  return pending;
}
