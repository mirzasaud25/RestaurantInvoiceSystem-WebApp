import { type Item } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  onClick: (item: Item) => void;
  disabled?: boolean;
}

export function ItemCard({ item, onClick, disabled }: ItemCardProps) {
  // Generate a consistent pseudo-random hue based on item name for nice visuals
  const hue = item.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  
  return (
    <button
      onClick={() => onClick(item)}
      disabled={disabled}
      className="
        relative flex flex-col items-start justify-between
        p-4 h-32 rounded-2xl text-left overflow-hidden
        bg-card border border-border/50
        shadow-sm hover:shadow-md hover:border-primary/20
        transition-all duration-200 ease-out
        active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
        group
      "
    >
      {/* Decorative gradient blob */}
      <div 
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: `hsl(${hue}, 80%, 60%)` }}
      />
      
      <div className="z-10 w-full">
        <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2">
          {item.name}
        </h3>
      </div>
      
      <div className="z-10 mt-auto inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/5 text-primary font-medium text-sm">
        {formatCurrency(item.price)}
      </div>
    </button>
  );
}
