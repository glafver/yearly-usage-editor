import React, { useState, useMemo } from "react";

export interface UsageItem {
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

interface YearlyUsageEditorProps {
    items: UsageItem[];
    kpiItem: { id: number; };
}


const monthMap: Record<string, keyof UsageItem> = {
    "Januari": "Jan",
    "Februari": "Feb",
    "Mars": "Mar",
    "April": "Apr",
    "Maj": "May",
    "Juni": "Jun",
    "Juli": "Jul",
    "Augusti": "Aug",
    "September": "Sep",
    "Oktober": "Oct",
    "November": "Nov",
    "December": "Dec"
};

const months = Object.keys(monthMap) as (keyof typeof monthMap)[];

type MonthKey = typeof months[number];

const YearlyUsageEditor: React.FC<YearlyUsageEditorProps> = ({ items, kpiItem }) => {

    const yearsList = [2024, 2025, 2026];
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState<number>(() => {
        return yearsList.includes(currentYear) ? currentYear : yearsList[yearsList.length - 1];
    });

    const [editedItems, setEditedItems] = useState<Record<number, UsageItem>>({});

    const [initialItems] = useState<Record<number, UsageItem>>(
        items.reduce((acc, item) => {
            acc[item.Year] = item;
            return acc;
        }, {} as Record<number, UsageItem>)
    );

    const currentItem: UsageItem = useMemo(() => {
        let item = editedItems[selectedYear] || items.find((i) => i.Year === selectedYear);
        if (!item) {
            item = {
                ID: null,
                Year: selectedYear,
                Usesaverage: false,
                ConnectionId: kpiItem.id,
                Jan: null, Feb: null, Mar: null, Apr: null, May: null, Jun: null,
                Jul: null, Aug: null, Sep: null, Oct: null, Nov: null, Dec: null,
            };
            setEditedItems((prev) => ({ ...prev, [selectedYear]: item }));
        }
        return item;
    }, [selectedYear, editedItems, items, kpiItem]);

    const calculateTotal = (item: UsageItem): string => {
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

    const handleMonthChange = (month: MonthKey, value: string) => {
        const parsed = value === "" ? null : Number(value);
        const updated = { ...currentItem, [monthMap[month]]: parsed };
        updateEditedItem(updated);
    };

    const handleUsesAverageChange = (checked: boolean) => {
        const updated = { ...currentItem, Usesaverage: checked };
        updateEditedItem(updated);
    };

    const updateEditedItem = (updatedItem: UsageItem) => {
        setEditedItems((prev) => {
            const newEdits = { ...prev, [updatedItem.Year]: updatedItem };
            return newEdits;
        });
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const year = Number(e.target.value);
        setSelectedYear(year);
    };

    const isItemReverted = (currentItem: UsageItem, initialItem: UsageItem): boolean => {
        if (!initialItem) {
            return false;
        }
        return (
            currentItem.Usesaverage === initialItem.Usesaverage &&
            months.every((month) => currentItem[monthMap[month]] === initialItem[monthMap[month]])
        );
    };

    const isEmptyItem = (item: UsageItem): boolean => {
        return (
            !item.Usesaverage &&
            months.every((month) => item[monthMap[month]] === null)
        );
    };

    const cleanEmptyItemsBeforeSave = (editedItems: Record<number, UsageItem>) => {
        const cleanedItems: Record<number, UsageItem> = {};

        Object.keys(editedItems).forEach((year) => {
            const item = editedItems[Number(year)];
            const initialItem = initialItems[item.Year];

            if (!isItemReverted(item, initialItem) && !isEmptyItem(item)) {
                cleanedItems[Number(year)] = item;
            }
        });

        return cleanedItems;
    };

    const handleSave = () => {
        const cleanedItems = cleanEmptyItemsBeforeSave(editedItems);
        console.log("Saved Edited Items:", cleanedItems);
    };

    const handleReset = () => {
        console.log("reset");

        setEditedItems({});

        setSelectedYear(() => {
            return yearsList.includes(currentYear) ? currentYear : yearsList[yearsList.length - 1];
        });
    };

    return (
        <div>
            <div style={{ marginBottom: "1rem" }}>
                <label>Year: </label>
                <select value={selectedYear} onChange={handleYearChange}>
                    {yearsList.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label>
                    <input
                        type="checkbox"
                        checked={!!currentItem.Usesaverage}
                        onChange={(e) => handleUsesAverageChange(e.target.checked)}
                    />{" "}
                    Use Average
                </label>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "0.5rem",
                }}
            >
                {months.map((month) => (
                    <div key={month}>
                        <label>{month}: </label>
                        <input
                            type="number"
                            value={currentItem[monthMap[month]] ? String(currentItem[monthMap[month]]) : ""}
                            onChange={(e) => handleMonthChange(month, e.target.value)}
                            style={{ width: "100px" }}
                        />
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: "1rem" }}>Total: {calculateTotal(currentItem)}</h3>

            <div style={{ marginTop: "1rem" }}>
                <button onClick={handleSave} style={{ marginRight: "1rem" }}>
                    Save
                </button>
                <button onClick={handleReset}>Reset</button>
            </div>
        </div>
    );
};

export default YearlyUsageEditor;
