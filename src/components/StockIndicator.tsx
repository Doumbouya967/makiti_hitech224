import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  totalStock: number;
  threshold?: number;
  showText?: boolean;
  size?: "sm" | "md";
}

export function StockIndicator({ 
  totalStock, 
  threshold = 5, 
  showText = false,
  size = "md"
}: StockIndicatorProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  
  if (totalStock === 0) {
    return (
      <div className={cn("flex items-center gap-1", "text-destructive")}>
        <XCircle className={iconSize} />
        {showText && <span className="text-xs font-medium">Épuisé</span>}
      </div>
    );
  }
  
  if (totalStock <= threshold) {
    return (
      <div className={cn("flex items-center gap-1", "text-warning")}>
        <AlertTriangle className={iconSize} />
        {showText && <span className="text-xs font-medium">Stock faible ({totalStock})</span>}
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center gap-1", "text-success")}>
      <CheckCircle className={iconSize} />
      {showText && <span className="text-xs font-medium">En stock ({totalStock})</span>}
    </div>
  );
}

export function getStockStatus(totalStock: number, threshold = 5): "out" | "low" | "ok" {
  if (totalStock === 0) return "out";
  if (totalStock <= threshold) return "low";
  return "ok";
}
