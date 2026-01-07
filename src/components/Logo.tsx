import logoImage from "@/assets/memodeck-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeMap = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
  xl: "h-24",
};

export const Logo = ({ size = "md", showText = false }: LogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoImage} 
        alt="MemoDeck" 
        className={`${sizeMap[size]} w-auto object-contain`}
      />
      {showText && (
        <span className="font-display font-bold text-foreground text-xl">
          MemoDeck
        </span>
      )}
    </div>
  );
};
