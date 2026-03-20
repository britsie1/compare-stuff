import React, { useState, useEffect } from 'react';
import ItemFormModal from './ItemFormModal';
import CommentsSection from '../comments/CommentsSection';
import ComparisonHeader from './ComparisonHeader';
import ItemSelector from './ItemSelector';
import { ComparisonTable, HintTooltip, HintTooltipData } from './ComparisonTable';
import { useAuth } from '../../context/authHooks';
import { 
    useTemplateItems, 
    useAddItemMutation, 
    useUpdateItemMutation, 
    useDeleteItemMutation 
} from '../../hooks/queries/useTemplates';
import { Template, TemplateItem } from '../../services/templates';

interface ComparisonViewProps {
    comparison: Template;
    onBack: () => void;
    onEditTemplate: () => void;
}

interface ExtendedHintTooltipData extends HintTooltipData {
    persistent: boolean;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ comparison, onBack, onEditTemplate }) => {
    const { currentUser } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<TemplateItem | null>(null);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const templateId = (comparison.id || comparison.templateId) as string;

    const { data: items = [] } = useTemplateItems(templateId);
    
    const addItemMutation = useAddItemMutation(templateId);
    const updateItemMutation = useUpdateItemMutation(templateId);
    const deleteItemMutation = useDeleteItemMutation(templateId);

    const isOwner = currentUser && comparison.creator && currentUser.uid === comparison.creator.uid;

    const [hintTooltip, setHintTooltip] = useState<ExtendedHintTooltipData>({ 
        cellKey: null, 
        text: '', 
        x: 0, 
        y: 0, 
        visible: false, 
        persistent: false 
    });
    const [collapsedSections, setCollapsedSections] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        if (!hintTooltip.visible) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.hint-tooltip') && !target.closest('.hint-icon')) {
                setHintTooltip(t => ({ ...t, visible: false, persistent: false, cellKey: null, text: '' }));
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
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

    const handleToggleItem = (itemId: string) => {
        setSelectedItemIds(prevSelected =>
            prevSelected.includes(itemId)
                ? prevSelected.filter(id => id !== itemId)
                : [...prevSelected, itemId]
        );
    };

    const handleItemUpdate = async (updatedItem: Partial<TemplateItem>) => {
        if (!isOwner || !updatedItem.id) return;
        try {
            await updateItemMutation.mutateAsync({ itemId: updatedItem.id, itemData: updatedItem });
            setItemToEdit(null);
            // items will be automatically refetched by TanStack Query
        } catch (error) {
            alert('Failed to update item: ' + (error as Error).message);
        }
    };

    const handleAddItem = async (newItemData: Partial<TemplateItem>) => {
        if (!isOwner) return;
        try {
            const newItemId = await addItemMutation.mutateAsync(newItemData);
            setSelectedItemIds(prev => [...prev, newItemId]);
            setIsAddModalOpen(false);
        } catch (error) {
            alert('Failed to add item: ' + (error as Error).message);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!isOwner) return;
        try {
            await deleteItemMutation.mutateAsync(itemId);
            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
        } catch (error) {
            alert('Failed to delete item: ' + (error as Error).message);
        }
    };

    const handleToggleSection = (sectionIndex: number) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    const handleHint = (type: string, event: React.MouseEvent | React.FocusEvent | null, cellKey: string, hint: string | null) => {
        switch (type) {
            case 'enter': {
                if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                if (event) {
                    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    setHintTooltip({ cellKey, text: hint, x: rect.left + rect.width / 2, y: rect.bottom + window.scrollY, visible: true, persistent: false });
                }
                break;
            }
            case 'leave':
                if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                break;
            case 'focus': {
                if (event) {
                    const focusRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    setHintTooltip({ cellKey, text: hint, x: focusRect.left + focusRect.width / 2, y: focusRect.bottom + window.scrollY, visible: true, persistent: false });
                }
                break;
            }
            case 'blur':
                if (hintTooltip.persistent && hintTooltip.cellKey === cellKey) return;
                setHintTooltip(t => t.persistent ? t : { cellKey: null, text: '', x: 0, y: 0, visible: false, persistent: false });
                break;
            case 'click': {
                if (event) {
                    event.stopPropagation();
                    const clickRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    setHintTooltip({ cellKey, text: hint, x: clickRect.left + clickRect.width / 2, y: clickRect.bottom + window.scrollY, visible: true, persistent: true });
                }
                break;
            }
            default:
                break;
        }
    };

    const itemsToDisplay = items.filter(item => item.id && selectedItemIds.includes(item.id));

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
                isOwner={isOwner || false}
            />

            <ComparisonTable
                comparison={comparison}
                itemsToDisplay={itemsToDisplay}
                onHint={handleHint}
                collapsedSections={collapsedSections}
                onToggleSection={handleToggleSection}
            />

            {isOwner && isAddModalOpen && <ItemFormModal fields={comparison.templateFields} onClose={() => setIsAddModalOpen(false)} onSave={handleAddItem} modalTitle="Add New Item to Compare" saveButtonText="Save Item" templateId={(comparison.id || comparison.templateId) as string} />}
            {isOwner && itemToEdit && <ItemFormModal item={itemToEdit} fields={comparison.templateFields} onClose={() => setItemToEdit(null)} onSave={handleItemUpdate} onDelete={handleDeleteItem} modalTitle="Edit Item" saveButtonText="Save Changes" templateId={(comparison.id || comparison.templateId) as string} />}
            
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
