
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Map, Settings, FileText, Info, HelpCircle, AlertTriangle, UploadCloud, Bot, UserCheck, Search, ListChecks, Network, Bell, Shield } from 'lucide-react';

const Sidebar: React.FC = () => {
    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Command Dashboard' },
        { path: '/upload', icon: UploadCloud, label: 'Upload Evidence' },
        { path: '/operations', icon: Network, label: 'Operations Console' },
        { path: '/alerts', icon: Bell, label: 'Alerts & Delivery' },
        { path: '/analytics', icon: Map, label: 'Global Analytics' },
        { path: '/verification/anom-001', icon: Shield, label: 'Verification' },
        { path: '/incident/anom-001', icon: AlertTriangle, label: 'Incident Details' },
        { path: '/audit/ANOM-001', icon: FileText, label: 'Audit Viewer' },
        { path: '/settings', icon: Settings, label: 'Settings' },
        { path: '/about', icon: Info, label: 'About GAIA 3.1' },
    ];

    const activeLinkClass = "bg-gaia-accent text-white";
    const inactiveLinkClass = "text-gray-400 hover:bg-gaia-light hover:text-white";

    return (
        <aside className="w-64 bg-gaia-med flex-shrink-0 p-4 flex flex-col justify-between">
            <div>
                <div className="flex items-center space-x-2 mb-8 p-2">
                    <svg className="w-8 h-8 text-gaia-accent" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93L15 8h-2V4.07zM15 10h2l.87 2.07c.18.42.28.87.31 1.34H15v-3.41zM14 14.59c0 .59-.44 1.2-1 1.4v.01c-.56-.2-1-.81-1-1.4V12h2v2.59zM19.93 11c-.13-1.03-.45-2-.93-2.87L18 10h-2v2h3.41c.09-.31.15-.63.17-.96.02-.17.02-.33.02-.5.0-.17-.01-.33-.03-.49z"/>
                    </svg>
                    <h1 className="text-xl font-bold text-white">GAIA</h1>
                </div>

                <nav className="space-y-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `flex items-center space-x-3 p-2 rounded-md transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="p-2 bg-gaia-dark rounded-lg">
                <h3 className="text-sm font-semibold text-white">System Status</h3>
                <div className="flex items-center space-x-2 mt-2 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs">All Systems Operational</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
