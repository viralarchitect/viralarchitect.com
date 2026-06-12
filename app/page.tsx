import { BootOverlay } from "@/components/BootOverlay";
import { ConsoleNav } from "@/components/ConsoleNav";
import { ConsoleFooter } from "@/components/ConsoleFooter";
import { OpsTicker } from "@/components/OpsTicker";
import { Initialize } from "@/components/sections/Initialize";
import { Deployments } from "@/components/sections/Deployments";
import { Comms } from "@/components/sections/Comms";
import { Specs } from "@/components/sections/Specs";
import { Uplink } from "@/components/sections/Uplink";

export default function Home() {
  return (
    <>
      <noscript>
        <style>{`.boot-overlay{display:none}`}</style>
      </noscript>
      <div className="bg-grid" aria-hidden="true" />
      <BootOverlay />
      <ConsoleNav />
      <main>
        <Initialize />
        <Deployments />
        <Comms />
        <Specs />
        <Uplink />
      </main>
      <ConsoleFooter />
      <OpsTicker />
    </>
  );
}
