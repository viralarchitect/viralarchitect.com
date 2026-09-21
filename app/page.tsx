import { ConsoleNav } from "@/components/ConsoleNav";
import { ConsoleFooter } from "@/components/ConsoleFooter";
import { Initialize } from "@/components/sections/Initialize";
import { Hardware } from "@/components/sections/Hardware";
import { Deployments } from "@/components/sections/Deployments";
import { Specs } from "@/components/sections/Specs";
import { Uplink } from "@/components/sections/Uplink";
import { Reliability } from "@/components/sections/Reliability";
import { Automation } from "@/components/sections/Automation";

export default function Home() {
  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <ConsoleNav />
      <main id="main-content" tabIndex={-1}>
        <Initialize />
        <Reliability />
        <Automation />
        <Deployments />
        <Specs />
        <Uplink />
        <Hardware />
      </main>
      <ConsoleFooter />
    </>
  );
}
