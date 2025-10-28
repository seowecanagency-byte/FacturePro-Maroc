
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeftIcon, BanknotesIcon, DocumentTextIcon, RectangleStackIcon } from '@heroicons/react/24/solid';
import { InvoiceStatus, QuoteStatus } from '../types';

const ClientDetail: React.FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const { clients, quotes, invoices, payments } = useData();

    const client = clients.find(c => c.id === clientId);
    const clientQuotes = quotes.filter(q => q.clientId === clientId).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
    const clientInvoices = invoices.filter(i => i.clientId === clientId).sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    if (!client) {
        return <div className="text-center p-10">Client non trouvé.</div>;
    }

    const totalBilled = clientInvoices.reduce((acc, invoice) => {
        const total = invoice.items.reduce((itemAcc, item) => {
            const itemTotal = item.quantity * item.unitPrice;
            return itemAcc + itemTotal + (itemTotal * (item.tva / 100));
        }, 0);
        return acc + total;
    }, 0);

    const totalPaid = payments
        .filter(p => clientInvoices.some(inv => inv.id === p.invoiceId))
        .reduce((sum, p) => sum + p.amount, 0);
        
    const balanceDue = totalBilled - totalPaid;

    const stats = [
        { name: 'Total Facturé', stat: totalBilled.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }), icon: RectangleStackIcon },
        { name: 'Total Payé', stat: totalPaid.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }), icon: BanknotesIcon },
        { name: 'Solde Dû', stat: balanceDue.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' }), icon: DocumentTextIcon },
    ];

    return (
        <div>
            <button onClick={() => navigate('/clients')} className="inline-flex items-center mb-6 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Retour à la liste des clients
            </button>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 mt-4 text-sm text-gray-600 gap-2">
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Téléphone:</strong> {client.phone}</p>
                    <p className="col-span-2"><strong>Adresse:</strong> {client.address}</p>
                    <p><strong>ICE:</strong> {client.ice}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                 {stats.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-6 shadow sm:px-6 sm:pt-6">
                        <dt>
                            <div className="absolute rounded-md bg-cyan-500 p-3">
                                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Devis</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Numéro</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clientQuotes.length > 0 ? clientQuotes.map(quote => {
                                    const total = quote.items.reduce((acc, item) => acc + item.quantity * item.unitPrice * (1 + item.tva / 100), 0);
                                    return (
                                        <tr key={quote.id}>
                                            <td className="px-4 py-2 font-medium">{quote.quoteNumber}</td>
                                            <td className="px-4 py-2">{new Date(quote.issueDate).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-4 py-2 text-right">{total.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    quote.status === QuoteStatus.Accepted ? 'bg-green-100 text-green-800' :
                                                    quote.status === QuoteStatus.Sent ? 'bg-yellow-100 text-yellow-800' :
                                                    quote.status === QuoteStatus.Rejected ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {quote.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">Aucun devis pour ce client.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Factures</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Numéro</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-2 text-center font-medium text-gray-500 uppercase">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clientInvoices.length > 0 ? clientInvoices.map(invoice => {
                                     const total = invoice.items.reduce((acc, item) => acc + item.quantity * item.unitPrice * (1 + item.tva / 100), 0);
                                    return (
                                        <tr key={invoice.id}>
                                            <td className="px-4 py-2 font-medium">{invoice.invoiceNumber}</td>
                                            <td className="px-4 py-2">{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</td>
                                            <td className="px-4 py-2 text-right">{total.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    invoice.status === InvoiceStatus.Paid ? 'bg-green-100 text-green-800' :
                                                    invoice.status === InvoiceStatus.PartiallyPaid ? 'bg-blue-100 text-blue-800' :
                                                    invoice.status === InvoiceStatus.Sent ? 'bg-yellow-100 text-yellow-800' :
                                                    invoice.status === InvoiceStatus.Overdue ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                     <tr><td colSpan={4} className="text-center py-6 text-gray-500">Aucune facture pour ce client.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default ClientDetail;
