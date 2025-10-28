import React, { createContext, useContext, ReactNode } from 'react';
import { Client, Quote, Invoice, Product, CompanyInfo, UserRole, QuoteStatus, InvoiceStatus, Item, Payment } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialClients: Client[] = [
    { id: '1', name: 'Tech Solutions Inc.', email: 'contact@techsolutions.com', phone: '0522000001', address: '123 Main St, Casablanca', ice: '001234567000089' },
    { id: '2', name: 'Innovate SARL', email: 'contact@innovate.ma', phone: '0522000002', address: '456 Tech Park, Rabat', ice: '001234567000090' },
];

const initialProducts: Product[] = [
    { id: 'p1', name: 'Développement Site Web', description: 'Création d\'un site web vitrine responsive.', unitPrice: 15000, unit: 'Forfait', tva: 20 },
    { id: 'p2', name: 'Maintenance Mensuelle', description: 'Support technique et mises à jour.', unitPrice: 2000, unit: 'Mois', tva: 20 },
    { id: 'p3', name: 'Consulting SEO', description: 'Optimisation pour les moteurs de recherche (par heure).', unitPrice: 800, unit: 'Heure', tva: 20 },
];

const initialItems: Item[] = [
    { id: 'i1', description: 'Développement Site Web E-commerce', quantity: 1, unitPrice: 25000, tva: 20, unit: 'Forfait' },
    { id: 'i2', description: 'Hébergement Annuel', quantity: 1, unitPrice: 1500, tva: 20, unit: 'An' },
    { id: 'i3', description: 'Consulting SEO - 10 heures', quantity: 10, unitPrice: 800, tva: 20, unit: 'Heure' },
];

const initialQuotes: Quote[] = [
    {
        id: 'q1',
        quoteNumber: 'DEV-2023-001',
        clientId: '1',
        issueDate: '2023-10-15',
        expiryDate: '2023-11-15',
        items: [initialItems[0], initialItems[1]],
        status: QuoteStatus.Accepted,
        notes: 'Paiement 50% à la commande, 50% à la livraison.'
    },
];

const initialInvoices: Invoice[] = [
    {
        id: 'inv1',
        invoiceNumber: 'FAC-2023-001',
        clientId: '2',
        issueDate: '2023-10-20',
        dueDate: '2023-11-20',
        items: [initialItems[2]],
        status: InvoiceStatus.Sent,
        notes: 'Merci pour votre confiance.'
    }
];

const initialCompanyInfo: CompanyInfo = {
    name: "Votre Nom d'Entreprise",
    address: "Votre Adresse\nVotre Ville",
    phone: "0500000000",
    email: "contact@entreprise.com",
    website: "www.entreprise.com",
    logoUrl: "",
    ice: "000000000000000",
    rc: "12345",
    idf: "12345678",
    patente: "12345678",
    bankName: "Votre Banque",
    rib: "123456789012345678901234",
    role: UserRole.Entrepreneur,
};

interface DataContextProps {
    clients: Client[];
    setClients: (clients: Client[]) => void;
    quotes: Quote[];
    setQuotes: (quotes: Quote[]) => void;
    invoices: Invoice[];
    setInvoices: (invoices: Invoice[]) => void;
    products: Product[];
    setProducts: (products: Product[]) => void;
    payments: Payment[];
    setPayments: (payments: Payment[]) => void;
    companyInfo: CompanyInfo;
    setCompanyInfo: (info: CompanyInfo) => void;
    getNextQuoteNumber: () => string;
    getNextInvoiceNumber: () => string;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);
    const [quotes, setQuotes] = useLocalStorage<Quote[]>('quotes', initialQuotes);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', initialInvoices);
    const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
    const [payments, setPayments] = useLocalStorage<Payment[]>('payments', []);
    const [companyInfo, setCompanyInfo] = useLocalStorage<CompanyInfo>('companyInfo', initialCompanyInfo);

    const getNextNumber = (prefix: string, items: { quoteNumber: string }[] | { invoiceNumber: string }[]) => {
        const currentYear = new Date().getFullYear();
        const yearPrefix = `${prefix}-${currentYear}-`;
        
        const relevantItems = items.filter(item => ('quoteNumber' in item && item.quoteNumber.startsWith(yearPrefix)) || ('invoiceNumber' in item && item.invoiceNumber.startsWith(yearPrefix)));

        if (relevantItems.length === 0) {
            return `${yearPrefix}001`;
        }

        const maxNum = relevantItems.reduce((max, item) => {
            const numStr = ('quoteNumber' in item ? item.quoteNumber : item.invoiceNumber).split('-').pop();
            const num = numStr ? parseInt(numStr, 10) : 0;
            return num > max ? num : max;
        }, 0);

        return `${yearPrefix}${(maxNum + 1).toString().padStart(3, '0')}`;
    };

    const getNextQuoteNumber = () => getNextNumber('DEV', quotes);
    const getNextInvoiceNumber = () => getNextNumber('FAC', invoices);

    const value = {
        clients,
        setClients,
        quotes,
        setQuotes,
        invoices,
        setInvoices,
        products,
        setProducts,
        payments,
        setPayments,
        companyInfo,
        setCompanyInfo,
        getNextQuoteNumber,
        getNextInvoiceNumber,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};