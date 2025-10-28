
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { UserRole } from '../types';

// FIX: Explicitly type permissionsMap to ensure type safety and resolve TS error.
const permissionsMap: Record<UserRole, string> = {
    [UserRole.Administrator]: `Accès complet à toutes les fonctionnalités :
- Paramétrage global de l'application
- Gestion des utilisateurs et des droits d'accès
- Sauvegardes et maintenance`,
    [UserRole.Commercial]: `Accès axé sur la gestion des ventes :
- Création et suivi des devis
- Conversion des devis en factures
- Gestion des relances clients
- Ne peut pas modifier les paramètres globaux de l'entreprise`,
    [UserRole.Comptable]: `Accès en consultation pour la gestion financière :
- Consultation des factures et des paiements
- Export des données vers des outils comptables
- Accès en lecture seule, ne peut pas créer ou modifier de documents`,
    [UserRole.Entrepreneur]: `Interface simplifiée pour une gestion complète :
- Accès à toutes les fonctionnalités (devis, factures, clients)
- Consultation des rapports et du tableau de bord
- Export de documents en PDF
- Gestion des paramètres de l'entreprise`
};

const Settings: React.FC = () => {
    const { companyInfo, setCompanyInfo } = useData();
    const [formData, setFormData] = useState(companyInfo);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCompanyInfo(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Paramètres</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Informations de l'entreprise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Site Web</label>
                        <input type="text" name="website" value={formData.website} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">URL du Logo</label>
                        <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                </div>

                <hr/>
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Informations Légales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">ICE</label>
                        <input type="text" name="ice" value={formData.ice} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">RC</label>
                        <input type="text" name="rc" value={formData.rc} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Identifiant Fiscal</label>
                        <input type="text" name="idf" value={formData.idf} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patente</label>
                        <input type="text" name="patente" value={formData.patente} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                </div>

                <hr/>
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Informations Bancaires</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de la banque</label>
                        <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">RIB (24 chiffres)</label>
                        <input type="text" name="rib" value={formData.rib} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"/>
                    </div>
                 </div>
                 
                <hr/>
                <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Rôle et Permissions</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mon Rôle</label>
                         <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                             {Object.values(UserRole).map(role => (
                                 <option key={role} value={role}>{role}</option>
                             ))}
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">Description des permissions</label>
                         <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600 whitespace-pre-line h-full min-h-[100px]">
                            {permissionsMap[formData.role]}
                         </div>
                    </div>
                 </div>

                <div className="flex justify-end items-center pt-4">
                    {saved && <span className="text-green-600 mr-4">Enregistré !</span>}
                    <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                        Sauvegarder les Paramètres
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
