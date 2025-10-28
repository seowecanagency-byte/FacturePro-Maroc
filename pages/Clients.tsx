
import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Client, UserRole } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const ClientForm: React.FC<{ client?: Client; onSave: (client: Client) => void; onCancel: () => void; }> = ({ client, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Client>(client || { id: '', name: '', email: '', phone: '', address: '', ice: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">{client ? "Modifier le Client" : "Ajouter un Client"}</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" required/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Adresse</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">ICE</label>
                <input type="text" name="ice" value={formData.ice} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm" />
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

const Clients: React.FC = () => {
    const { clients, setClients, companyInfo } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const isReadOnly = companyInfo.role === UserRole.Comptable;

    const handleSave = (client: Client) => {
        if (isReadOnly) return;
        if (editingClient) {
            setClients(clients.map(c => c.id === client.id ? client : c));
        } else {
            setClients([...clients, { ...client, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
        setEditingClient(undefined);
    };
    
    const handleDelete = (id: string) => {
        if (isReadOnly) return;
        if(window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv') {
            alert('Veuillez sélectionner un fichier CSV.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            parseCSV(text);
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    };

    const parseCSV = (text: string) => {
        try {
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                alert("Le fichier CSV est vide ou ne contient pas de données.");
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['name', 'email', 'phone', 'address', 'ice'];
            
            const headerMap = requiredHeaders.reduce((acc, h) => {
                const index = headers.indexOf(h);
                if (index === -1) throw new Error(`En-tête manquant : ${h}. Les en-têtes requis sont : name, email, phone, address, ice.`);
                acc[h] = index;
                return acc;
            }, {} as Record<string, number>);

            const newClients: Client[] = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const data = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(d => d.replace(/"/g, '').trim()) || [];
                
                const name = data[headerMap.name];
                const email = data[headerMap.email];

                if (!name || !email) {
                    console.warn(`Ligne ${i + 1} ignorée : le nom et l'email sont requis.`);
                    continue;
                }

                newClients.push({
                    id: `${Date.now()}-${i}`,
                    name,
                    email,
                    phone: data[headerMap.phone] || '',
                    address: data[headerMap.address] || '',
                    ice: data[headerMap.ice] || '',
                });
            }

            if (newClients.length > 0) {
                const existingEmails = new Set(clients.map(c => c.email));
                const uniqueNewClients = newClients.filter(nc => !existingEmails.has(nc.email));
                
                setClients([...clients, ...uniqueNewClients]);
                alert(`${uniqueNewClients.length} client(s) importé(s) avec succès ! ${newClients.length - uniqueNewClients.length} doublon(s) ignoré(s).`);
            } else {
                 alert("Aucun nouveau client à importer trouvé dans le fichier.");
            }
        } catch (error: any) {
            console.error("Erreur lors de l'analyse du CSV :", error);
            alert(`Erreur lors de l'importation : ${error.message}`);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
                {!isReadOnly && (
                    <div className="flex space-x-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".csv"
                        />
                        <button onClick={handleImportClick} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md shadow-sm hover:bg-slate-700">
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            Importer CSV
                        </button>
                        <button onClick={() => { setEditingClient(undefined); setIsModalOpen(true); }} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-md shadow-sm hover:bg-cyan-700">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Ajouter un client
                        </button>
                    </div>
                )}
            </div>
            <div className="mb-4">
                 <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-1 block w-full md:w-1/2 lg:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                />
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICE</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClients.map((client) => (
                                <tr key={client.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <Link to={`/clients/${client.id}`} className="hover:text-cyan-600">{client.name}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.ice}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Link to={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-900 p-1" title="Voir les détails">
                                            <EyeIcon className="h-5 w-5"/>
                                        </Link>
                                        {!isReadOnly && (
                                            <>
                                                <button onClick={() => { setEditingClient(client); setIsModalOpen(true); }} className="text-cyan-600 hover:text-cyan-900 p-1" title="Modifier"><PencilIcon className="h-5 w-5"/></button>
                                                <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900 p-1" title="Supprimer"><TrashIcon className="h-5 w-5"/></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredClients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        {searchTerm ? 'Aucun client ne correspond à votre recherche.' : 'Aucun client trouvé.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <ClientForm client={editingClient} onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingClient(undefined); }} />
            </Modal>
        </div>
    );
};

export default Clients;
