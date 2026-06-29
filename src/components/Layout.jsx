import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Phone, BarChart3, Brain, Bot, Users, Settings, Search, Bell, ChevronDown, Menu, LogOut } from "lucide-react";
import { useAuth } from "../lib/AuthContext";

const LOGO_URL = "https://media.base44.com/images/public/6a134b6458d2e6b9f072a09d/0bb1905de_Screenshot2026-03-07at205149.png";
import { company } from "../lib/demoData";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/", label: "Overview", icon: LayoutDashboard },
  { path: "/recordings", label: "Call Recordings", icon: Phone },
  { path: "/analytics", label: "Call Analytics", icon: BarChart3 },
  { path: "/summaries", label: "AI Summaries", icon: Brain },
  // { path: "/agents", label: "Agents", icon: Bot },
  { path: "/team", label: "Team Access", icon: Users },
  { path: "/settings", label: "Account Settings", icon: Settings },

];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (item.path === '/team' && user?.role?.toLowerCase() === 'viewer') {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Gloura" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="font-heading font-semibold text-foreground text-base tracking-wide">Gloura.io</h1>
              <p className="text-[10px] text-muted-foreground">Gloura Analytics</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {filteredNavItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${active ? "bg-white/10 text-white font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-all">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 glass">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold hidden sm:block">{company.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* <img src={LOGO_URL} alt="Gloura" className="hidden md:block h-7 object-contain opacity-80" /> */}
            {/* <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search calls, summaries…" className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none w-48" />
            </div> */}
            {/* <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button> */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white">JS</div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}