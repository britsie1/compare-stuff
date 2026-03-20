import React, { useState } from 'react';
import { Plus, Edit, Search, CheckSquare, Square, Edit3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const ItemSelector = ({ items, selectedItemIds, onToggleItem, onEditTemplate, onAddItem, onEditItem, isOwner }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:border dark:border-slate-700 transition-colors">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Choose Items to Compare</h3>
                    <p className="text-slate-500 dark:text-slate-400">Select at least one item to see it in the table below.</p>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <Button onClick={onEditTemplate} variant="secondary">
                            <Edit className="mr-2 h-4 w-4" /> Edit Template
                        </Button>
                        <Button onClick={onAddItem}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                )}
            </div>
            <div className="relative mb-4">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input id="item-search" type="text" placeholder="Search for an item..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map(item => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                        <div key={item.id} className={`p-3 rounded-lg border-2 flex items-center justify-between gap-2 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/50 dark:border-slate-600'}`}>
                            <label htmlFor={`item-select-${item.id}`} className="flex items-center gap-3 cursor-pointer flex-grow truncate">
                                <input id={`item-select-${item.id}`} type="checkbox" className="hidden" checked={isSelected} onChange={() => onToggleItem(item.id)} />
                                {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" /> : <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                                <span className={`font-medium truncate ${isSelected ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>{item.title}</span>
                            </label>
                            {isOwner && (
                                <button onClick={() => onEditItem(item)} className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors flex-shrink-0">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
            {filteredItems.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>No items match your search.</p>
                </div>
            )}
        </div>
    );
};

export default ItemSelector;
