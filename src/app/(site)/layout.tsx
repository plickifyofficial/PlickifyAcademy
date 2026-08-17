import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AosProvider } from "@/components/ui/aos-provider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <AosProvider>
        <div className="flex flex-1 flex-col">{children}</div>
      </AosProvider>
      <Footer />
    </>
  );
}
