
import React from 'react';
import { useData } from '../context/DataContext';
import { UsersIcon, DocumentTextIcon, RectangleStackIcon, BanknotesIcon } from '@heroicons/react/24/solid';
import { InvoiceStatus, QuoteStatus } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { clients, quotes, invoices } = useData();

    const stats = [
        {
            name: 'Total Clients',
            stat: clients.length,
            icon: UsersIcon,
        },
        {
            name: 'Devis en Attente',
            stat: quotes.filter(q => q.status === QuoteStatus.Sent).length,
            icon: DocumentTextIcon,
        },
        {
            name: 'Factures Impayées',
            stat: invoices.filter(i => i.status === InvoiceStatus.Sent || i.status === InvoiceStatus.Overdue).length,
            icon: RectangleStackIcon,
        },
        {
            name: 'Revenu Total (Payé)',
            stat: `${invoices
                .filter(i => i.status === InvoiceStatus.Paid)
                .reduce((acc, invoice) => {
                    const total = invoice.items.reduce((itemAcc, item) => {
                        const itemTotal = item.quantity * item.unitPrice;
                        return itemAcc + itemTotal + (itemTotal * (item.tva / 100));
                    }, 0);
                    return acc + total;
                }, 0)
                .toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}`,
            icon: BanknotesIcon,
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Tableau de bord</h1>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-8 shadow sm:px-6 sm:pt-6">
                        <dt>
                            <div className="absolute rounded-md bg-cyan-500 p-3">
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Devis Récents</h2>
                    <ul className="divide-y divide-slate-200">
                        {quotes.slice(-5).reverse().map(quote => (
                             <li key={quote.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{quote.quoteNumber}</p>
                                    <p className="text-sm text-slate-500">Client: {
                                        clients.find(c=>c.id === quote.clientId) ?
                                        <Link to={`/clients/${quote.clientId}`} className="hover:text-cyan-600">{clients.find(c=>c.id === quote.clientId)?.name}</Link> :
                                        'N/A'
                                    }</p>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    quote.status === QuoteStatus.Accepted ? 'bg-green-100 text-green-800' :
                                    quote.status === QuoteStatus.Sent ? 'bg-yellow-100 text-yellow-800' :
                                    quote.status === QuoteStatus.Rejected ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {quote.status}
                                </span>
                             </li>
                        ))}
                         {quotes.length === 0 && <p className="text-center text-slate-500 py-4">Aucun devis récent.</p>}
                    </ul>
                 </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Factures Récentes</h2>
                     <ul className="divide-y divide-slate-200">
                        {invoices.slice(-5).reverse().map(invoice => (
                             <li key={invoice.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{invoice.invoiceNumber}</p>
                                    <p className="text-sm text-slate-500">Client: {
                                        clients.find(c=>c.id === invoice.clientId) ?
                                        <Link to={`/clients/${invoice.clientId}`} className="hover:text-cyan-600">{clients.find(c=>c.id === invoice.clientId)?.name}</Link> :
                                        'N/A'
                                    }</p>
                                </div>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    invoice.status === InvoiceStatus.Paid ? 'bg-green-100 text-green-800' :
                                    invoice.status === InvoiceStatus.Sent ? 'bg-yellow-100 text-yellow-800' :
                                    invoice.status === InvoiceStatus.Overdue ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {invoice.status}
                                </span>
                             </li>
                        ))}
                         {invoices.length === 0 && <p className="text-center text-slate-500 py-4">Aucune facture récente.</p>}
                    </ul>
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;
