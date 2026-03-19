"use client";

import { useWallet } from "@/components/wallet-provider";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { truncateAddress } from "@/lib/utils";
import {
    TrendingUp,
    Vault,
    ArrowDownToLine,
    Sparkles,
    ArrowUpRight,
} from "lucide-react";

const stats = [
    {
        label: "Total Balance",
        value: "$0.00",
        change: null,
        icon: Vault,
    },
    {
        label: "Total Yield Earned",
        value: "$0.00",
        change: "+0.00%",
        icon: TrendingUp,
    },
    {
        label: "Active Vaults",
        value: "0",
        change: null,
        icon: ArrowDownToLine,
    },
    {
        label: "Prometheus Insights",
        value: "—",
        change: null,
        icon: Sparkles,
    },
];

export default function Dashboard() {
    const { isConnected, address } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (!isConnected) {
            router.push("/");
        }
    }, [isConnected, router]);

    if (!isConnected) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto max-w-[1536px] px-4 md:px-8 lg:px-12 xl:px-16 pt-28 pb-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <h1 className="font-heading text-2xl font-light text-foreground sm:text-3xl">
                        Welcome back
                    </h1>
                    <p className="mt-1 text-muted-foreground font-mono text-sm">
                        {address ? truncateAddress(address, 8) : ""}
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.1 + i * 0.08,
                            }}
                            className="group rounded-2xl border border-border bg-white p-5 transition-all hover:border-black/15 hover:shadow-sm"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
                                    <stat.icon className="h-4 w-4 text-foreground/50" />
                                </div>
                                {stat.change && (
                                    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                                        <ArrowUpRight className="h-3 w-3" />
                                        {stat.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-heading font-light text-foreground">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Panels */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Vaults Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="rounded-2xl border border-border bg-white p-6"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-heading text-lg font-light text-foreground">
                                Your Vaults
                            </h2>
                            <button className="text-xs font-medium text-foreground/60 hover:text-foreground transition-colors">
                                Create Vault
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                                <Vault className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground/80">
                                No vaults yet
                            </p>
                            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                                Create your first vault to start earning
                                optimized yield across DeFi protocols.
                            </p>
                            <div className="mt-5 p-[3px] rounded-full border border-black/15 shadow-lg bg-white inline-block">
                                <button className="rounded-full bg-gradient-to-r from-[#0a0a0a] to-[#1a1a2e] border border-white/10 hover:from-[#1a1a2e] hover:to-[#0a0a0a] px-6 py-2 text-sm font-medium text-white transition-all">
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Prometheus Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="rounded-2xl border border-border bg-white p-6"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-heading text-lg font-light text-foreground">
                                <span className="font-display italic">Prometheus</span>{" "}
                                Insights
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs text-muted-foreground">
                                    AI Advisory
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground/80">
                                No insights available
                            </p>
                            <p className="mt-1 max-w-xs text-xs text-muted-foreground leading-relaxed">
                                Connect a vault to receive AI-driven
                                recommendations on yield optimization and risk
                                management.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="mt-6 rounded-2xl border border-border bg-white p-6"
                >
                    <h2 className="mb-4 font-heading text-lg font-light text-foreground">
                        Recent Activity
                    </h2>
                    <div className="flex items-center justify-center py-10">
                        <p className="text-sm text-muted-foreground">
                            No recent transactions
                        </p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
