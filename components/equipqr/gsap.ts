import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Bind the React context helper to the same GSAP instance used by every phase.
// This also avoids mixed ESM/CJS instances losing context cleanup in test runners.
gsap.registerPlugin(useGSAP);
export { gsap, useGSAP };
