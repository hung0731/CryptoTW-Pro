import { LiffProvider } from "@/components/LiffProvider";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { RiskToast } from "@/components/RiskToast";
import { Suspense } from "react";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LiffProvider liffId={process.env.NEXT_PUBLIC_LIFF_ID || ""}>
            <div className="w-full max-w-[480px] mx-auto min-h-screen relative shadow-2xl shadow-black bg-background overflow-x-hidden">

                <AnnouncementBanner />
                {children}
                <SiteFooter />
            </div>
            <RiskToast />
            <BottomNav />
        </LiffProvider>
    );
}
