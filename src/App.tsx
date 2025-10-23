import React from "react";
import YearlyUsageEditor, { UsageItem } from "./Yearly";

const initialItems: UsageItem[] = [
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

const kpiItem = { id: 28 };

function App() {
  return (
    <div style={{ margin: "2rem" }}>
      <h1>Yearly Usage Editor</h1>
      <YearlyUsageEditor items={initialItems} kpiItem={kpiItem} />
    </div>
  );
};

export default App;
