import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Square, Search, Edit, Edit3, X, Clock, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import ItemFormModal from './ItemFormModal';
import { getTemplateItems, addTemplateItem, updateTemplateItem, deleteTemplateItem } from '../../services/templates';
import FavoriteButton from '../ui/FavoriteButton';
import ViewCount from '../ui/ViewCount';
import { timeAgo } from '../../utils/time';
import CommentsSection from '../comments/CommentsSection';

const ComparisonView = ({ comparison, onUpdate, onBack, onEditTemplate }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState([]); // Items from Firestore
    const templateId = comparison.id || comparison.templateId;

    // Tooltip state for field hints
    const [hintTooltip, setHintTooltip] = useState({ cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
    // Collapsed section state: { [sectionIndex]: boolean }
    const [collapsedSections, setCollapsedSections] = useState({});

    // Close tooltip on outside click or Escape
    useEffect(() => {
        if (!hintTooltip.visible) return;
        // let isOverTooltip = false;
        const handleClick = (e) => {
            // If click is outside the tooltip or icon, close it
            if (!e.target.closest('.hint-tooltip') && !e.target.closest('.hint-icon')) {
                setHintTooltip(t => ({ ...t, visible: false, persistent: false, cellKey: null, text: '' }));
            }
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setHintTooltip(t => ({ ...t, visible: false, persistent: false, cellKey: null, text: '' }));
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [hintTooltip.visible]);

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

    const handleDeleteItem = async (templateId, itemId) => {
        try {
            await deleteTemplateItem(templateId, itemId);
            const fetchedItems = await getTemplateItems(templateId);
            setItems(fetchedItems);
            setSelectedItemIds(prev => prev.filter(id => id !== itemId)); // Deselect deleted item
            onUpdate({ ...comparison, items: fetchedItems });
        } catch (error) {
            alert('Failed to delete item: ' + error.message);
        }
    };

    const itemsToDisplay = items.filter(item => selectedItemIds.includes(item.id));

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Toggle collapse for a section row
    const handleToggleSection = (sectionIndex) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    useEffect(() => {
        if (itemsToDisplay.length === 0) return; // Only run if there are items to display (table is rendered)

        const mainTable = document.getElementById('main-table');
        const tableContainer = document.getElementById('table-container');
        const stickyHeaderPlaceholder = document.getElementById('sticky-header-placeholder');
        const originalThead = mainTable?.querySelector('thead');

        if (!mainTable || !tableContainer || !stickyHeaderPlaceholder || !originalThead) return;

        // --- STATE ---
        let isOriginalTheadOnScreen = true;
        let isTableContainerOnScreen = true;

        // --- SETUP ---
        const headerContainer = document.createElement('div');
        headerContainer.classList.add('header-container');
        headerContainer.style.position = 'relative';
        headerContainer.style.overflow = 'hidden';
        const clonedTable = document.createElement('table');
        clonedTable.className = mainTable.className;
        const clonedThead = originalThead.cloneNode(true);

        clonedTable.appendChild(clonedThead);
        headerContainer.appendChild(clonedTable);
        stickyHeaderPlaceholder.appendChild(headerContainer);

        // --- VISIBILITY LOGIC ---
        const updateStickyHeaderVisibility = () => {
            if (!isOriginalTheadOnScreen && isTableContainerOnScreen) {
                stickyHeaderPlaceholder.style.visibility = 'visible';
                stickyHeaderPlaceholder.style.display = 'block';
                handleScroll();
            } else {
                stickyHeaderPlaceholder.style.visibility = 'hidden';
                stickyHeaderPlaceholder.style.display = 'none';
            }
        };

        // --- OBSERVERS ---
        const theadObserver = new IntersectionObserver(
            ([entry]) => {
                isOriginalTheadOnScreen = entry.isIntersecting;
                updateStickyHeaderVisibility();
            },
            { threshold: [0] }
        );
        theadObserver.observe(originalThead);

        const tableContainerObserver = new IntersectionObserver(
            ([entry]) => {
                isTableContainerOnScreen = entry.isIntersecting;
                updateStickyHeaderVisibility();
            },
            {
                rootMargin: "0px 0px -100% 0px",
                threshold: [0]
            }
        );
        tableContainerObserver.observe(tableContainer);

        // --- SYNCHRONIZATION LOGIC ---
        const syncWidths = () => {
            const originalThs = originalThead.querySelectorAll('th');
            const clonedThs = clonedThead.querySelectorAll('th');
            originalThs.forEach((th, i) => {
                const width = th.getBoundingClientRect().width;
                if (clonedThs[i]) {
                    clonedThs[i].style.width = `${width}px`;
                    clonedThs[i].style.minWidth = `${width}px`;
                    clonedThs[i].style.maxWidth = `${width}px`;
                }
            });
            clonedTable.style.width = `${mainTable.offsetWidth}px`;
        };

        const handleScroll = () => {
            headerContainer.scrollLeft = tableContainer.scrollLeft;
        };

        tableContainer.addEventListener('scroll', handleScroll);

        const resizeObserver = new ResizeObserver(syncWidths);
        resizeObserver.observe(mainTable);
        syncWidths();

        // Cleanup function
        return () => {
            theadObserver.disconnect();
            tableContainerObserver.disconnect();
            resizeObserver.disconnect();
            tableContainer.removeEventListener('scroll', handleScroll);
            stickyHeaderPlaceholder.innerHTML = ''; // Clear the placeholder
        };
    }, [itemsToDisplay]);

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-6 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                Back to All Comparisons
            </button>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
                <img src={comparison.imageUrl || 'https://placehold.co/1200x400/a5b4fc/ffffff?text=Comparison'} alt={comparison.title} className="w-full h-48 md:h-64 object-cover" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredItems.map(item => {
                        const isSelected = selectedItemIds.includes(item.id);
                        return (
                            <div key={item.id} className={`p-3 rounded-lg border-2 flex items-center justify-between gap-2 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
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

            <div id="sticky-header-placeholder" className="sticky top-0 z-100 visibility-hidden diplay-none"></div>
            {/* Comparison Table */}
            <div id="table-container" className="table-container overflow-x-auto bg-white rounded-lg shadow-lg mb-8">
                {itemsToDisplay.length > 0 ? (
                    <table id="main-table" className="w-full">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="p-4 font-bold text-slate-700 text-left w-1/3 md:w-1/4 lg:w-1/5 sticky left-0 bg-slate-100 z-30">Feature</th>
                                {itemsToDisplay.map(item => (
                                    <th key={item.id} className="p-4 font-bold text-indigo-700 text-center w-48 md:w-56 flex-shrink-0 bg-slate-100">{item.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                // Track section for each row, so collapse only affects its own children
                                return comparison.templateFields.map((field, fieldIndex, arr) => {
                                    if (field.type === 'section') {
                                        const isCollapsed = collapsedSections[fieldIndex];
                                        return (
                                            <tr key={`section-${fieldIndex}`} className="bg-slate-200 h-11">
                                                <td colSpan={itemsToDisplay.length + 1} className="p-2 font-bold text-slate-700 text-center cursor-pointer select-none group" style={{ alignContent: 'start' }} onClick={() => handleToggleSection(fieldIndex)}>
                                                    <span className="inline-flex items-center gap-2 left-1/2 transform -translate-x-1/2" style={{ position: 'absolute', whiteSpace: 'nowrap' }}>
                                                        <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                                                            {/* Simple chevron icon */}
                                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle"><path d="M6 8l4 4 4-4" stroke="#444444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </span>
                                                        {field.value}
                                                        <span className="text-xs text-slate-500 ml-2 group-hover:underline">{isCollapsed ? '(Click to Expand)' : ''}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    const parentSectionIndex = arr.slice(0, fieldIndex).reverse().findIndex(f => f.type === 'section');
                                    if (parentSectionIndex !== -1) {
                                        const parentSectionField = arr.slice(0, fieldIndex).reverse()[parentSectionIndex];
                                        const originalIndex = arr.findIndex(f => f === parentSectionField);
                                        if (collapsedSections[originalIndex]) {
                                            return null;
                                        }
                                    }

                                    const fieldId = (field && typeof field === 'object' && field.id != null && field.id !== '') ? field.id : fieldIndex; ""
                                    const fieldLabel = typeof field === 'object' ? field.value : field;

                                    return (
                                        <tr key={`field-${fieldId}`} className="border-t border-slate-200 hover:bg-slate-50 transition-colors">
                                            <th className="p-4 font-semibold text-slate-600 sticky left-0 bg-slate-50 z-10">{fieldLabel}</th>
                                            {itemsToDisplay.map(item => {
                                                const valueObj = Array.isArray(item.values)
                                                    ? item.values.find(v => v.id === fieldId)
                                                    : null;
                                                const value = valueObj ? valueObj.value : '-';
                                                const cellKey = `${item.id}-${fieldId}`;
                                                const hint = valueObj && typeof valueObj.hint === 'string' && valueObj.hint.trim() ? valueObj.hint : null;

                                                // Helper to render value with optional hint icon
                                                const renderValueWithHint = (content) => (
                                                    <span className="inline-flex items-center gap-1 relative">
                                                        {content}
                                                        {hint && (
                                                            <span
                                                                className="ml-1 cursor-pointer text-slate-400 hover:text-indigo-500 hint-icon"
                                                                tabIndex={0}
                                                                onMouseEnter={e => {
                                                                    if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    setHintTooltip({ cellKey, text: hint, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY, visible: true, persistent: false });
                                                                }}
                                                                onMouseLeave={() => {
                                                                    if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                                                                    setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                                                                }}
                                                                onFocus={e => {
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    setHintTooltip({ cellKey, text: hint, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY, visible: true, persistent: false });
                                                                }}
                                                                onBlur={() => {
                                                                    if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                                                                    setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                                                                }}
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    setHintTooltip({ cellKey, text: hint, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY, visible: true, persistent: true });
                                                                }}
                                                            >
                                                                <Info className="w-4 h-4 align-middle" />
                                                            </span>
                                                        )}
                                                    </span>
                                                );

                                                switch (field.fieldType) {
                                                    case 'yes-no':
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(value === 'Yes' ? <CheckSquare className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />)}</td>;
                                                    case 'currency':
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(`$${value}`)}</td>;
                                                    case 'link': {
                                                        if (value && typeof value === 'object' && value.text && value.url) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(<a href={value.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{value.text}</a>)}</td>;
                                                        } else if (value && typeof value === 'object' && value.url) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(<a href={value.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{value.url}</a>)}</td>;
                                                        } else if (value && typeof value === 'object' && value.text) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(value.text)}</td>;
                                                        } else if (typeof value === 'string' && value) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(value)}</td>;
                                                        } else {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-400">-</td>;
                                                        }
                                                    }
                                                    case 'imageUrl':
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(value ? <img src={value} alt={fieldLabel} className=" object-cover mx-auto rounded" /> : <span className="text-slate-400">-</span>)}</td>;
                                                    default:
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800">{renderValueWithHint(value)}</td>;
                                                }
                                            })}
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center p-12 text-slate-500">
                        <p className="text-lg font-medium">Select items from the list above to begin comparing.</p>
                    </div>
                )}
            </div>

            {isAddModalOpen && <ItemFormModal fields={comparison.templateFields} onClose={() => setIsAddModalOpen(false)} onSave={handleAddItem} modalTitle="Add New Item to Compare" saveButtonText="Save Item" templateId={comparison.id || comparison.templateId} />}
            {itemToEdit && <ItemFormModal item={itemToEdit} fields={comparison.templateFields} onClose={() => setItemToEdit(null)} onSave={handleItemUpdate} onDelete={handleDeleteItem} modalTitle="Edit Item" saveButtonText="Save Changes" templateId={comparison.id || comparison.templateId} />}
            {/* Hint Tooltip Popup */}
            {hintTooltip.visible && hintTooltip.cellKey && (
                <div
                    className="absolute z-[9999] px-3 py-2 rounded bg-slate-800 text-white text-sm shadow-lg border border-indigo-400 hint-tooltip"
                    style={{
                        left: hintTooltip.x || window.innerWidth / 2,
                        top: (hintTooltip.y || 100) + 8,
                        transform: 'translateX(-50%)',
                        minWidth: 120,
                        maxWidth: 260,
                        pointerEvents: 'auto',
                        opacity: 1,
                        zIndex: 9999,
                    }}
                    tabIndex={-1}
                    onMouseEnter={() => {
                        setHintTooltip(t => t.visible ? { ...t, visible: true, persistent: true } : t);
                    }}
                    onMouseLeave={() => {
                        setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                    }}
                >
                    {hintTooltip.text}
                </div>
            )}
            <CommentsSection templateId={templateId} />
        </div>
    );
};

export { ComparisonView };
