import { GalaxyBackground } from "@/components/GalaxyBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <GalaxyBackground />
      {children}
    </div>
  );
}
