import React, { useEffect } from 'react';
import { CheckSquare, X, Info } from 'lucide-react';

const HintTooltip = ({ hintTooltip, onMouseEnter, onMouseLeave }) => {
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


const ComparisonTable = ({ comparison, itemsToDisplay, onHint, collapsedSections, onToggleSection }) => {

    useEffect(() => {
        if (itemsToDisplay.length === 0) return;

        const mainTable = document.getElementById('main-table');
        const tableContainer = document.getElementById('table-container');
        const stickyHeaderPlaceholder = document.getElementById('sticky-header-placeholder');
        const originalThead = mainTable?.querySelector('thead');

        if (!mainTable || !tableContainer || !stickyHeaderPlaceholder || !originalThead) return;

        let isOriginalTheadOnScreen = true;
        let isTableContainerOnScreen = true;

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

    const renderValueWithHint = (content, hint, cellKey) => (
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
                        <thead>
                            <tr className="bg-slate-100 dark:bg-slate-700 transition-colors">
                                <th className="p-4 font-bold text-slate-700 dark:text-slate-200 text-left w-1/3 md:w-1/4 lg:w-1/5 sticky left-0 bg-slate-100 dark:bg-slate-700 z-30">Feature</th>
                                {itemsToDisplay.map(item => (
                                    <th key={item.id} className="p-4 font-bold text-indigo-700 dark:text-indigo-400 text-center w-48 md:w-56 flex-shrink-0 bg-slate-100 dark:bg-slate-700">{item.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                return comparison.templateFields.map((field, fieldIndex, arr) => {
                                    if (field.type === 'section') {
                                        const isCollapsed = collapsedSections[fieldIndex];
                                        return (
                                            <tr key={`section-${fieldIndex}`} className="bg-slate-200 dark:bg-slate-800/80 h-11 transition-colors border-t border-slate-300 dark:border-slate-700">
                                                <td colSpan={itemsToDisplay.length + 1} className="p-2 font-bold text-slate-700 dark:text-slate-200 text-center cursor-pointer select-none group" style={{ alignContent: 'start' }} onClick={() => onToggleSection(fieldIndex)}>
                                                    <span className="inline-flex items-center gap-2 left-1/2 transform -translate-x-1/2" style={{ position: 'absolute', whiteSpace: 'nowrap' }}>
                                                        <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </span>
                                                        {field.value}
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 group-hover:underline">{isCollapsed ? '(Click to Expand)' : ''}</span>
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

                                    const fieldId = (field && typeof field === 'object' && field.id != null && field.id !== '') ? field.id : fieldIndex;
                                    const fieldLabel = typeof field === 'object' ? field.value : field;

                                    return (
                                        <tr key={`field-${fieldId}`} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">{fieldLabel}</th>
                                            {itemsToDisplay.map(item => {
                                                const valueObj = Array.isArray(item.values)
                                                    ? item.values.find(v => v.id === fieldId)
                                                    : null;
                                                const value = valueObj ? valueObj.value : '-';
                                                const cellKey = `${item.id}-${fieldId}`;
                                                const hint = valueObj && typeof valueObj.hint === 'string' && valueObj.hint.trim() ? valueObj.hint : null;

                                                switch (field.fieldType) {
                                                    case 'yes-no':
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(value === 'Yes' ? <CheckSquare className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />, hint, cellKey)}</td>;
                                                    case 'currency':
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(`$${value}`, hint, cellKey)}</td>;
                                                    case 'link': {
                                                        if (value && typeof value === 'object' && value.text && value.url) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(<a href={value.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{value.text}</a>, hint, cellKey)}</td>;
                                                        } else if (value && typeof value === 'object' && value.url) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(<a href={value.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">{value.url}</a>, hint, cellKey)}</td>;
                                                        } else if (value && typeof value === 'object' && value.text) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(value.text, hint, cellKey)}</td>;
                                                        } else if (typeof value === 'string' && value) {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(value, hint, cellKey)}</td>;
                                                        } else {
                                                            return <td key={cellKey} className="p-4 text-center text-slate-400 dark:text-slate-500">-</td>;
                                                        }
                                                    }
                                                    case 'imageUrl':
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(value ? <img src={value} alt={fieldLabel} className=" object-cover mx-auto rounded" /> : <span className="text-slate-400 dark:text-slate-500">-</span>, hint, cellKey)}</td>;
                                                    default:
                                                        return <td key={cellKey} className="p-4 text-center text-slate-800 dark:text-slate-200">{renderValueWithHint(value, hint, cellKey)}</td>;
                                                }
                                            })}
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
