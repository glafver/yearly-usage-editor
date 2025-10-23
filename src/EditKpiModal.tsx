import React, { useState, useMemo, useEffect } from "react";

type EditKpiModalProps = {
    isOpen: boolean;
    onDismiss: () => void;
    kpiItem: any | undefined;
};

export interface KpiItem {
    ID?: number | null;
    ConnectionId?: number;
    Year: number;
    Usesaverage: boolean;
    Jan?: number | null;
    Feb?: number | null;
    Mar?: number | null;
    Apr?: number | null;
    May?: number | null;
    Jun?: number | null;
    Jul?: number | null;
    Aug?: number | null;
    Sep?: number | null;
    Oct?: number | null;
    Nov?: number | null;
    Dec?: number | null;
}

const monthMap: Record<string, keyof KpiItem> = {
    Januari: "Jan",
    Februari: "Feb",
    Mars: "Mar",
    April: "Apr",
    Maj: "May",
    Juni: "Jun",
    Juli: "Jul",
    Augusti: "Aug",
    September: "Sep",
    Oktober: "Oct",
    November: "Nov",
    December: "Dec",
};

const months = Object.keys(monthMap) as (keyof typeof monthMap)[];

const EditKpiModal: React.FC<EditKpiModalProps> = ({ isOpen, onDismiss, kpiItem }) => {
    const itemId = kpiItem?.id ?? 0;

    const items: KpiItem[] = [
        {
            ID: 1,
            ConnectionId: 28,
            Year: 2024,
            Usesaverage: false,
            Jan: 100, Feb: null, Mar: 90, Apr: null, May: 110, Jun: null,
            Jul: 105, Aug: 115, Sep: null, Oct: 125, Nov: null, Dec: 150,
        },
        {
            ID: 2,
            ConnectionId: 28,
            Year: 2025,
            Usesaverage: true,
            Jan: null, Feb: null, Mar: 95, Apr: 100, May: null, Jun: 120,
            Jul: 115, Aug: null, Sep: 95, Oct: 100, Nov: null, Dec: 120,
        },
    ];

    const yearsList = [
        { key: 2024, text: "2024" },
        { key: 2025, text: "2025" },
        { key: 2026, text: "2026" }
    ];

    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState<number>(() => {
        const match = yearsList.find((y) => Number(y.key) === currentYear);
        return match ? currentYear : Number(yearsList[yearsList.length - 1]?.key);
    });

    const [editedItems, setEditedItems] = useState<Record<number, KpiItem>>({});
    const [initialItems] = useState<Record<number, KpiItem>>(() =>
        items.reduce((acc, it) => {
            acc[it.Year] = it;
            return acc;
        }, {} as Record<number, KpiItem>)
    );

    useEffect(() => {
        setEditedItems((prev) => {
            if (prev[selectedYear]) return prev;
            const existing = initialItems[selectedYear];
            const newItem: KpiItem =
                existing || {
                    ID: null,
                    Year: selectedYear,
                    Usesaverage: false,
                    ConnectionId: itemId,
                    Jan: null, Feb: null, Mar: null, Apr: null, May: null, Jun: null,
                    Jul: null, Aug: null, Sep: null, Oct: null, Nov: null, Dec: null,
                };
            return { ...prev, [selectedYear]: newItem };
        });
    }, [selectedYear, initialItems, itemId]);

    const currentItem = editedItems[selectedYear] ?? initialItems[selectedYear];

    const calculateTotal = (item: KpiItem): string => {
        if (!item) return "0";
        const monthValues = months.map((month) => item[monthMap[month]]);

        const validValues = monthValues.filter((v): v is number => v !== null && v !== undefined);

        if (validValues.length === 0) {
            return "0";
        }

        if (item.Usesaverage) {
            return (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2);
        } else {
            return validValues[validValues.length - 1].toFixed(2);
        }
    };

    const updateEditedItem = (updatedItem: KpiItem) => {
        setEditedItems((prev) => ({ ...prev, [updatedItem.Year]: updatedItem }));
    };

    const handleMonthChange = (month: string, value: string) => {
        const parsed = value === "" ? null : Number(value);
        updateEditedItem({ ...currentItem, [monthMap[month]]: parsed });
    };

    const handleUsesAverageChange = (checked: boolean) => {
        updateEditedItem({ ...currentItem, Usesaverage: checked });
    };

    const isItemReverted = (a: KpiItem, b: KpiItem): boolean => {
        if (!b) return false;
        return (
            a.Usesaverage === b.Usesaverage &&
            months.every((m) => a[monthMap[m]] === b[monthMap[m]])
        );
    };

    const isEmptyItem = (it: KpiItem): boolean =>
        !it.Usesaverage && months.every((m) => it[monthMap[m]] == null);

    const cleanEmptyItemsBeforeSave = (edits: Record<number, KpiItem>) => {
        const cleaned: Record<number, KpiItem> = {};
        Object.keys(edits).forEach((year) => {
            const it = edits[Number(year)];
            const orig = initialItems[it.Year];
            if (!isItemReverted(it, orig) && !isEmptyItem(it)) {
                cleaned[Number(year)] = it;
            }
        });
        return cleaned;
    };

    const handleSave = () => {
        const cleaned = cleanEmptyItemsBeforeSave(editedItems);
        console.log("Saved Edited Items:", cleaned);
    };

    const handleClose = () => {
        setEditedItems({});
        setSelectedYear(
            yearsList.find((y) => Number(y.key) === currentYear)
                ? currentYear
                : Number(yearsList[yearsList.length - 1]?.key)
        );
        onDismiss();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>Edit KPI Progress Data</h2>
                    <button className="close-btn" onClick={handleClose}>X</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="year">Year</label>
                        <select
                            id="year"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            {yearsList.map((year) => (
                                <option key={year.key} value={year.key}>
                                    {year.text}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={currentItem?.Usesaverage || false}
                                onChange={(e) => handleUsesAverageChange(e.target.checked)}
                            />
                            Use Average
                        </label>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                    {months.map((month) => (
                        <div key={month}>
                            <label>{month}:</label>
                            <input
                                type="number"
                                value={currentItem?.[monthMap[month]] != null ? String(currentItem[monthMap[month]]) : ""}
                                onChange={(e) => handleMonthChange(month, e.target.value)}
                                style={{ width: "50%" }}
                            />
                        </div>
                    ))}
                </div>

                <h3 style={{ marginTop: "1rem" }}>Total: {calculateTotal(currentItem)}</h3>

                <div className="modal-footer" style={{ marginTop: "1rem" }}>
                    <button onClick={handleSave}>Spara</button>
                    <button onClick={handleClose}>Avbryt</button>
                </div>
            </div>
        </div>
    );
};

export default EditKpiModal;
