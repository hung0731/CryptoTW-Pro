import { LiffProvider } from "@/components/LiffProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { RiskToast } from "@/components/RiskToast";
import { RouteHandler } from "@/components/RouteHandler";
import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
            <Suspense fallback={null}>
                <RouteHandler />
            </Suspense>
            <div className="w-full max-w-[480px] mx-auto min-h-screen relative shadow-2xl shadow-black bg-background pb-20 overflow-x-hidden">
                <AnnouncementBanner />
                {children}
            </div>
            <RiskToast />
            <BottomNav />
        </LiffProvider>
    );
}
