"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@/components/wallet-provider";
import { truncateAddress, cn } from "@/lib/utils";
import {
    LogOut,
    Copy,
    Check,
    ChevronDown,
    LayoutDashboard,
    Vault,
    ArrowDownUp,
    Settings,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Vaults", href: "/dashboard/vaults", icon: Vault },
    { label: "Settlements", href: "/dashboard/settlements", icon: ArrowDownUp },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { address, isConnected, disconnect } = useWallet();
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close wallet dropdown on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handleClick = () => setShowMenu(false);
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [showMenu]);

    useEffect(() => {
        const html = document.documentElement;
        if (showMobileMenu) {
            html.classList.add("menu-open");
        } else {
            html.classList.remove("menu-open");
        }
        return () => html.classList.remove("menu-open");
    }, [showMobileMenu]);

    // Close mobile menu on Escape key for keyboard-only users
    useEffect(() => {
        if (!showMobileMenu) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowMobileMenu(false);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showMobileMenu]);

    const copyAddress = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <>
            {/* ── Top Navbar ── */}
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                    isScrolled
                        ? "bg-white/80 backdrop-blur-md border-border py-3"
                        : "bg-transparent border-transparent py-4"
                )}
            >
                <div className="mx-auto max-w-[1536px] px-4 md:px-8 lg:px-12 xl:px-16">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <Image
                                src="/logo.png"
                                alt="Nester"
                                width={36}
                                height={36}
                                className="rounded-xl"
                            />
                            <span className="font-heading text-[15px] font-medium text-foreground">
                                Nester
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        {isConnected && (
                            <div className="hidden md:flex items-center gap-8">
                                {NAV_ITEMS.slice(0, 3).map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "text-[15px] font-medium transition-colors relative py-2",
                                            pathname === item.href
                                                ? "text-foreground"
                                                : "text-foreground/50 hover:text-foreground/80"
                                        )}
                                    >
                                        {item.label}
                                        {pathname === item.href && (
                                            <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-foreground/80" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Right side: wallet + mobile hamburger */}
                        <div className="flex items-center gap-2">
                            {isConnected && address ? (
                                <>
                                    {/* Wallet Dropdown (desktop) */}
                                    <div
                                        className="relative hidden md:block"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => setShowMenu(!showMenu)}
                                            className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 transition-all hover:border-black/20 hover:shadow-sm min-h-[44px]"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                            <span className="text-sm font-medium text-foreground font-mono">
                                                {truncateAddress(address, 5)}
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    "h-3.5 w-3.5 text-muted-foreground transition-transform",
                                                    showMenu && "rotate-180"
                                                )}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {showMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-xl shadow-black/[0.08]"
                                                >
                                                    <div className="px-3 py-2 mb-1">
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Connected Wallet
                                                        </p>
                                                        <p className="text-sm font-mono text-foreground/70 break-all">
                                                            {truncateAddress(address, 10)}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={copyAddress}
                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
                                                    >
                                                        {copied ? (
                                                            <Check className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                        {copied ? "Copied!" : "Copy Address"}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            disconnect();
                                                            setShowMenu(false);
                                                        }}
                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors min-h-[44px]"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Disconnect
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Mobile: compact wallet badge */}
                                    <div className="flex md:hidden items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 min-h-[44px]">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                        <span className="text-xs font-mono text-foreground/70">
                                            {truncateAddress(address, 4)}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <Link href="/">
                                    <div className="p-[2px] rounded-full border border-black/15">
                                        <button className="rounded-full bg-brand-dark hover:bg-brand-dark/90 px-5 py-2 text-sm font-medium text-white transition-all min-h-[44px]">
                                            Connect Wallet
                                        </button>
                                    </div>
                                </Link>
                            )}

                            {/* Hamburger (mobile, only when connected) */}
                            {isConnected && (
                                <button
                                    onClick={() => setShowMobileMenu(true)}
                                    className="md:hidden flex flex-col items-center justify-center gap-[5px] h-11 w-11 rounded-xl border border-border bg-white transition-colors hover:bg-secondary"
                                    aria-label="Open menu"
                                >
                                    <span className="h-[1.5px] w-5 bg-foreground/70 rounded-full" />
                                    <span className="h-[1.5px] w-5 bg-foreground/70 rounded-full" />
                                    <span className="h-[1.5px] w-3.5 bg-foreground/70 rounded-full self-start ml-[5px]" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Mobile Full-Screen Menu ── */}
            <AnimatePresence>
                {showMobileMenu && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowMobileMenu(false)}
                        />

                        {/* Slide-in panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                            className="fixed top-0 right-0 bottom-0 z-[70] w-[min(320px,90vw)] bg-white shadow-2xl flex flex-col"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                                <div className="flex items-center gap-2.5">
                                    <Image src="/logo.png" alt="Nester" width={30} height={30} className="rounded-lg" />
                                    <span className="font-heading text-sm font-medium text-foreground">Nester</span>
                                </div>
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="h-10 w-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Wallet status */}
                            {isConnected && address && (
                                <div className="px-6 py-4 border-b border-border bg-secondary/30">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                                        Connected Wallet
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                            <span className="text-sm font-mono text-foreground/80 break-all">
                                                {truncateAddress(address, 8)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={copyAddress}
                                            className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-white transition-colors shrink-0"
                                        >
                                            {copied ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Nav links */}
                            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                                {NAV_ITEMS.map((item, i) => (
                                    <motion.div
                                        key={item.href}
                                        initial={{ opacity: 0, x: 16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.25, delay: 0.05 + i * 0.04 }}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setShowMobileMenu(false)}
                                            className={cn(
                                                "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all min-h-[52px]",
                                                pathname === item.href
                                                    ? "bg-foreground text-background"
                                                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-[18px] w-[18px] shrink-0" />
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            {/* Disconnect */}
                            <div className="px-4 py-4 border-t border-border">
                                <button
                                    onClick={() => {
                                        disconnect();
                                        setShowMobileMenu(false);
                                        router.push("/");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-destructive hover:bg-destructive/10 transition-colors min-h-[52px]"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Disconnect Wallet
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Bottom Tab Bar*/}
            {isConnected && (
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-border safe-area-pb">
                    <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
                        {NAV_ITEMS.slice(0, 4).map((item) => {
                            const active = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex flex-col items-center gap-1 px-3 py-1 min-h-[44px] min-w-[44px] justify-center"
                                >
                                    <div
                                        className={cn(
                                            "flex items-center justify-center rounded-xl transition-all",
                                            active
                                                ? "bg-foreground text-background w-10 h-7"
                                                : "text-muted-foreground w-10 h-7"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-medium transition-colors",
                                            active ? "text-foreground" : "text-muted-foreground/60"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}