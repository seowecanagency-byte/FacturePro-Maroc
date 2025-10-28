// FIX: Removed self-import of 'Client' which caused a declaration conflict.
export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    ice: string;
}

export interface Item {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tva: number;
    unit: string;
}

export enum QuoteStatus {
    Draft = 'Brouillon',
    Sent = 'Envoyé',
    Accepted = 'Accepté',
    Rejected = 'Rejeté',
    Archived = 'Archivé',
}

export interface Quote {
    id: string;
    quoteNumber: string;
    clientId: string;
    issueDate: string;
    expiryDate: string;
    items: Item[];
    status: QuoteStatus;
    notes?: string;
}

export enum InvoiceStatus {
    Draft = 'Brouillon',
    Sent = 'Envoyé',
    PartiallyPaid = 'Partiellement payé',
    Paid = 'Payé',
    Overdue = 'En retard',
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    quoteId?: string;
    clientId: string;
    issueDate: string;
    dueDate: string;
    items: Item[];
    status: InvoiceStatus;
    notes?: string;
}

export type Document = Quote | Invoice;

export interface Product {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    unit: string;
    tva: number;
}

export enum PaymentMethod {
    Virement = 'Virement bancaire',
    Cheque = 'Chèque',
    Especes = 'Espèces',
    Carte = 'Carte de crédit',
    Autre = 'Autre',
}

export interface Payment {
    id: string;
    invoiceId: string;
    date: string;
    amount: number;
    method: PaymentMethod;
}


export enum UserRole {
    Administrator = 'Administrateur',
    Commercial = 'Commercial',
    Comptable = 'Comptable',
    Entrepreneur = 'Entrepreneur',
}

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logoUrl: string;
    ice: string;
    rc: string;
    idf: string;
    patente: string;
    bankName: string;
    rib: string;
    role: UserRole;
}