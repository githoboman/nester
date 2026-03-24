"use client";

import { useWallet } from "@/components/wallet-provider";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Vault,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  ArrowDown,
  Users,
} from "lucide-react";
import {
  VAULTS,
  formatTvl,
  type Vault as VaultType,
  type RiskTier,
} from "@/lib/mock-vaults";

type SortKey = "apy" | "tvl" | "risk";

const RISK_ORDER: Record<RiskTier, number> = {
  Conservative: 0,
  Balanced: 1,
  Growth: 2,
  DeFi500: 3,
};

const RISK_STYLES: Record<RiskTier, { badge: string; dot: string }> = {
  Conservative: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  Balanced: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  Growth: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  DeFi500: { badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
};

function RiskBadge({ tier }: { tier: RiskTier }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        RISK_STYLES[tier].badge
      )}
    >
      {tier === "DeFi500" ? "DeFi500 Index" : tier}
    </span>
  );
}

function VaultCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-6 w-28 rounded-full bg-secondary" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-6 w-44 rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-3/4 rounded bg-secondary" />
      </div>
      <div className="flex gap-6 pt-2">
        <div>
          <div className="h-3 w-20 rounded bg-secondary mb-2" />
          <div className="h-9 w-20 rounded bg-secondary" />
        </div>
        <div>
          <div className="h-3 w-12 rounded bg-secondary mb-2" />
          <div className="h-7 w-20 rounded bg-secondary" />
        </div>
      </div>
      <div className="h-px w-full bg-border" />
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-full bg-secondary" />
        <div className="h-5 w-20 rounded-full bg-secondary" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-secondary" />
        <div className="h-6 w-16 rounded-full bg-secondary" />
      </div>
    </div>
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
        <Vault className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground/80">No vaults match your filter</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Try changing the risk tier filter.
      </p>
    </motion.div>
  );
}

function VaultCard({ vault, index }: { vault: VaultType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 transition-all hover:border-black/15 hover:shadow-xl flex flex-col"
    >
      {/* Risk Badge */}
      <div className="mb-4">
        <RiskBadge tier={vault.riskTier} />
      </div>

      {/* Name + Description */}
      <div className="mb-5">
        <h3 className="font-heading text-xl font-light text-foreground mb-1.5">
          {vault.name}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {vault.description}
        </p>
      </div>

      {/* APY + TVL */}
      <div className="flex items-end gap-6 mb-5">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Current APY
          </p>
          <p className="text-3xl font-heading font-light text-emerald-600">
            {vault.currentApy.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
            TVL
          </p>
          <p className="text-xl font-heading font-light text-foreground">
            {formatTvl(vault.tvl)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span className="text-xs">{vault.userCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Allocation Tags */}
      <div className="border-t border-border pt-4 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {vault.allocations.slice(0, 3).map((a) => (
            <span
              key={a.protocol}
              className="px-2 py-0.5 rounded-full bg-secondary text-[11px] font-medium text-foreground/70"
            >
              {a.percentage}% {a.protocol}
            </span>
          ))}
        </div>
      </div>

      {/* Supported Assets */}
      <div className="flex gap-2 mb-5">
        {vault.supportedAssets.map((asset) => (
          <span
            key={asset}
            className="px-2.5 py-1 rounded-full border border-border text-xs font-medium text-foreground/70"
          >
            {asset}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              RISK_STYLES[vault.riskTier].dot
            )}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {vault.riskTier === "DeFi500" ? "Dynamic" : vault.riskTier} Risk
          </span>
        </div>
        <Link href={`/dashboard/vaults/${vault.id}`}>
          <button className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:gap-2.5 transition-all group-hover:text-primary">
            View Details <ArrowUpRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function VaultsPage() {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("apy");
  const [filterTier, setFilterTier] = useState<RiskTier | "all">("all");

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filteredAndSorted = useMemo(() => {
    const vaults =
      filterTier === "all" ? VAULTS : VAULTS.filter((v) => v.riskTier === filterTier);
    return [...vaults].sort((a, b) => {
      if (sortBy === "apy") return b.currentApy - a.currentApy;
      if (sortBy === "tvl") return b.tvl - a.tvl;
      if (sortBy === "risk") return RISK_ORDER[a.riskTier] - RISK_ORDER[b.riskTier];
      return 0;
    });
  }, [filterTier, sortBy]);

  if (!isConnected) return null;

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: "apy", label: "APY" },
    { key: "tvl", label: "TVL" },
    { key: "risk", label: "Risk" },
  ];

  const filterButtons: { key: RiskTier | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Conservative", label: "Conservative" },
    { key: "Balanced", label: "Balanced" },
    { key: "Growth", label: "Growth" },
    { key: "DeFi500", label: "DeFi500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1536px] px-4 md:px-8 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Vault className="h-4 w-4" />
            <span className="text-xs font-mono font-medium uppercase tracking-wider">
              Vaults Engine
            </span>
          </div>
          <h1 className="font-heading text-3xl font-light text-foreground sm:text-4xl">
            Optimize your Yield
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Select a vault strategy that matches your risk profile. Our automated engine
            rebalances your position across Stellar and DeFi protocols 24/7.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 space-y-3"
        >
          {/* Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Sort by</span>
            {sortButtons.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  sortBy === key
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground/60 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Filter</span>
            {filterButtons.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterTier(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filterTier === key
                    ? "bg-foreground text-background"
                    : "bg-secondary text-foreground/60 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Vault Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <VaultCardSkeleton key={i} />)
          ) : filteredAndSorted.length === 0 ? (
            <EmptyState />
          ) : (
            filteredAndSorted.map((vault, i) => (
              <VaultCard key={vault.id} vault={vault} index={i} />
            ))
          )}
        </div>

        {/* Info Section */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 rounded-3xl bg-secondary/30 border border-border p-8"
          >
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-border">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h4 className="font-heading font-medium text-foreground">
                  Auto-Rebalancing
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our contracts monitor APY fluctuations every block and re-allocate
                  liquidity to the highest yielding sources.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-border">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-heading font-medium text-foreground">Risk Guarded</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We prioritize safety by only integrating with protocols that have
                  undergone multiple audits and have at least $50M TVL.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-border">
                  <ArrowDown className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-heading font-medium text-foreground">
                  Flexible Liquidity
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Receive{" "}
                  <span className="font-mono text-primary">nVault</span> tokens
                  representing your share. While liquidity is instant, some vaults may
                  have time-locked multipliers with early exit fees.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
