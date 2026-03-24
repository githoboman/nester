"use client";

import { useWallet } from "@/components/wallet-provider";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Vault,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";

type TooltipNameType = number | string;
import {
  getVaultById,
  formatTvl,
  type Vault as VaultType,
  type VaultAllocation,
  type RiskTier,
} from "@/lib/mock-vaults";

type ApyTab = "7d" | "30d" | "90d";
const APY_TAB_DAYS: Record<ApyTab, number> = { "7d": 7, "30d": 30, "90d": 90 };

const RISK_STYLES: Record<RiskTier, { badge: string; dot: string }> = {
  Conservative: {
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  Balanced: { badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  Growth: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  DeFi500: { badge: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
};

function RiskBadge({ tier }: { tier: RiskTier }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        RISK_STYLES[tier].badge,
      )}
    >
      {tier === "DeFi500" ? "DeFi500 Index" : tier}
    </span>
  );
}

function ApyTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<TooltipValueType, TooltipNameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-white p-2.5 shadow-sm text-xs">
      <p className="text-muted-foreground mb-0.5">{label as string}</p>
      <p className="font-medium text-foreground">
        {(payload[0].value as number)?.toFixed(2)}% APY
      </p>
    </div>
  );
}

function AllocationTooltip({
  active,
  payload,
}: TooltipContentProps<TooltipValueType, TooltipNameType>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as VaultAllocation;
  return (
    <div className="rounded-xl border border-border bg-white p-2.5 shadow-sm text-xs">
      <p className="font-medium text-foreground">{d.protocol}</p>
      <p className="text-muted-foreground">{d.percentage}% allocation</p>
      <p className="text-muted-foreground">{d.apy.toFixed(1)}% APY</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-384 px-4 md:px-8 lg:px-12 xl:px-16 pt-28 pb-16">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Vault className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-2xl font-light text-foreground mb-2">
            Vault not found
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            The vault you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/dashboard/vaults">
            <button className="flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-medium hover:border-black/20 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Vaults
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function VaultDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const [apyTab, setApyTab] = useState<ApyTab>("30d");
  const { id } = useParams();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected) return null;

  const vault: VaultType | undefined = getVaultById(id?.toString() ?? "");

  if (!vault) return <NotFound />;

  const apySlice = vault.apyHistory.slice(-APY_TAB_DAYS[apyTab]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-384 px-4 md:px-8 lg:px-12 xl:px-16 pt-28 pb-16">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/dashboard/vaults"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            All Vaults
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8"
        >
          <div className="mb-3">
            <RiskBadge tier={vault.riskTier} />
          </div>
          <h1 className="font-heading text-3xl font-light text-foreground sm:text-4xl">
            {vault.name}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {vault.description}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm text-foreground/70">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Target APY:{" "}
              <span className="font-medium text-emerald-600">
                {vault.apyRange}
              </span>
            </span>
          </div>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left Column — Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* APY History Chart */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-lg font-light text-foreground">
                  APY History
                </h2>
                <div className="flex gap-1">
                  {(["7d", "30d", "90d"] as ApyTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setApyTab(tab)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        apyTab === tab
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={apySlice}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    width={40}
                  />
                  <Tooltip
                    content={ApyTooltip}
                    cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="apy"
                    stroke="#2EBAC6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#2EBAC6", strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation Breakdown */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="font-heading text-lg font-light text-foreground mb-6">
                Allocation Breakdown
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={vault.allocations}
                    dataKey="percentage"
                    nameKey="protocol"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={vault.allocations.length > 1 ? 3 : 0}
                    strokeWidth={0}
                  >
                    {vault.allocations.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={AllocationTooltip} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="mt-4 space-y-0 divide-y divide-border">
                {vault.allocations.map((a) => (
                  <div
                    key={a.protocol}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: a.color }}
                      />
                      <span className="text-sm text-foreground">
                        {a.protocol}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">
                        {a.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {a.apy.toFixed(1)}% APY
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column — Metrics & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  APY
                </p>
                <p className="text-xl font-heading font-light text-emerald-600">
                  {vault.currentApy.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  TVL
                </p>
                <p className="text-xl font-heading font-light text-foreground">
                  {formatTvl(vault.tvl)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  Users
                </p>
                <p className="text-xl font-heading font-light text-foreground">
                  {vault.userCount >= 1000
                    ? `${(vault.userCount / 1000).toFixed(1)}k`
                    : vault.userCount}
                </p>
              </div>
            </div>

            {/* Supported Assets */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="font-heading text-sm font-medium text-foreground mb-3">
                Supported Assets
              </p>
              <div className="flex gap-2">
                {vault.supportedAssets.map((asset) => (
                  <span
                    key={asset}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm font-medium text-foreground"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: "#2EBAC6" }}
                    />
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="font-heading text-sm font-medium text-foreground mb-3">
                Terms
              </p>
              <div className="divide-y divide-border">
                <div className="flex items-start justify-between py-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    Maturity
                  </div>
                  <span className="text-xs font-medium text-foreground text-right max-w-[60%]">
                    {vault.maturityTerms}
                  </span>
                </div>
                <div className="flex items-start justify-between py-2.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Early Exit
                  </div>
                  <span className="text-xs font-medium text-foreground text-right max-w-[60%]">
                    {vault.earlyWithdrawalPenalty}
                  </span>
                </div>
              </div>
            </div>

            {/* User Position */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-heading text-sm font-medium text-foreground">
                  Your Position
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {[
                  { label: "Amount Deposited", icon: WalletIcon },
                  { label: "Yield Earned", icon: TrendingUp },
                  { label: "Share of Vault", icon: Users },
                ].map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                    <span className="text-sm font-medium text-foreground/30">
                      —
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit CTA */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <button
                disabled
                className="w-full rounded-xl bg-foreground text-background py-4 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Deposit into {vault.name}
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-2.5">
                Deposit flow coming soon —{" "}
                <span className="font-mono text-foreground/40">#30</span>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
