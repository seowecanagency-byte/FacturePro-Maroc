import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Document, Item, Quote, Invoice, QuoteStatus, InvoiceStatus, Product } from '../types';
import { PlusIcon, TrashIcon, ArrowUturnLeftIcon, CheckIcon } from '@heroicons/react/24/solid';
import DocumentView from './DocumentView';

interface DocumentEditorProps {
    doc: Document | Quote | Invoice | {};
    type: 'quote' | 'invoice';
    onCancel: () => void;
    isViewMode?: boolean;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ doc, type, onCancel, isViewMode = false }) => {
    const { clients, quotes, setQuotes, invoices, setInvoices, getNextQuoteNumber, getNextInvoiceNumber, products, companyInfo } = useData();
    const [formData, setFormData] = useState<any>(null);

    const isReadOnly = companyInfo.role === 'Comptable' && !isViewMode;

    useEffect(() => {
        if ('id' in doc) {
            setFormData(doc);
        } else {
            const newDocBase = {
                id: '', // Will be set on save
                clientId: clients.length > 0 ? clients[0].id : '',
                issueDate: new Date().toISOString().split('T')[0],
                items: [{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, tva: 20, unit: '' }],
                notes: '',
            };
            if (type === 'quote') {
                setFormData({
                    ...newDocBase,
                    quoteNumber: getNextQuoteNumber(),
                    expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                    status: QuoteStatus.Draft,
                } as Omit<Quote, 'id'>);
            } else {
                setFormData({
                    ...newDocBase,
                    invoiceNumber: getNextInvoiceNumber(),
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                    status: InvoiceStatus.Draft,
                } as Omit<Invoice, 'id'>);
            }
        }
    }, [doc, type, clients, getNextInvoiceNumber, getNextQuoteNumber]);

    if (isViewMode && formData && 'id' in formData) {
        return <DocumentView doc={formData} type={type} onBack={onCancel} />;
    }

    if (!formData) {
        return <div>Chargement...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemChange = (itemId: string, field: keyof Item, value: string | number) => {
        const newItems = formData.items.map((item: Item) => {
            if (item.id === itemId) {
                const updatedValue = typeof value === 'string' && (field === 'quantity' || field === 'unitPrice' || field === 'tva') ? parseFloat(value) || 0 : value;
                return { ...item, [field]: updatedValue };
            }
            return item;
        });
        setFormData({ ...formData, items: newItems });
    };

    const handleProductSelect = (itemId: string, productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const newItems = formData.items.map((item: Item) => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        description: product.name,
                        unitPrice: product.unitPrice,
                        tva: product.tva,
                        unit: product.unit,
                    };
                }
                return item;
            });
            setFormData({ ...formData, items: newItems });
        }
    };

    const addItem = () => {
        const newItem: Item = {
            id: Date.now().toString(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            tva: 20,
            unit: '',
        };
        setFormData({ ...formData, items: [...formData.items, newItem] });
    };

    const removeItem = (itemId: string) => {
        if (formData.items.length > 1) {
            setFormData({ ...formData, items: formData.items.filter((item: Item) => item.id !== itemId) });
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        const docToSave = { ...formData, id: formData.id || Date.now().toString() };

        if (type === 'quote') {
            const existing = quotes.find(q => q.id === docToSave.id);
            if (existing) {
                setQuotes(quotes.map(q => q.id === docToSave.id ? docToSave : q));
            } else {
                setQuotes([...quotes, docToSave]);
            }
        } else {
            const existing = invoices.find(i => i.id === docToSave.id);
            if (existing) {
                setInvoices(invoices.map(i => i.id === docToSave.id ? docToSave : i));
            } else {
                setInvoices([...invoices, docToSave]);
            }
        }
        onCancel();
    };
    
    const subTotal = formData.items.reduce((acc: number, item: Item) => acc + item.quantity * item.unitPrice, 0);
    const tvaTotal = formData.items.reduce((acc: number, item: Item) => acc + (item.quantity * item.unitPrice * (item.tva / 100)), 0);
    const total = subTotal + tvaTotal;
    const docTitle = type === 'quote' ? 'Devis' : 'Facture';
    const docNumber = type === 'quote' ? formData.quoteNumber : formData.invoiceNumber;
    
    const getStatusValues = () => {
        if (type === 'quote') {
            return Object.values(QuoteStatus).filter(s => s !== QuoteStatus.Archived);
        }
        return Object.values(InvoiceStatus);
    };
    const statusValues = getStatusValues();

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-900">{('id' in doc) ? 'Modifier' : 'Nouveau'} {docTitle} <span className="text-lg text-slate-500">{docNumber}</span></h1>
                    <div className="flex space-x-2">
                         <button type="button" onClick={onCancel} className="inline-flex items-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            <ArrowUturnLeftIcon className="h-5 w-5 mr-2" />
                            Annuler
                         </button>
                         {!isReadOnly && (
                             <button type="submit" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                                 <CheckIcon className="h-5 w-5 mr-2" />
                                 Sauvegarder
                             </button>
                         )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <fieldset disabled={isReadOnly} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className='lg:col-span-2'>
                                <label className="block text-sm font-medium text-gray-700">Client</label>
                                <select name="clientId" value={formData.clientId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                                    {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date d'émission</label>
                                <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{type === 'quote' ? "Date d'expiration" : "Date d'échéance"}</label>
                                <input type="date" name={type === 'quote' ? 'expiryDate' : 'dueDate'} value={type === 'quote' ? formData.expiryDate : formData.dueDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                            </div>
                            <div className='lg:col-span-2'>
                                <label className="block text-sm font-medium text-gray-700">Statut</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                {statusValues.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto -mx-6 px-6">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/4">Produit</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-2/5">Description</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qté</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unité</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Prix U.</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">TVA (%)</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total HT</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                    {formData.items.map((item: Item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2"><select onChange={(e) => handleProductSelect(item.id, e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm text-sm"><option value="">Sélectionner un produit</option>{products.map((p:Product) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
                                            <td className="px-3 py-2"><input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm text-sm" /></td>
                                            <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-20 rounded-md border-gray-300 shadow-sm text-sm text-right" /></td>
                                            <td className="px-3 py-2"><input type="text" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="w-20 rounded-md border-gray-300 shadow-sm text-sm" /></td>
                                            <td className="px-3 py-2"><input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)} className="w-24 rounded-md border-gray-300 shadow-sm text-sm text-right" /></td>
                                            <td className="px-3 py-2"><input type="number" value={item.tva} onChange={(e) => handleItemChange(item.id, 'tva', e.target.value)} className="w-20 rounded-md border-gray-300 shadow-sm text-sm text-right" /></td>
                                            <td className="px-3 py-2 text-right text-sm">{(item.quantity * item.unitPrice).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                            <td className="px-3 py-2 text-center"><button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button></td>
                                        </tr>
                                    ))}
                            </tbody>
                            </table>
                        </div>
                        <div className="flex justify-start">
                            <button type="button" onClick={addItem} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md shadow-sm hover:bg-slate-700">
                                <PlusIcon className="h-4 w-4 mr-2"/>
                                Ajouter une ligne
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                            </div>
                            <div className="flex justify-end items-end">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between"><span className="font-medium text-gray-600">Sous-total HT:</span><span>{subTotal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                                    <div className="flex justify-between"><span className="font-medium text-gray-600">Total TVA:</span><span>{tvaTotal.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                                    <div className="flex justify-between text-xl font-bold p-2 bg-gray-100 rounded-md"><span className="text-gray-900">Total TTC:</span><span className="text-cyan-600">{total.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</span></div>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </form>
        </div>
    );
};

export default DocumentEditor;