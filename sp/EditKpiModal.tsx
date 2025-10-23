/* eslint-disable @microsoft/fluentui-jsx-a11y/no-empty-components-v9 */
import React, { useState, useMemo } from "react";
import {
    Checkbox,
    DefaultButton,
    Dropdown,
    IDropdownOption,
    IconButton,
    Modal,
    PrimaryButton,
    Stack,
    TextField,
} from "@fluentui/react";

import styles from "./EditKpiModal.module.scss";
import { KpiCounterData } from "../../../../kpiCounter/types";
import useListFieldOptions from "../../../hooks/useListFieldOptions";
import useEditKpiItem from "../hooks/useEditKpiItem";

type EditKpiModalProps = {
    isOpen: boolean;
    onDismiss: () => void;
    item: KpiCounterData | undefined;
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
type MonthKey = typeof months[number];

const EditKpiModal: React.FC<EditKpiModalProps> = ({ isOpen, onDismiss, item }) => {
    const handleClose = () => onDismiss();

    const itemId = item?.id ?? 0;
    const { data: items = [], isLoading, isError, error } = useEditKpiItem(itemId);

    const { data: yearOptions, isLoading: yearLoading, error: yearError } = useListFieldOptions({
        listUrl: "/sites/CustomerSuccess/Lists/Progress",
        fieldInternalOrTitle: "Year",
        sort: true,
        includeBlank: false,
    });

    const yearsList: IDropdownOption[] = useMemo(
        () => (yearOptions ?? []).map((opt) => ({ key: Number(opt.key), text: opt.text })),
        [yearOptions]
    );

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

    const currentItem: KpiItem = useMemo(() => {
        let existing = editedItems[selectedYear] || items.find((i) => i.Year === selectedYear);
        if (!existing) {
            existing = {
                ID: null,
                Year: selectedYear,
                Usesaverage: false,
                ConnectionId: item?.id,
                Jan: null, Feb: null, Mar: null, Apr: null, May: null, Jun: null,
                Jul: null, Aug: null, Sep: null, Oct: null, Nov: null, Dec: null,
            };
            setEditedItems((prev) => ({ ...prev, [selectedYear]: existing! }));
        }
        return existing;
    }, [selectedYear, editedItems, items, item]);

    const calculateTotal = (it: KpiItem): string => {
        const monthValues = months.map((m) => it[monthMap[m]]);
        const validValues = monthValues.filter((v): v is number => v != null);
        if (validValues.length === 0) return "0";
        return it.Usesaverage
            ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2)
            : validValues[validValues.length - 1].toFixed(2);
    };

    const updateEditedItem = (updatedItem: KpiItem) => {
        setEditedItems((prev) => ({ ...prev, [updatedItem.Year]: updatedItem }));
    };

    const handleMonthChange = (month: MonthKey, value: string) => {
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

    const handleReset = () => {
        setEditedItems({});
        setSelectedYear(
            yearsList.find((y) => Number(y.key) === currentYear)
                ? currentYear
                : Number(yearsList[yearsList.length - 1]?.key)
        );
    };

    return (
        <Modal isOpen={isOpen} onDismiss={handleClose} containerClassName={styles.modalContainer}>
            <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Redigera KPI progress data</h2>
                <IconButton title="Stäng" iconProps={{ iconName: "Cancel" }} ariaLabel="Stäng" onClick={handleClose} />
            </div>

            <div className={styles.modalBody}>
                {isLoading && <p>Loading KPI items...</p>}
                {isError && <p>Error loading KPI: {String(error)}</p>}

                <Stack tokens={{ childrenGap: 16 }}>
                    <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="end">
                        <Dropdown
                            label="År"
                            options={yearsList}
                            selectedKey={selectedYear}
                            onChange={(_, option) => setSelectedYear(Number(option?.key))}
                            placeholder={yearLoading ? "Hämtar år..." : "Välj år"}
                            disabled={yearLoading || !!yearError}
                            styles={{ root: { width: 200 } }}
                        />
                        <TextField
                            label="Total"
                            value={calculateTotal(currentItem)}
                            readOnly
                            styles={{
                                root: { width: 200 },
                                field: { color: "#999" },
                            }}
                        />
                        <div style={{ display: "flex", height: "32px", alignItems: "center" }}>
                            <Checkbox
                                label="Snitt"
                                checked={currentItem.Usesaverage}
                                onChange={(_, checked) => handleUsesAverageChange(checked!)}
                            />
                        </div>
                    </Stack>

                    <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
                        {months.map((month) => (
                            <Stack key={month} tokens={{ childrenGap: 8 }}>
                                <label>{month}: </label>
                                <TextField
                                    type="number"
                                    value={currentItem[monthMap[month]]?.toString() ?? ""}
                                    onChange={(_, newValue) => handleMonthChange(month, newValue ?? "")}
                                    styles={{
                                        root: { width: 200 },
                                        field: { textAlign: "right" },
                                    }}
                                />
                            </Stack>
                        ))}
                    </Stack>
                </Stack>

                <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginTop: 20 }}>
                    <PrimaryButton text="Spara" onClick={handleSave} />
                    <DefaultButton text="Avbryt" onClick={handleClose} />
                </Stack>
            </div>
        </Modal>
    );
};

export default EditKpiModal;
