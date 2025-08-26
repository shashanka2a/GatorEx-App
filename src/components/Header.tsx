import { Search, Menu, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Logo } from "./ui/Logo";

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  title?: string;
}

export function Header({ showBack = false, onBack, onMenuClick, onSearch, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        {showBack ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-0 w-8 h-8"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Logo size="md" rounded />
            <span className="text-uf-orange font-bold text-lg">GatorEx</span>
          </div>
        )}
        
        {title && (
          <h1 className="flex-1 text-center">{title}</h1>
        )}
        
        {!title && !showBack && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search items..."
              className="pl-10 bg-gray-100 border-none rounded-full"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onMenuClick}
          className="p-0 w-8 h-8"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}