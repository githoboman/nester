"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { Navbar } from "@/components/navbar";
import { DepositModal } from "@/components/vault/depositModal";
import { useWallet } from "@/components/wallet-provider";

<<<<<<< feat(integration)--build-end-to-end-test-suite-covering-frontend-→-API-→-contract-flow
export default function VaultsPage() {
    const { isConnected, isInitializing } = useWallet();
    const { positions } = usePortfolio();
    const router = useRouter();
    const [selectedVault, setSelectedVault] = useState<VaultDefinition | null>(
        null
    );

    useEffect(() => {
        if (!isInitializing && !isConnected) {
            router.push("/");
        }
    }, [isConnected, isInitializing, router]);

    const exposureByVault = useMemo(() => {
        return positions.reduce<Record<string, number>>((acc, position) => {
            acc[position.vaultId] = (acc[position.vaultId] ?? 0) + position.currentValue;
            return acc;
        }, {});
    }, [positions]);

    if (isInitializing || !isConnected) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-[1536px] px-4 pb-24 pt-20 md:px-8 md:pb-16 md:pt-28 lg:px-12 xl:px-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 md:mb-10"
                >
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <VaultIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider sm:text-xs">
                            Vaults Engine
                        </span>
                    </div>
                    <h1 className="font-heading text-2xl font-light text-foreground sm:text-3xl md:text-4xl">
                        Optimize your Yield
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Choose a vault, review lock terms and penalties, and simulate wallet signing before the live Soroban contracts are deployed.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    {vaultDefinitions.map((vault, index) => {
                        const currentExposure = exposureByVault[vault.id] ?? 0;

                        return (
                            <motion.div
                                key={vault.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all hover:border-black/15 hover:shadow-xl sm:rounded-3xl sm:p-8"
                            >
                                <div className="flex h-full flex-col">
                                    <div className="mb-5 flex items-start justify-between sm:mb-6">
                                        <div className="rounded-xl bg-secondary p-2.5 text-foreground/70 sm:rounded-2xl sm:p-3">
                                            <vault.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-medium uppercase tracking-tight text-muted-foreground sm:text-sm">
                                                target apy
                                            </p>
                                            <p className="font-heading text-2xl font-light text-emerald-600 sm:text-3xl">
                                                {vault.apyLabel}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-6 sm:mb-8">
                                        <h3 className="mb-2 font-heading text-lg font-light text-foreground sm:text-xl">
                                            {vault.name}
                                        </h3>
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {vault.description}
                                        </p>
                                    </div>

                                    <div className="mb-5 mt-auto flex flex-wrap gap-2 border-t border-border pt-5 sm:mb-6 sm:pt-6">
                                        {vault.strategies.map((strategy) => (
                                            <span
                                                key={strategy}
                                                className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium uppercase text-foreground/60"
                                            >
                                                {strategy}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Lock period</span>
                                            <span className="font-medium text-foreground">
                                                {vault.lockDays} days
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Early exit penalty</span>
                                            <span className="font-medium text-foreground">
                                                {vault.earlyWithdrawalPenaltyPct.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Your current exposure</span>
                                            <span className="font-medium text-foreground">
                                                {currentExposure.toLocaleString("en-US", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}{" "}
                                                USDC
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <div
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    vault.risk === "Low"
                                                        ? "bg-emerald-500"
                                                        : vault.risk === "Medium"
                                                          ? "bg-blue-500"
                                                          : vault.risk === "Moderate High"
                                                            ? "bg-orange-500"
                                                            : "bg-purple-500"
                                                }`}
                                            />
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {vault.risk} Risk
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedVault(vault)}
                                            className="flex min-h-[44px] items-center gap-1.5 px-1 text-sm font-medium text-foreground transition-all hover:gap-2"
                                        >
                                            Deposit <ArrowUpRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-8 rounded-2xl border border-border bg-secondary/30 p-5 sm:mt-12 sm:rounded-3xl sm:p-8"
                >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h4 className="font-heading font-medium text-foreground">
                                Auto-Rebalancing
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                The deposit flow previews yield terms while keeping the signing and submission steps mockable until contracts are live on testnet.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <h4 className="font-heading font-medium text-foreground">
                                Risk Guarded
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Maturity dates and early withdrawal penalties are surfaced before every deposit so the withdrawal flow stays transparent.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white">
                                <ArrowDown className="h-5 w-5 text-purple-600" />
                            </div>
                            <h4 className="font-heading font-medium text-foreground">
                                Flexible Liquidity
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Deposits mint nVault shares 1:1 in mock mode. Later, the same UI can switch to live Soroban contract calls without changing the user journey.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <DepositModal
                open={!!selectedVault}
                onClose={() => setSelectedVault(null)}
                vault={selectedVault}
            />
=======
import {
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDown,
  Users,
  Vault as VaultIcon,
} from "lucide-react";

import {
  formatTvl,
  type Vault as VaultType,
  type RiskTier,
} from "@/lib/mock-vaults";

import { useVaultFilters, type SortKey } from "@/hooks/use-vault-filters";


// -------------------- RISK STYLES --------------------

const RISK_STYLES: Record<RiskTier, { badge: string; dot: string }> = {
  Conservative: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Balanced: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  Growth: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  DeFi500: { badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
};


// -------------------- COMPONENTS --------------------

function RiskBadge({ tier }: { tier: RiskTier }) {
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", RISK_STYLES[tier].badge)}>
      {tier === "DeFi500" ? "DeFi500 Index" : tier}
    </span>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-2 flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
        <VaultIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground/80">
        No vaults match your filter
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Try changing the filter.
      </p>
    </motion.div>
  );
}

function VaultCard({
  vault,
  index,
  onSelect,
}: {
  vault: VaultType;
  index: number;
  onSelect: (v: VaultType) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all hover:border-black/15 hover:shadow-xl"
    >
      <div className="mb-4">
        <RiskBadge tier={vault.riskTier} />
      </div>

      <div className="mb-5">
        <h3 className="mb-1.5 text-xl font-heading font-light text-foreground">
          {vault.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {vault.description}
        </p>
      </div>

      <div className="mb-5 flex items-end gap-6">
        <div>
          <p className="mb-1 text-[11px] uppercase text-muted-foreground">APY</p>
          <p className="text-3xl font-heading text-emerald-600">
            {vault.currentApy.toFixed(1)}%
          </p>
        </div>

        <div>
          <p className="mb-1 text-[11px] uppercase text-muted-foreground">TVL</p>
          <p className="text-xl text-foreground">{formatTvl(vault.tvl)}</p>
        </div>

        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs">{vault.userCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-4 border-t border-border pt-4">
        <div className="flex flex-wrap gap-1.5">
          {vault.allocations.slice(0, 3).map((a) => (
            <span
              key={a.protocol}
              className="rounded-full bg-secondary px-2 py-0.5 text-[11px]"
            >
              {a.percentage}% {a.protocol}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        {vault.supportedAssets.map((asset) => (
          <span key={asset} className="rounded-full border px-2.5 py-1 text-xs">
            {asset}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {vault.riskTier} Risk
        </span>

        <div className="flex gap-3">
          <Link href={`/dashboard/vaults/${vault.id}`}>
            <button className="text-sm hover:text-primary">
              Details
            </button>
          </Link>

          <button
            onClick={() => onSelect(vault)}
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            Deposit <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}


// -------------------- FILTER CONFIG --------------------

const SORT_BUTTONS: { key: SortKey; label: string }[] = [
  { key: "apy", label: "APY" },
  { key: "tvl", label: "TVL" },
  { key: "risk", label: "Risk" },
];

const FILTER_BUTTONS: { key: RiskTier | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "Conservative", label: "Conservative" },
  { key: "Balanced", label: "Balanced" },
  { key: "Growth", label: "Growth" },
  { key: "DeFi500", label: "DeFi500" },
];


// -------------------- MAIN CONTENT --------------------

function VaultsPageContent({ onSelect }: { onSelect: (v: VaultType) => void }) {
  const { sortBy, filterTier, setSort, setFilter, filteredAndSorted } =
    useVaultFilters();

  return (
    <>
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap gap-2">
          {SORT_BUTTONS.map(({ key, label }) => (
            <button key={key} onClick={() => setSort(key)}>
              {label}
            </button>
          ))}
>>>>>>> main
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_BUTTONS.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {filteredAndSorted.length === 0 ? (
          <EmptyState />
        ) : (
          filteredAndSorted.map((v, i) => (
            <VaultCard key={v.id} vault={v} index={i} onSelect={onSelect} />
          ))
        )}
      </div>
    </>
  );
}


// -------------------- PAGE --------------------

export default function VaultsPage() {
  const { isConnected } = useWallet();
  const router = useRouter();

  const [selectedVault, setSelectedVault] = useState<VaultType | null>(null);

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-16">
        <h1 className="mb-6 text-3xl font-light">Vaults</h1>

        <Suspense>
          <VaultsPageContent onSelect={setSelectedVault} />
        </Suspense>
      </main>

      <DepositModal
        open={!!selectedVault}
        onClose={() => setSelectedVault(null)}
        vault={selectedVault}
      />
    </div>
  );
}