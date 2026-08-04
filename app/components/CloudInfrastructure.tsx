import {
  Activity,
  Cloud,
  KeyRound,
  Laptop,
  LockKeyhole,
  Network,
} from "lucide-react";
import Reveal from "./Reveal";
import BookDemo from "./BookDemo";
import { CLOUD_PRINCIPLES, CLOUD_PROVIDERS } from "./cloudArchitecture";

const PRINCIPLE_ICONS = {
  execution: Laptop,
  identity: KeyRound,
  network: Network,
  audit: Activity,
} as const;

export default function CloudInfrastructure() {
  return (
    <section id="cloud" className="scroll-mt-20 border-y border-[--color-line] bg-[--color-panel]/35 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="kicker mb-3">// enterprise cloud</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Cloud workflows, governed by your cloud.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[--color-muted] sm:text-base">
            Termi works with the AWS and Google Cloud tooling your team already governs. It runs
            cloud workflows from your Mac while your organization keeps control of
            identity, secrets, network policy, and audit logs.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch">
          <Reveal>
            <div className="h-full border border-[--color-line-2] bg-[--color-ink]/70 p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[--color-line] pb-4">
                <div>
                  <p className="font-mono text-[11px] uppercase text-[--color-faint]">Deployment pattern</p>
                  <h3 className="mt-1 text-lg font-semibold">Governed cloud access</h3>
                </div>
                <LockKeyhole className="h-5 w-5 text-[--color-coral]" aria-hidden="true" />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_72px_1.25fr] sm:items-center">
                <div className="border border-[--color-line-2] bg-[--color-panel] p-4">
                  <p className="font-mono text-[10px] uppercase text-[--color-faint]">Coordination</p>
                  <p className="mt-2 font-semibold">Termi on your Mac</p>
                  <p className="mt-1 text-xs leading-relaxed text-[--color-muted]">Plans and runs cloud workflows through your tools</p>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 text-[--color-faint] sm:flex-col">
                  <span className="h-px w-8 bg-[--color-coral]/70 sm:h-8 sm:w-px" />
                  <span className="whitespace-nowrap font-mono text-[9px] uppercase">Existing auth</span>
                  <span className="h-px w-8 bg-[--color-coral]/70 sm:h-8 sm:w-px" />
                </div>

                <div className="border border-[--color-coral]/45 bg-[--color-coral]/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase text-[--color-coral]">Your cloud boundary</p>
                    <Cloud className="h-4 w-4 text-[--color-coral]" aria-hidden="true" />
                  </div>
                  <p className="mt-2 font-semibold">AWS + Google Cloud</p>
                  <p className="mt-1 text-xs leading-relaxed text-[--color-muted]">Reached through installed CLIs and SDKs</p>
                  <div className="mt-4 grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] uppercase text-[--color-faint]">
                    <span className="border border-[--color-line] px-2 py-2">Identity</span>
                    <span className="border border-[--color-line] px-2 py-2">Secrets</span>
                    <span className="border border-[--color-line] px-2 py-2">APIs</span>
                  </div>
                </div>
              </div>

              <p className="mt-6 border-t border-[--color-line] pt-4 text-xs leading-relaxed text-[--color-faint]">
                Termi does not host your code or ask you to paste cloud access keys. Enterprise
                setup uses the cloud tooling and controls already managed by your team.
              </p>
            </div>
          </Reveal>

          <Reveal variant="stagger" className="divide-y divide-[--color-line] border-y border-[--color-line]">
            {CLOUD_PRINCIPLES.map((principle) => {
              const Icon = PRINCIPLE_ICONS[principle.id];
              return (
                <div key={principle.id} className="grid grid-cols-[36px_1fr] gap-4 py-5">
                  <span className="grid h-9 w-9 place-items-center border border-[--color-line-2] text-[--color-coral]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{principle.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[--color-muted]">{principle.body}</p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>

        <Reveal variant="stagger" className="mt-8 grid gap-px overflow-hidden border border-[--color-line-2] bg-[--color-line-2] md:grid-cols-2">
          {CLOUD_PROVIDERS.map((provider) => (
            <article key={provider.name} className="bg-[--color-panel] p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase text-[--color-faint]">Cloud target</p>
                  <h3 className="mt-1 text-xl font-semibold">{provider.name}</h3>
                </div>
                <span className="border border-[--color-line-2] px-2.5 py-1 font-mono text-[10px] text-[--color-muted]">{provider.scope}</span>
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div><dt className="font-mono text-[10px] uppercase text-[--color-faint]">Tooling</dt><dd className="mt-1 leading-relaxed text-[--color-muted]">{provider.tooling}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase text-[--color-faint]">Identity</dt><dd className="mt-1 leading-relaxed text-[--color-muted]">{provider.identity}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase text-[--color-faint]">Secrets</dt><dd className="mt-1 leading-relaxed text-[--color-muted]">{provider.secrets}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase text-[--color-faint]">Key management</dt><dd className="mt-1 leading-relaxed text-[--color-muted]">{provider.keys}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase text-[--color-faint]">Audit events</dt><dd className="mt-1 leading-relaxed text-[--color-muted]">{provider.audit}</dd></div>
                <div><dt className="font-mono text-[10px] uppercase text-[--color-faint]">Log operations</dt><dd className="mt-1 leading-relaxed text-[--color-muted]">{provider.logs}</dd></div>
              </dl>
            </article>
          ))}
        </Reveal>

        <Reveal className="mt-8 flex flex-col items-start justify-between gap-5 border-t border-[--color-line] pt-7 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">Design the deployment around your controls.</p>
            <p className="mt-1 text-sm text-[--color-muted]">We’ll map Termi to your accounts, identity model, network boundaries, and audit requirements.</p>
          </div>
          <BookDemo label="Discuss cloud deployment" variant="primary" />
        </Reveal>
      </div>
    </section>
  );
}
