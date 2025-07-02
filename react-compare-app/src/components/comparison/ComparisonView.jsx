import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Square, Search, Edit, Edit3, X, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ItemFormModal from './ItemFormModal';
import { getTemplateItems, addTemplateItem, updateTemplateItem } from '../../services/templates';
import FavoriteButton from '../ui/FavoriteButton';
import ViewCount from '../ui/ViewCount';
import { timeAgo } from '../../utils/time';

const ComparisonView = ({ comparison, onUpdate, onBack, onEditTemplate }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState([]); // Items from Firestore
    const templateId = comparison.id || comparison.templateId;

    useEffect(() => {
        if (templateId) {
            getTemplateItems(templateId)
                .then(fetchedItems => setItems(fetchedItems))
                .catch(err => {
                    setItems([]);
                    console.error('Failed to fetch template items:', err);
                });
        }
    }, [templateId]);

    const handleToggleItem = (itemId) => {
        setSelectedItemIds(prevSelected =>
            prevSelected.includes(itemId)
                ? prevSelected.filter(id => id !== itemId)
                : [...prevSelected, itemId]
        );
    };

    const handleItemUpdate = async (updatedItem) => {
        try {
            await updateTemplateItem(templateId, updatedItem.id, updatedItem);
            const fetchedItems = await getTemplateItems(templateId);
            setItems(fetchedItems);
            setItemToEdit(null); // Close the edit modal
            // Optionally update comparison.items if needed
            onUpdate({ ...comparison, items: fetchedItems });
        } catch (error) {
            alert('Failed to update item: ' + error.message);
        }
    };
    
    const handleAddItem = async (newItemData) => {
        try {
            await addTemplateItem(templateId, newItemData);
            const fetchedItems = await getTemplateItems(templateId);
            setItems(fetchedItems);
            // Select the newly added item
            if (fetchedItems.length > 0) {
                setSelectedItemIds(prev => [...prev, fetchedItems[fetchedItems.length - 1].id]);
            }
            setIsAddModalOpen(false);
            onUpdate({ ...comparison, items: fetchedItems });
        } catch (error) {
            alert('Failed to add item: ' + error.message);
        }
    };
    
    const itemsToDisplay = items.filter(item => selectedItemIds.includes(item.id));
    
    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
             <button onClick={onBack} className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                Back to All Comparisons
            </button>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
                <img src={comparison.imageUrl || 'https://placehold.co/1200x400/a5b4fc/ffffff?text=Comparison'} alt={comparison.title} className="w-full h-48 md:h-64 object-cover"/>
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900">{comparison.title}</h1>
                            <p className="text-lg text-slate-600 mt-2">{comparison.description}</p>
                            <div className="flex items-center gap-6 mt-4 text-slate-500 text-base">
                                <FavoriteButton templateId={comparison.id || comparison.templateId} favorites={comparison.favorites} />
                                <ViewCount templateId={comparison.id || comparison.templateId} views={comparison.views} incrementOnMount={true} />
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span className="ml-1">Updated {timeAgo(comparison.lastUpdated)}</span>
                                </div>
                            </div>
                        </div>
                        {/* Creator info on the right */}
                        {comparison.creator && (
                            <div className="flex items-center mt-6 md:mt-0 md:ml-8">
                                <img
                                    src={comparison.creator.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comparison.creator.displayName || 'User') + '&background=6366f1&color=fff&size=64'}
                                    alt={comparison.creator.displayName || 'User'}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                                />
                                <div className="ml-3">
                                    <div className="font-semibold text-slate-800">{comparison.creator.displayName || 'Unknown User'}</div>
                                    <div className="text-slate-500 text-sm">Creator</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
             {/* Item Selector */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Choose Items to Compare</h3>
                        <p className="text-slate-500">Select at least one item to see it in the table below.</p>
                    </div>
                     <div className="flex gap-2">
                        <Button onClick={onEditTemplate} variant="secondary">
                            <Edit className="mr-2 h-4 w-4" /> Edit Template
                        </Button>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                </div>
                 <div className="relative mb-4">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                         <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input id="item-search" type="text" placeholder="Search for an item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredItems.map(item => {
                        const isSelected = selectedItemIds.includes(item.id);
                        return (
                             <div key={item.id} className={`p-3 rounded-lg border-2 flex items-center justify-between gap-3 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
                                <label htmlFor={`item-select-${item.id}`} className="flex items-center gap-3 cursor-pointer flex-grow truncate">
                                    <input id={`item-select-${item.id}`} type="checkbox" className="hidden" checked={isSelected} onChange={() => handleToggleItem(item.id)} />
                                    {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600 flex-shrink-0" /> : <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                                    <span className={`font-medium truncate ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>{item.title}</span>
                                </label>
                                <button onClick={() => setItemToEdit(item)} className="p-1 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors flex-shrink-0">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })}
                </div>
                 {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <p>No items match your search.</p>
                    </div>
                )}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
                 {itemsToDisplay.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="p-4 font-bold text-slate-700 text-left w-1/3 md:w-1/4 lg:w-1/5 sticky left-0 bg-slate-100">Feature</th>
                                {itemsToDisplay.map(item => (
                                    <th key={item.id} className="p-4 font-bold text-indigo-700 text-center w-48 md:w-56 flex-shrink-0">{item.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {comparison.templateFields.map((field, fieldIndex) => {
                                if (field.type === 'section') {
                                    return (
                                        <tr key={`section-${fieldIndex}`} className="bg-slate-200">
                                            <td colSpan={itemsToDisplay.length + 1} className="p-2 font-bold text-slate-700 text-center">{field.value}</td>
                                        </tr>
                                    );
                                }

                                const fieldId = (field && typeof field === 'object' && field.id != null && field.id !== '') ? field.id : fieldIndex;
                                const fieldLabel = typeof field === 'object' ? field.value : field;

                                return (
                                    <tr key={`field-${fieldId}`} className="border-t border-slate-200">
                                        <td className="p-4 font-semibold text-slate-600 sticky left-0 bg-white">{fieldLabel}</td>
                                        {itemsToDisplay.map(item => {
                                            const valueObj = Array.isArray(item.values)
                                                ? item.values.find(v => v.id === fieldId)
                                                : null;
                                            const value = valueObj ? valueObj.value : '-';
                                            const cellKey = `${item.id}-${fieldId}`;

                                            switch (field.fieldType) {
                                                case 'yes-no':
                                                    return <td key={cellKey} className="p-4 text-center text-slate-800">{value === 'Yes' ? <CheckSquare className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}</td>;
                                                case 'currency':
                                                    return <td key={cellKey} className="p-4 text-center text-slate-800">${value}</td>;
                                                case 'link': {
                                                    if (value && typeof value === 'object' && value.text && value.url) {
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800"><a href={value.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{value.text}</a></td>;
                                                    } else if (value && typeof value === 'object' && value.url) {
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800"><a href={value.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{value.url}</a></td>;
                                                    } else if (value && typeof value === 'object' && value.text) {
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800">{value.text}</td>;
                                                    } else if (typeof value === 'string' && value) {
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800">{value}</td>;
                                                    } else {
                                                        return <td key={cellKey} className="p-4 text-center text-slate-400">-</td>;
                                                    }
                                                }
                                                case 'imageUrl':
                                                    return <td key={cellKey} className="p-4 text-center text-slate-800">{value ? <img src={value} alt={fieldLabel} className="h-16 w-16 object-cover mx-auto rounded" /> : <span className="text-slate-400">-</span>}</td>;
                                                default:
                                                    return <td key={cellKey} className="p-4 text-center text-slate-800">{value}</td>;
                                            }
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center p-12 text-slate-500">
                        <p className="text-lg font-medium">Select items from the list above to begin comparing.</p>
                    </div>
                )}
            </div>

            {isAddModalOpen && <ItemFormModal fields={comparison.templateFields} onClose={() => setIsAddModalOpen(false)} onSave={handleAddItem} modalTitle="Add New Item to Compare" saveButtonText="Save Item" templateId={comparison.id || comparison.templateId} />}
            {itemToEdit && <ItemFormModal item={itemToEdit} fields={comparison.templateFields} onClose={() => setItemToEdit(null)} onSave={handleItemUpdate} modalTitle="Edit Item" saveButtonText="Save Changes" />}
        </div>
    );
};

export { ComparisonView };