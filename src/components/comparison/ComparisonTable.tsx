import React, { useEffect } from 'react';
import { CheckSquare, X, Info } from 'lucide-react';
import { Template, TemplateItem } from '../../services/templates';

interface HintTooltipData {
    visible: boolean;
    cellKey: string | null;
    x: number;
    y: number;
    text: string | null;
}

interface HintTooltipProps {
    hintTooltip: HintTooltipData;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const HintTooltip: React.FC<HintTooltipProps> = ({ hintTooltip, onMouseEnter, onMouseLeave }) => {
    if (!hintTooltip.visible || !hintTooltip.cellKey) return null;

    return (
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
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {hintTooltip.text}
        </div>
    );
};

interface ComparisonTableProps {
    comparison: Template;
    itemsToDisplay: TemplateItem[];
    onHint: (type: string, e: React.MouseEvent | React.FocusEvent | null, cellKey: string, hint: string | null) => void;
    collapsedSections: { [key: number]: boolean };
    onToggleSection: (index: number) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ 
    comparison, 
    itemsToDisplay, 
    onHint, 
    collapsedSections, 
    onToggleSection 
}) => {

    useEffect(() => {
        if (itemsToDisplay.length === 0) return;
        
        const tableContainer = document.getElementById('table-container') as HTMLDivElement | null;
        if (!tableContainer) return;

        // Update viewport width variable for centering logic on mobile
        const updateViewportWidth = () => {
            const width = tableContainer.clientWidth;
            tableContainer.style.setProperty('--viewport-width', `${width}px`);
        };
        const viewportRo = new ResizeObserver(updateViewportWidth);
        viewportRo.observe(tableContainer);
        updateViewportWidth();

        // Only apply custom sticky header on desktop (md and up)
        if (window.innerWidth < 768) {
            return () => viewportRo.disconnect();
        }

        const mainTable = document.getElementById('main-table') as HTMLTableElement | null;
        const stickyHeaderPlaceholder = document.getElementById('sticky-header-placeholder') as HTMLDivElement | null;
        const originalThead = mainTable?.querySelector('thead') as HTMLTableSectionElement | null;

        if (!mainTable || !stickyHeaderPlaceholder || !originalThead) {
            return () => viewportRo.disconnect();
        }

        let isOriginalTheadOnScreen = true;
        let isTableContainerOnScreen = true;

        const headerContainer = document.createElement('div');
        headerContainer.classList.add('header-container');
        headerContainer.style.position = 'relative';
        headerContainer.style.overflow = 'hidden';
        const clonedTable = document.createElement('table');
        clonedTable.className = mainTable.className;
        const clonedThead = originalThead.cloneNode(true) as HTMLTableSectionElement;

        clonedTable.appendChild(clonedThead);
        headerContainer.appendChild(clonedTable);
        stickyHeaderPlaceholder.appendChild(headerContainer);

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

        return () => {
            viewportRo.disconnect();
            theadObserver.disconnect();
            tableContainerObserver.disconnect();
            resizeObserver.disconnect();
            if (tableContainer) {
                tableContainer.removeEventListener('scroll', handleScroll);
            }
            if (stickyHeaderPlaceholder) {
                stickyHeaderPlaceholder.innerHTML = '';
            }
        };
    }, [itemsToDisplay]);

    const renderValueWithHint = (content: React.ReactNode, hint: string | null, cellKey: string) => (
        <span className="inline-flex items-center gap-1 relative">
            {content}
            {hint && (
                <button
                    type="button"
                    className="ml-1 cursor-pointer text-slate-400 hover:text-indigo-500 hint-icon focus:outline-none focus:text-indigo-500"
                    onMouseEnter={e => onHint('enter', e, cellKey, hint)}
                    onMouseLeave={() => onHint('leave', null, cellKey, null)}
                    onFocus={e => onHint('focus', e, cellKey, hint)}
                    onBlur={() => onHint('blur', null, cellKey, null)}
                    onClick={e => onHint('click', e, cellKey, hint)}
                    aria-label="Show hint"
                >
                    <Info className="w-4 h-4 align-middle" />
                </button>
            )}
        </span>
    );

    return (
        <>
            <div id="sticky-header-placeholder" className="sticky top-0 z-40 bg-white dark:bg-slate-800" style={{ visibility: 'hidden', display: 'none' }}></div>
            <div id="table-container" className="table-container overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg mb-8 dark:border dark:border-slate-700">
                {itemsToDisplay.length > 0 ? (
                    <table id="main-table" className="w-full">
                        <thead className="md:sticky md:top-0 z-30">
                            <tr className="bg-slate-100 dark:bg-slate-700 transition-colors flex md:table-row">
                                <th className="hidden md:table-cell p-4 font-bold text-slate-700 dark:text-slate-200 text-left w-1/3 md:w-1/4 lg:w-1/5 sticky left-0 bg-slate-100 dark:bg-slate-700 z-30">Feature</th>
                                {itemsToDisplay.map(item => (
                                    <th key={item.id} className="p-4 font-bold text-indigo-700 dark:text-indigo-400 text-center w-48 md:w-56 flex-shrink-0 bg-slate-100 dark:bg-slate-700 md:table-cell">{item.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                return comparison.templateFields.map((field, fieldIndex, arr) => {
                                    if (field.type === 'section') {
                                        const isCollapsed = collapsedSections[fieldIndex];
                                        return (
                                            <tr key={`section-${fieldIndex}`} className="bg-slate-200 dark:bg-slate-800/80 h-11 transition-colors border-t border-slate-300 dark:border-slate-700 block md:table-row">
                                                <td colSpan={itemsToDisplay.length + 1} className="p-0 font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none group w-full md:table-cell md:static bg-inherit z-20" onClick={() => onToggleSection(fieldIndex)}>
                                                    <div className="md:static sticky left-0 flex items-center justify-center gap-2 whitespace-nowrap h-11 bg-inherit px-2" style={{ width: 'var(--viewport-width, 100%)' }}>
                                                        <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </span>
                                                        {field.value}
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 group-hover:underline">{isCollapsed ? '(Click to Expand)' : ''}</span>
                                                    </div>
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

                                    const fieldId = (field && typeof field === 'object' && field.id != null && field.id !== '') ? field.id : fieldIndex.toString();
                                    const fieldLabel = typeof field === 'object' ? field.value : field;

                                    return (
                                        <tr key={`field-${fieldId}`} className="flex flex-col md:table-row border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <th className="h-10 md:h-auto p-0 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 md:bg-transparent z-10 md:text-left md:table-cell w-full md:w-auto" colSpan={1}>
                                                <div className="md:static sticky left-0 flex items-center justify-center md:justify-start whitespace-nowrap h-10 bg-inherit md:bg-transparent px-4" style={{ width: 'var(--viewport-width, 100%)' }}>
                                                    {fieldLabel}
                                                </div>
                                            </th>
                                            <td className="flex md:contents">
                                                {itemsToDisplay.map(item => {
                                                    const valueObj = Array.isArray(item.values)
                                                        ? item.values.find(v => v.id === fieldId)
                                                        : null;
                                                    const value = valueObj ? valueObj.value : '-';
                                                    const cellKey = `${item.id}-${fieldId}`;
                                                    const hint = valueObj && typeof valueObj.hint === 'string' && valueObj.hint.trim() ? valueObj.hint : null;

                                                    let content;
                                                    switch (field.fieldType) {
                                                        case 'yes-no':
                                                            content = renderValueWithHint(value === 'Yes' ? <CheckSquare className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />, hint, cellKey);
                                                            break;
                                                        case 'currency':
                                                            content = renderValueWithHint(`$${value}`, hint, cellKey);
                                                            break;
                                                        case 'link': {
                                                            if (value && typeof value === 'object' && (value as any).text && (value as any).url) {
                                                                content = renderValueWithHint(<a href={(value as any).url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{(value as any).text}</a>, hint, cellKey);
                                                            } else if (value && typeof value === 'object' && (value as any).url) {
                                                                content = renderValueWithHint(<a href={(value as any).url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{(value as any).url}</a>, hint, cellKey);
                                                            } else if (value && typeof value === 'object' && (value as any).text) {
                                                                content = renderValueWithHint((value as any).text, hint, cellKey);
                                                            } else if (typeof value === 'string' && value) {
                                                                content = renderValueWithHint(value, hint, cellKey);
                                                            } else {
                                                                content = <span className="text-slate-400 dark:text-slate-500">-</span>;
                                                            }
                                                            break;
                                                        }
                                                        case 'imageUrl':
                                                            content = renderValueWithHint(value ? <img src={value as string} alt={fieldLabel} className=" object-cover mx-auto rounded" /> : <span className="text-slate-400 dark:text-slate-500">-</span>, hint, cellKey);
                                                            break;
                                                        default:
                                                            content = renderValueWithHint(value as React.ReactNode, hint, cellKey);
                                                    }

                                                    return (
                                                        <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200 flex-shrink-0 w-48 md:w-56 md:table-cell">
                                                            <span className="md:hidden text-xs text-slate-400 dark:text-slate-500 mb-1 block">{item.title}</span>
                                                            {content}
                                                        </td>
                                                    );
                                                })}
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center p-12 text-slate-500 dark:text-slate-400">
                        <p className="text-lg font-medium">Select items from the list above to begin comparing.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export { ComparisonTable, HintTooltip };
export type { HintTooltipData };
