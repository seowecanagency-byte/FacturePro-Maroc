
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    DocumentTextIcon,
    RectangleStackIcon,
    Cog6ToothIcon,
    CubeIcon,
} from '@heroicons/react/24/solid';
import { useData } from '../context/DataContext';

const navigation = [
    { name: 'Tableau de bord', href: '/', icon: ChartBarIcon },
    { name: 'Clients', href: '/clients', icon: UsersIcon },
    { name: 'Devis', href: '/quotes', icon: DocumentTextIcon },
    { name: 'Factures', href: '/invoices', icon: RectangleStackIcon },
    { name: 'Produits', href: '/products', icon: CubeIcon },
];

const Sidebar: React.FC = () => {
    const { companyInfo } = useData();

    return (
        <div className="flex flex-col w-64 bg-slate-800 text-slate-100">
            <div className="flex items-center justify-center h-20 border-b border-slate-700 px-4">
                <h1 className="text-2xl font-bold text-white truncate">{companyInfo.name}</h1>
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <nav className="flex-1 px-2 py-4 space-y-2">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end={item.href === '/'}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                                    isActive
                                        ? 'bg-slate-900 text-white'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`
                            }
                        >
                            <item.icon
                                className="mr-3 h-6 w-6 flex-shrink-0"
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="px-2 py-4">
                     <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-md group ${
                                isActive
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`
                        }
                    >
                        <Cog6ToothIcon
                            className="mr-3 h-6 w-6 flex-shrink-0"
                            aria-hidden="true"
                        />
                        Paramètres
                    </NavLink>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
