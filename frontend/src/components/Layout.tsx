import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Cpu, Rocket, Link2, FlaskConical, Factory, BookOpen, Sparkles, LogOut, Search, FileText, ScrollText, Database, LayoutDashboard, Atom, Globe, Boxes, Scale, Building2 } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chips', icon: Cpu, label: 'Chips' },
  { to: '/missions', icon: Rocket, label: 'Missions' },
  { to: '/deployments', icon: Link2, label: 'Chip Deployments' },
  { to: '/tests', icon: FlaskConical, label: 'Tests' },
  { to: '/manufacturers', icon: Factory, label: 'Manufacturers' },
  { to: '/research', icon: BookOpen, label: 'Research Papers' },
];

const radNavItems = [
  { to: '/rad-test-campaigns', icon: Atom, label: 'Rad Test Campaigns' },
  { to: '/orbit-environments', icon: Globe, label: 'Orbit Environments' },
  { to: '/upscreen-lots',      icon: Boxes, label: 'COTS Upscreening' },
  { to: '/subsystem-budgets',  icon: Scale, label: 'Mass / Power Budgets' },
  { to: '/rad-hard-foundries', icon: Building2, label: 'Rad-Hard Foundries' },
];

const utilNavItems = [
  { to: '/search', icon: Search, label: 'Search & Filter' },
  { to: '/exports', icon: FileText, label: 'CSV Exports' },
  { to: '/audit', icon: ScrollText, label: 'Audit Log' },
  { to: '/sample-data', icon: Database, label: 'Sample Data' },
];

export default function Layout() {
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-900/40 border border-cyan-700/40 flex items-center justify-center">
              <Cpu size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">SpaceLab</div>
              <div className="text-xs text-gray-500">Electronics Research</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/40' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-gray-800 mt-4 space-y-1">
            <p className="px-3 pb-1 text-[10px] uppercase tracking-wider text-gray-500">Audit Deep Features</p>
            {radNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/40' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-800 mt-4">
            <NavLink
              to="/ai"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-violet-900/30 text-violet-400 border border-violet-800/40' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <Sparkles size={16} />
              AI Center
            </NavLink>
          </div>
          <div className="pt-4 border-t border-gray-800 mt-4 space-y-1">
            {utilNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/40' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 w-full transition-colors">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
