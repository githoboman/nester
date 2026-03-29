"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface OnboardingState {
    hasSeenWelcome: boolean;
    hasConnectedWallet: boolean;
    hasCompletedTour: boolean;
    hasMadeFirstDeposit: boolean;
}

export type OnboardingStep = keyof OnboardingState;

export interface OnboardingContextValue extends OnboardingState {
    start: () => void;
    skip: () => void;
    completeStep: (step: OnboardingStep) => void;
    reset: () => void;
}

const defaultState: OnboardingState = {
    hasSeenWelcome: false,
    hasConnectedWallet: false,
    hasCompletedTour: false,
    hasMadeFirstDeposit: false,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<OnboardingState>(defaultState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("nester_onboarding");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (JSON.stringify(parsed) !== JSON.stringify(state)) {
                    const timer = setTimeout(() => { setState(parsed); }, 0);
                    return () => clearTimeout(timer);
                }
            } catch (e) {
                console.error("Failed to parse onboarding state", e);
            }
        }
        const timer = setTimeout(() => { setIsLoaded(true); }, 0);
        return () => clearTimeout(timer);
    }, [state]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("nester_onboarding", JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const start = () => {
        setState((prev) => ({ ...prev, hasSeenWelcome: false }));
    };

    const skip = () => {
        setState({
            hasSeenWelcome: true,
            hasConnectedWallet: true,
            hasCompletedTour: true,
            hasMadeFirstDeposit: true, // Assuming skip skips everything
        });
    };

    const completeStep = (step: OnboardingStep) => {
        setState((prev) => ({ ...prev, [step]: true }));
    };

    const reset = () => {
        setState(defaultState);
    };

    if (!isLoaded) return null; // Or a loading spinner if preferred, but usually fast enough

    return (
        <OnboardingContext.Provider value={{ ...state, start, skip, completeStep, reset }}>
            {children}
        </OnboardingContext.Provider>
    );
}
