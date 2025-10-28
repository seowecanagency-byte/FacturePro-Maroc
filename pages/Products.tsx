import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Product, UserRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const ProductForm: React.FC<{ product?: Product; onSave: (product: Product) => void; onCancel: () => void; }> = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id'>>(product || { name: '', description: '', unitPrice: 0, unit: '', tva: 20 });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) || 0 : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || Date.now().toString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">{product ? "Modifier le Produit" : "Ajouter un Produit"}</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prix Unitaire (HT)</label>
                    <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Unité (ex: jour, h, pièce)</label>
                    <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">TVA (%)</label>
                <input type="number" name="tva" value={formData.tva} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">Sauvegarder</button>
            </div>
        </form>
    );
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

const Products: React.FC = () => {
    const { products, setProducts, companyInfo } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    
    const isReadOnly = companyInfo.role === UserRole.Comptable;

    const handleSave = (product: Product) => {
        if (isReadOnly) return;
        if (editingProduct) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([...products, product]);
        }
        setIsModalOpen(false);
        setEditingProduct(undefined);
    };
    
    const handleDelete = (id: string) => {
        if (isReadOnly) return;
        if(window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Produits & Services</h1>
                {!isReadOnly && (
                    <button onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Ajouter un produit
                    </button>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix U.</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-sm truncate">{product.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unitPrice.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.tva}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {!isReadOnly && (
                                            <>
                                                <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} className="text-cyan-600 hover:text-cyan-900 p-1"><PencilIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1"><TrashIcon className="h-5 w-5"/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-500">Aucun produit trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingProduct(undefined); }} />
            </Modal>
        </div>
    );
};

export default Products;