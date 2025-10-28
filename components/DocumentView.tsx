import React from 'react';
import { useData } from '../context/DataContext';
import { Document, Quote, Invoice, Payment } from '../types';
import { PrinterIcon } from '@heroicons/react/24/solid';

interface DocumentViewProps {
    doc: Document;
    type: 'quote' | 'invoice';
    onBack: () => void;
}

const DocumentView: React.FC<DocumentViewProps> = ({ doc, type, onBack }) => {
    const { companyInfo, clients, payments } = useData();
    const client = clients.find(c => c.id === doc.clientId);
    const docPayments = payments.filter(p => p.invoiceId === doc.id);

    const subTotal = doc.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const tvaTotal = doc.items.reduce((acc, item) => acc + item.quantity * item.unitPrice * (item.tva / 100), 0);
    const total = subTotal + tvaTotal;
    const totalPaid = docPayments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = total - totalPaid;

    const docTitle = type === 'quote' ? 'DEVIS' : 'FACTURE';
    const docNumber = type === 'quote' ? (doc as Quote).quoteNumber : (doc as Invoice).invoiceNumber;
    const expiryOrDueDateLabel = type === 'quote' ? "Date d'expiration" : "Date d'échéance";
    const expiryOrDueDate = type === 'quote' ? (doc as Quote).expiryDate : (doc as Invoice).dueDate;

    return (
        <div>
            <div className="mb-6 flex justify-between items-center no-print">
                <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                    Retour
                </button>
                <button onClick={() => window.print()} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Imprimer / PDF
                </button>
            </div>
            
            <div className="bg-white p-8 md:p-12 shadow-lg print-view">
                 <header className="flex justify-between items-start pb-8 border-b-2 border-gray-100">
                    <div className="w-1/2">
                        {companyInfo.logoUrl && <img src={companyInfo.logoUrl} alt="logo" className="h-16 mb-4"/>}
                        <h2 className="text-xl font-bold text-gray-800">{companyInfo.name}</h2>
                        <p className="text-sm text-gray-500 whitespace-pre-line">{companyInfo.address}</p>
                    </div>
                    <div className="w-1/2 text-right">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 uppercase">{docTitle}</h1>
                        <p className="text-gray-500 mt-2">{docNumber}</p>
                    </div>
                 </header>

                 <section className="grid grid-cols-2 gap-8 my-8">
                     <div>
                         <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Facturé à</h3>
                         <p className="font-bold text-gray-800">{client?.name}</p>
                         <p className="text-sm text-gray-500 whitespace-pre-line">{client?.address}</p>
                         <p className="text-sm text-gray-500">{client?.email}</p>
                         {client?.ice && <p className="text-sm text-gray-500">ICE: {client.ice}</p>}
                     </div>
                     <div className="text-right">
                         <div className="grid grid-cols-2">
                             <span className="font-semibold text-gray-600">Date d'émission:</span>
                             <span>{new Date(doc.issueDate).toLocaleDateString('fr-FR')}</span>
                             <span className="font-semibold text-gray-600">{expiryOrDueDateLabel}:</span>
                             <span>{new Date(expiryOrDueDate).toLocaleDateString('fr-FR')}</span>
                         </div>
                     </div>
                 </section>

                 <section>
                     <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-2 text-left text-sm font-semibold text-gray-600 uppercase w-1/2">Description</th>
                                    <th className="py-2 text-right text-sm font-semibold text-gray-600 uppercase">Qté</th>
                                    <th className="py-2 text-right text-sm font-semibold text-gray-600 uppercase">Unité</th>
                                    <th className="py-2 text-right text-sm font-semibold text-gray-600 uppercase">Prix U.</th>
                                    <th className="py-2 text-right text-sm font-semibold text-gray-600 uppercase">TVA</th>
                                    <th className="py-2 text-right text-sm font-semibold text-gray-600 uppercase">Total HT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doc.items.map(item => (
                                    <tr key={item.id} className="border-b border-gray-100">
                                        <td className="py-3 pr-2">{item.description}</td>
                                        <td className="py-3 px-2 text-right">{item.quantity}</td>
                                        <td className="py-3 px-2 text-right">{item.unit}</td>
                                        <td className="py-3 px-2 text-right">{item.unitPrice.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                        <td className="py-3 px-2 text-right">{item.tva}%</td>
                                        <td className="py-3 pl-2 text-right">{(item.quantity * item.unitPrice).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                 </section>
                
                 <section className="mt-8 flex justify-between items-start">
                    {docPayments.length > 0 && (
                        <div className="w-1/2">
                             <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Historique des Paiements</h3>
                             <table className="text-sm w-full max-w-xs">
                                <tbody>
                                    {docPayments.map((p: Payment) => (
                                        <tr key={p.id}>
                                            <td className="py-1">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                                            <td className="py-1">{p.method}</td>
                                            <td className="py-1 text-right">{p.amount.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    )}
                     <div className="w-full max-w-xs space-y-2 ml-auto">
                         <div className="flex justify-between"><span className="font-medium text-gray-600">Sous-total HT:</span><span>{subTotal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                         <div className="flex justify-between"><span className="font-medium text-gray-600">Total TVA:</span><span>{tvaTotal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                         <div className="flex justify-between text-lg font-bold"><span className="text-gray-900">Total TTC:</span><span>{total.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                         {type === 'invoice' && (
                             <>
                                <div className="flex justify-between border-t pt-2"><span className="font-medium text-gray-600">Total Payé:</span><span>{totalPaid.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                                <div className="flex justify-between text-xl font-bold p-2 bg-gray-100 rounded-md"><span className="text-gray-900">Solde Dû:</span><span className="text-cyan-600">{balanceDue.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                             </>
                         )}
                     </div>
                 </section>

                {doc.notes && (
                    <section className="mt-8">
                         <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Notes</h3>
                         <p className="text-sm text-gray-600 whitespace-pre-line">{doc.notes}</p>
                    </section>
                )}

                 <footer className="mt-12 pt-6 border-t-2 border-gray-100 text-center text-xs text-gray-500">
                    <div>
                        <p><strong>{companyInfo.name}</strong></p>
                        <p>{`RC: ${companyInfo.rc} - Patente: ${companyInfo.patente} - IF: ${companyInfo.idf} - ICE: ${companyInfo.ice}`}</p>
                        <p>{`Email: ${companyInfo.email} - Tél: ${companyInfo.phone}`}</p>
                        {type === 'invoice' && (
                             <div className="mt-2">
                                <p className="font-bold">Informations Bancaires:</p>
                                <p>{`Banque: ${companyInfo.bankName} - RIB: ${companyInfo.rib}`}</p>
                            </div>
                        )}
                        <p className="mt-4">Merci pour votre confiance.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DocumentView;