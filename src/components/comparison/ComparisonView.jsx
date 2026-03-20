import React, { useState, useEffect } from 'react';
import ItemFormModal from './ItemFormModal';
import { getTemplateItems, addTemplateItem, updateTemplateItem, deleteTemplateItem } from '../../services/templates';
import CommentsSection from '../comments/CommentsSection';
import ComparisonHeader from './ComparisonHeader';
import ItemSelector from './ItemSelector';
import { ComparisonTable, HintTooltip } from './ComparisonTable';
import { useAuth } from '../../context/authHooks';

const ComparisonView = ({ comparison, onUpdate, onBack, onEditTemplate }) => {
    const { currentUser } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
    const [items, setItems] = useState([]);
    const templateId = comparison.id || comparison.templateId;

    const isOwner = currentUser && comparison.creator && currentUser.uid === comparison.creator.uid;

    const [hintTooltip, setHintTooltip] = useState({ cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
    const [collapsedSections, setCollapsedSections] = useState({});

    useEffect(() => {
        if (!hintTooltip.visible) return;
        const handleClick = (e) => {
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
        if (!isOwner) return;
        try {
            await updateTemplateItem(templateId, updatedItem.id, updatedItem);
            const fetchedItems = await getTemplateItems(templateId);
            setItems(fetchedItems);
            setItemToEdit(null);
            onUpdate({ ...comparison, items: fetchedItems });
        } catch (error) {
            alert('Failed to update item: ' + error.message);
        }
    };

    const handleAddItem = async (newItemData) => {
        if (!isOwner) return;
        try {
            await addTemplateItem(templateId, newItemData);
            const fetchedItems = await getTemplateItems(templateId);
            setItems(fetchedItems);
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
        if (!isOwner) return;
        try {
            await deleteTemplateItem(templateId, itemId);
            const fetchedItems = await getTemplateItems(templateId);
            setItems(fetchedItems);
            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
            onUpdate({ ...comparison, items: fetchedItems });
        } catch (error) {
            alert('Failed to delete item: ' + error.message);
        }
    };

    const handleToggleSection = (sectionIndex) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    const handleHint = (type, event, cellKey, hint) => {
        switch (type) {
            case 'enter': {
                if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                const rect = event.currentTarget.getBoundingClientRect();
                setHintTooltip({ cellKey, text: hint, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY, visible: true, persistent: false });
                break;
            }
            case 'leave':
                if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                break;
            case 'focus': {
                const focusRect = event.currentTarget.getBoundingClientRect();
                setHintTooltip({ cellKey, text: hint, x: focusRect.left + focusRect.width / 2, y: focusRect.bottom + window.scrollY, visible: true, persistent: false });
                break;
            }
            case 'blur':
                if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                break;
            case 'click': {
                event.stopPropagation();
                const clickRect = event.currentTarget.getBoundingClientRect();
                setHintTooltip({ cellKey, text: hint, x: clickRect.left + clickRect.width / 2, y: clickRect.bottom + window.scrollY, visible: true, persistent: true });
                break;
            }
            default:
                break;
        }
    };

    const itemsToDisplay = items.filter(item => selectedItemIds.includes(item.id));

    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={onBack} className="mb-6 inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
                Back to All Comparisons
            </button>
            
            <ComparisonHeader comparison={comparison} />

            <ItemSelector
                items={items}
                selectedItemIds={selectedItemIds}
                onToggleItem={handleToggleItem}
                onEditTemplate={onEditTemplate}
                onAddItem={() => setIsAddModalOpen(true)}
                onEditItem={setItemToEdit}
                isOwner={isOwner}
            />

            <ComparisonTable
                comparison={comparison}
                itemsToDisplay={itemsToDisplay}
                onHint={handleHint}
                collapsedSections={collapsedSections}
                onToggleSection={handleToggleSection}
            />

            {isOwner && isAddModalOpen && <ItemFormModal fields={comparison.templateFields} onClose={() => setIsAddModalOpen(false)} onSave={handleAddItem} modalTitle="Add New Item to Compare" saveButtonText="Save Item" templateId={comparison.id || comparison.templateId} />}
            {isOwner && itemToEdit && <ItemFormModal item={itemToEdit} fields={comparison.templateFields} onClose={() => setItemToEdit(null)} onSave={handleItemUpdate} onDelete={handleDeleteItem} modalTitle="Edit Item" saveButtonText="Save Changes" templateId={comparison.id || comparison.templateId} />}
            
            <HintTooltip 
                hintTooltip={hintTooltip} 
                onMouseEnter={() => setHintTooltip(t => t.visible ? { ...t, visible: true, persistent: true } : t)}
                onMouseLeave={() => setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false })}
            />
            
            <CommentsSection templateId={templateId} />
        </div>
    );
};

export { ComparisonView };
