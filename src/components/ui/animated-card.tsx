import { ReactNode } from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const AnimatedCard = ({ 
  children, 
  className, 
  hover = true, 
  glow = false 
}: AnimatedCardProps) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        hover && "hover:scale-105 hover:shadow-elevated",
        glow && "animated-border glow-primary",
        className
      )}
    >
      {children}
    </Card>
  );
};