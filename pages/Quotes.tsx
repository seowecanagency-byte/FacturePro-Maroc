import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Quote, QuoteStatus, UserRole, InvoiceStatus } from '../types';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon, DocumentDuplicateIcon, ArchiveBoxIcon } from '@heroicons/react/24/solid';
import DocumentEditor from '../components/DocumentEditor';

const Quotes: React.FC = () => {
    const { quotes, setQuotes, clients, invoices, setInvoices, getNextInvoiceNumber, companyInfo } = useData();
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [expiryFilter, setExpiryFilter] = useState('all');

    const isReadOnly = companyInfo.role === UserRole.Comptable;
    
    const getExpiryInfo = (expiryDate: string, status: QuoteStatus) => {
        if (![QuoteStatus.Draft, QuoteStatus.Sent].includes(status)) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);

        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: 'Expiré', color: 'red', isUrgent: true };
        }
        if (diffDays <= 7) {
            return { text: 'Expire bientôt', color: 'yellow', isUrgent: true };
        }
        return null;
    };


    const handleDelete = (id: string) => {
        if (isReadOnly) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
            setQuotes(quotes.filter(q => q.id !== id));
        }
    };
    
    const handleConvertToInvoice = (quote: Quote) => {
        if (isReadOnly) return;
        const newInvoice = {
            id: Date.now().toString(),
            invoiceNumber: getNextInvoiceNumber(),
            quoteId: quote.id,
            clientId: quote.clientId,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
            items: quote.items,
            status: InvoiceStatus.Draft,
            notes: quote.notes,
        };
        setInvoices([...invoices, newInvoice]);
        // Optionally, update quote status
        const updatedQuote = { ...quote, status: QuoteStatus.Accepted };
        setQuotes(quotes.map(q => q.id === quote.id ? updatedQuote : q));
        alert('Devis converti en facture !');
    };

    const handleArchive = (id: string) => {
        if (isReadOnly) return;
        setQuotes(quotes.map(q => q.id === id ? { ...q, status: QuoteStatus.Archived } : q));
    };

    if (editingQuote) {
        return <DocumentEditor doc={editingQuote} type="quote" onCancel={() => setEditingQuote(null)} />;
    }
    if(viewingQuote){
        return <DocumentEditor doc={viewingQuote} type="quote" onCancel={() => setViewingQuote(null)} isViewMode={true} />;
    }

    const handleCreateNew = () => {
         if (isReadOnly) return;
         setEditingQuote({} as Quote);
    };
    
    const displayedQuotes = quotes
        .filter(q => showArchived || q.status !== QuoteStatus.Archived)
        .filter(q => {
            if (expiryFilter === 'all') {
                return true;
            }
            const expiryInfo = getExpiryInfo(q.expiryDate, q.status);
            return expiryInfo?.isUrgent;
        })
        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-slate-900">Devis</h1>
                {!isReadOnly && (
                    <button onClick={handleCreateNew} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nouveau Devis
                    </button>
                )}
            </div>
            <div className="flex justify-end items-center space-x-4 mb-6">
                 <div>
                    <label htmlFor="expiryFilter" className="block text-sm font-medium text-gray-700">Filtrer</label>
                    <select
                        id="expiryFilter"
                        name="expiryFilter"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                        value={expiryFilter}
                        onChange={(e) => setExpiryFilter(e.target.value)}
                    >
                        <option value="all">Tous</option>
                        <option value="expiring">Expire Bientôt / Expiré</option>
                    </select>
                </div>
                <div className="pt-6">
                     <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="rounded border-gray-300 text-cyan-600 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50"/>
                        <span>Afficher les archivés</span>
                    </label>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total HT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedQuotes.map((quote) => {
                                const total = quote.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
                                const client = clients.find(c => c.id === quote.clientId);
                                const expiryInfo = getExpiryInfo(quote.expiryDate, quote.status);
                                return (
                                    <tr key={quote.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{quote.quoteNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{client?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(quote.issueDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{total.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    quote.status === QuoteStatus.Accepted ? 'bg-green-100 text-green-800' :
                                                    quote.status === QuoteStatus.Sent ? 'bg-yellow-100 text-yellow-800' :
                                                    quote.status === QuoteStatus.Rejected ? 'bg-red-100 text-red-800' :
                                                    quote.status === QuoteStatus.Archived ? 'bg-slate-100 text-slate-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {quote.status}
                                                </span>
                                                {expiryInfo && (
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        expiryInfo.color === 'red' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {expiryInfo.text}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                            <button onClick={() => setViewingQuote(quote)} title="Voir" className="text-blue-600 hover:text-blue-900 p-1"><EyeIcon className="h-5 w-5"/></button>
                                            {!isReadOnly && (
                                                <>
                                                    <button onClick={() => handleConvertToInvoice(quote)} title="Convertir en facture" className="text-green-600 hover:text-green-900 p-1 disabled:text-gray-300" disabled={quote.status !== QuoteStatus.Accepted}>
                                                        <DocumentDuplicateIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button onClick={() => setEditingQuote(quote)} title="Modifier" className="text-cyan-600 hover:text-cyan-900 p-1"><PencilIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleArchive(quote.id)} title="Archiver" className="text-gray-500 hover:text-gray-800 p-1 disabled:text-gray-300" disabled={![QuoteStatus.Accepted, QuoteStatus.Rejected].includes(quote.status)}>
                                                        <ArchiveBoxIcon className="h-5 w-5"/>
                                                    </button>
                                                    <button onClick={() => handleDelete(quote.id)} title="Supprimer" className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="h-5 w-5"/></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {displayedQuotes.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Aucun devis trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Quotes;