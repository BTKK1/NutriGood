import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Home, BarChart2, Settings, Plus } from "lucide-react";
import ActionMenu from "./action-menu";

export default function NavBar() {
  const [location] = useLocation();
  const [showActionMenu, setShowActionMenu] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[60px] shadow-[0_-12px_20px_-6px_rgba(0,0,0,0.05),0_-8px_12px_-4px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-lg h-full">
          {/* Navigation Items */}
          <div className="flex items-center h-full px-8">
            <div className="flex gap-10 mx-auto">
              <Link href="/home">
                <button className={`flex flex-col items-center gap-0.5 ${location === '/home' ? 'text-black' : 'text-gray-400'}`}>
                  <Home className="w-6 h-6" />
                  <span className="text-[10px]">Home</span>
                </button>
              </Link>

              <Link href="/analytics">
                <button className={`flex flex-col items-center gap-0.5 ${location === '/analytics' ? 'text-black' : 'text-gray-400'}`}>
                  <BarChart2 className="w-6 h-6" />
                  <span className="text-[10px]">Analytics</span>
                </button>
              </Link>

              <Link href="/settings">
                <button className={`flex flex-col items-center gap-0.5 ${location === '/settings' ? 'text-black' : 'text-gray-400'}`}>
                  <Settings className="w-6 h-6" />
                  <span className="text-[10px]">Settings</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Plus Button - Fixed position */}
      <button 
        onClick={() => setShowActionMenu(true)}
        className="fixed bottom-[30px] right-4 w-[40px] h-[40px] bg-black text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-8 h-8" />
      </button>

      {showActionMenu && <ActionMenu onClose={() => setShowActionMenu(false)} />}
    </>
  );
}