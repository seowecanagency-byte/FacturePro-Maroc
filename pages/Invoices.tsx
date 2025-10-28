import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Invoice, InvoiceStatus, UserRole, Payment, PaymentMethod } from '../types';
import { EyeIcon, PencilIcon, TrashIcon, PlusIcon, BanknotesIcon } from '@heroicons/react/24/solid';
import DocumentEditor from '../components/DocumentEditor';

const PaymentForm: React.FC<{ 
    invoice: Invoice; 
    totalPaid: number;
    onSave: (payment: Omit<Payment, 'id'>) => void; 
    onCancel: () => void; 
}> = ({ invoice, totalPaid, onSave, onCancel }) => {
    const invoiceTotal = invoice.items.reduce((acc, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        return acc + itemTotal + (itemTotal * (item.tva / 100));
    }, 0);
    const remainingBalance = invoiceTotal - totalPaid;

    const [amount, setAmount] = useState(remainingBalance);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState(PaymentMethod.Virement);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            invoiceId: invoice.id,
            amount,
            date,
            method,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Ajouter un Paiement pour la Facture {invoice.invoiceNumber}</h2>
            <div className="p-4 bg-gray-100 rounded-md">
                <div className="flex justify-between"><span>Total Facture:</span> <span className="font-semibold">{invoiceTotal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                <div className="flex justify-between"><span>Déjà Payé:</span> <span className="font-semibold">{totalPaid.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                <div className="flex justify-between text-blue-600"><span>Solde Restant:</span> <span className="font-semibold">{remainingBalance.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Montant</label>
                <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} max={remainingBalance} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Date de paiement</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" required/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Mode de paiement</label>
                <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm">
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">Enregistrer Paiement</button>
            </div>
        </form>
    )
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                {children}
            </div>
        </div>
    );
};

const Invoices: React.FC = () => {
    const { invoices, setInvoices, clients, payments, setPayments, companyInfo } = useData();
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

    const isReadOnly = companyInfo.role === UserRole.Comptable;

    const handleDelete = (id: string) => {
        if (isReadOnly) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ? Cela supprimera aussi les paiements associés.")) {
            setInvoices(invoices.filter(i => i.id !== id));
            setPayments(payments.filter(p => p.invoiceId !== id));
        }
    };

    const handleSavePayment = (paymentData: Omit<Payment, 'id'>) => {
        if(isReadOnly) return;
        
        const newPayment: Payment = { ...paymentData, id: Date.now().toString() };
        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);

        const targetInvoice = invoices.find(inv => inv.id === paymentData.invoiceId);
        if(!targetInvoice) return;

        const totalPaid = updatedPayments
            .filter(p => p.invoiceId === paymentData.invoiceId)
            .reduce((sum, p) => sum + p.amount, 0);

        const invoiceTotal = targetInvoice.items.reduce((acc, item) => {
            const itemTotal = item.quantity * item.unitPrice;
            return acc + itemTotal + (itemTotal * (item.tva / 100));
        }, 0);

        let newStatus = targetInvoice.status;
        if (totalPaid >= invoiceTotal) {
            newStatus = InvoiceStatus.Paid;
        } else if (totalPaid > 0) {
            newStatus = InvoiceStatus.PartiallyPaid;
        } else {
            newStatus = InvoiceStatus.Sent;
        }
        
        setInvoices(invoices.map(i => i.id === paymentData.invoiceId ? { ...i, status: newStatus } : i));
        setPaymentInvoice(null);
    };

    if (editingInvoice) {
        return <DocumentEditor doc={editingInvoice} type="invoice" onCancel={() => setEditingInvoice(null)} />;
    }
    if (viewingInvoice) {
        return <DocumentEditor doc={viewingInvoice} type="invoice" onCancel={() => setViewingInvoice(null)} isViewMode={true} />;
    }
    
    const handleCreateNew = () => {
        if (isReadOnly) return;
        setEditingInvoice({} as Invoice);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Factures</h1>
                {!isReadOnly && (
                    <button onClick={handleCreateNew} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nouvelle Facture
                    </button>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total / Payé</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => {
                                const total = invoice.items.reduce((acc, item) => {
                                    const itemTotal = item.quantity * item.unitPrice;
                                    return acc + itemTotal + (itemTotal * (item.tva / 100));
                                }, 0);
                                const totalPaid = payments
                                    .filter(p => p.invoiceId === invoice.id)
                                    .reduce((sum, p) => sum + p.amount, 0);

                                const client = clients.find(c => c.id === invoice.clientId);
                                return (
                                    <tr key={invoice.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{client?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div>{total.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</div>
                                            <div className="text-xs text-green-600">{totalPaid.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                            <button onClick={() => setViewingInvoice(invoice)} title="Voir" className="text-blue-600 hover:text-blue-900 p-1"><EyeIcon className="h-5 w-5"/></button>
                                            {!isReadOnly && (
                                                <>
                                                    {invoice.status !== InvoiceStatus.Paid && (
                                                        <button onClick={() => setPaymentInvoice(invoice)} title="Ajouter un paiement" className="text-green-600 hover:text-green-900 p-1"><BanknotesIcon className="h-5 w-5"/></button>
                                                    )}
                                                    <button onClick={() => setEditingInvoice(invoice)} title="Modifier" className="text-cyan-600 hover:text-cyan-900 p-1"><PencilIcon className="h-5 w-5"/></button>
                                                    <button onClick={() => handleDelete(invoice.id)} title="Supprimer" className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="h-5 w-5"/></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                             {invoices.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Aucune facture trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={!!paymentInvoice} onClose={() => setPaymentInvoice(null)}>
                {paymentInvoice && (
                    <PaymentForm 
                        invoice={paymentInvoice}
                        totalPaid={payments.filter(p => p.invoiceId === paymentInvoice.id).reduce((sum, p) => sum + p.amount, 0)}
                        onSave={handleSavePayment} 
                        onCancel={() => setPaymentInvoice(null)} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default Invoices;