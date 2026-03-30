"use client";

import { useWallet } from "@/components/wallet-provider";
import { ConnectWallet } from "@/components/connect-wallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function Home() {
<<<<<<< feat(integration)--build-end-to-end-test-suite-covering-frontend-→-API-→-contract-flow
    const { isConnected, isInitializing } = useWallet();
    const router = useRouter();

    useEffect(() => {
        if (!isInitializing && isConnected) {
            router.push("/dashboard");
        }
    }, [isConnected, isInitializing, router]);

    if (isInitializing || isConnected) return null;
=======
    const { isConnected } = useWallet();
    const { hasConnectedWallet } = useOnboarding();
    const router = useRouter();

    useEffect(() => {
        if (isConnected && hasConnectedWallet) {
            router.push("/dashboard");
        }
    }, [isConnected, hasConnectedWallet, router]);

    if (isConnected && hasConnectedWallet) return null;
>>>>>>> main

    return (
        <>
            <ConnectWallet />
            <WelcomeModal />
        </>
    );
}
