import { Link, useLocation } from "wouter";
import { Home, BarChart2, Settings, Plus } from "lucide-react";

export default function NavBar() {
  const [location] = useLocation();

  if (location === "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <Link href="/home">
          <a className="flex flex-col items-center gap-1">
            <Home
              className={
                location === "/home" ? "text-primary" : "text-muted-foreground"
              }
            />
            <span className="text-xs">Home</span>
          </a>
        </Link>
        <Link href="/analytics">
          <a className="flex flex-col items-center gap-1">
            <BarChart2 className="text-muted-foreground" />
            <span className="text-xs">Analytics</span>
          </a>
        </Link>
        <button className="flex flex-col items-center gap-1">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center -mt-8">
            <Plus className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="text-xs">Add</span>
        </button>
        <Link href="/settings">
          <a className="flex flex-col items-center gap-1">
            <Settings className="text-muted-foreground" />
            <span className="text-xs">Settings</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
