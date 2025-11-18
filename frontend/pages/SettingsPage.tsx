
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { Users, AlertTriangle, Link, Shield, Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return (
                    <Card>
                        <h3 className="text-lg font-bold mb-4">User & Role Management</h3>
                        <table className="w-full text-sm text-left text-gray-400">
                           <thead className="text-xs text-gray-300 uppercase bg-gaia-dark">
                                <tr>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3">Role</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gaia-light">
                                    <td className="px-6 py-4">Dr. Anya Sharma</td>
                                    <td className="px-6 py-4">Administrator</td>
                                    <td className="px-6 py-4 text-green-400">Active</td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="font-medium text-gaia-accent hover:underline">Edit</a>
                                    </td>
                                </tr>
                                <tr className="border-b border-gaia-light">
                                    <td className="px-6 py-4">John Doe</td>
                                    <td className="px-6 py-4">Reviewer</td>
                                    <td className="px-6 py-4 text-green-400">Active</td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="font-medium text-gaia-accent hover:underline">Edit</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>
                );
            case 'alerts':
                 return (
                    <Card>
                        <h3 className="text-lg font-bold mb-4">Alert Threshold Configuration</h3>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="critical-confidence" className="block text-sm font-medium text-gray-300">Critical Anomaly Confidence</label>
                                <input type="range" id="critical-confidence" min="0" max="100" defaultValue="95" className="w-full" />
                                <p className="text-xs text-gray-500">Confidence threshold for an anomaly to be classified as 'Critical'. Default: 95%</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Human Review Trigger</label>
                                <select className="w-full bg-gaia-dark border border-gaia-light rounded-md p-2 mt-1">
                                    <option>Critical Only</option>
                                    <option>High and Critical</option>
                                    <option>All Anomalies</option>
                                </select>
                                <p className="text-xs text-gray-500">Automatically flag anomalies for human review based on severity.</p>
                            </div>
                        </form>
                    </Card>
                );
            case 'apis':
                return (
                    <Card>
                        <h3 className="text-lg font-bold mb-4">API Source Management</h3>
                        <p className="text-gray-400">Manage connected data sources.</p>
                        {/* API management UI would go here */}
                    </Card>
                );
            case 'security':
                return (
                    <Card>
                        <h3 className="text-lg font-bold mb-4">Privacy & Security</h3>
                        <p className="text-gray-400">Configure security settings.</p>
                         {/* Security settings UI would go here */}
                    </Card>
                );
        }
    };
    
    const TabButton: React.FC<{tabKey: string, currentTab: string, setTab: (tab: string) => void, icon: React.ElementType, label: string}> = ({tabKey, currentTab, setTab, icon: Icon, label}) => (
        <button
            onClick={() => setTab(tabKey)}
            className={`flex items-center space-x-2 p-3 rounded-md transition-colors ${currentTab === tabKey ? 'bg-gaia-accent text-white' : 'hover:bg-gaia-light'}`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="p-8">
            <PageHeader title="Platform Settings" subtitle="Manage and configure the GAIA system.">
                <Button variant="primary" icon={Save}>Save Changes</Button>
            </PageHeader>
            <div className="flex space-x-8">
                <aside className="w-1/4">
                    <nav className="space-y-2">
                        <TabButton tabKey="users" currentTab={activeTab} setTab={setActiveTab} icon={Users} label="Users & Roles" />
                        <TabButton tabKey="alerts" currentTab={activeTab} setTab={setActiveTab} icon={AlertTriangle} label="Alert Thresholds" />
                        <TabButton tabKey="apis" currentTab={activeTab} setTab={setActiveTab} icon={Link} label="API Sources" />
                        <TabButton tabKey="security" currentTab={activeTab} setTab={setActiveTab} icon={Shield} label="Security" />
                    </nav>
                </aside>
                <main className="w-3/4">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
