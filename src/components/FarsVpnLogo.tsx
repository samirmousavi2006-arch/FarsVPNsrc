interface FarsVpnLogoProps {
  className?: string;
}

export function FarsVpnLogo({ className = 'w-16 h-16' }: FarsVpnLogoProps) {
  return (
    <div className={`${className} relative`}>
      <div className="absolute inset-0 bg-amethyst/30 blur-2xl rounded-full animate-glow" />
      <img
        src="/1607d58c-90c4-4eec-b8ab-b861e27555c8.png"
        alt="FarsVPN Logo"
        className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]"
      />
    </div>
  );
}
