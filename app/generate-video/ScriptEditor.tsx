"use client";

import React from "react";

export default function ScriptEditor({
  rows,
  setRows,
}: {
  rows: Array<Record<string, any>>;
  setRows: (rows: Array<Record<string, any>>) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs text-muted-foreground">You can edit rows inline. Add/delete rows as needed.</div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase text-muted-foreground">
              {rows.length > 0 ? (
                Object.keys(rows[0]).map((k) => (
                  <th key={k} className="border px-2 py-1">
                    {k}
                  </th>
                ))
              ) : (
                <th className="border px-2 py-1">value</th>
              )}
              <th className="border px-2 py-1">actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="align-top">
                {(Object.keys(row).length > 0 ? Object.keys(row) : ["value"]).map((col) => {
                  const cell = (row as any)[col];
                  const isObject = typeof cell === "object" && cell !== null;
                  return (
                    <td key={col} className="border px-2 py-1 align-top">
                      {isObject ? (
                        <textarea
                          rows={3}
                          className="w-full resize-y rounded-sm border px-2 py-1 text-sm font-mono"
                          value={JSON.stringify(cell, null, 2)}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            const val = e.target.value;
                            const copy = rows.map((r) => ({ ...r }));
                            try {
                              copy[ri] = { ...copy[ri], [col]: JSON.parse(val) };
                            } catch {
                              copy[ri] = { ...copy[ri], [col]: val };
                            }
                            setRows(copy);
                          }}
                        />
                      ) : (
                        <input
                          className="w-full bg-transparent text-sm"
                          value={String(cell ?? "")}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value;
                            const copy = rows.map((r) => ({ ...r }));
                            copy[ri] = { ...copy[ri], [col]: val };
                            setRows(copy);
                          }}
                        />
                      )}
                    </td>
                  );
                })}
                <td className="border px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setRows(rows.filter((_, i) => i !== ri))}
                    className="text-sm text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!rows || rows.length === 0) {
              setRows([{ value: "" }]);
              return;
            }
            const keys = Object.keys(rows[0]);
            const blank: Record<string, any> = {};
            keys.forEach((k) => (blank[k] = ""));
            setRows([...rows, blank]);
          }}
          className="rounded-md border px-3 py-1 text-sm"
        >
          Add row
        </button>
        <button
          type="button"
          onClick={() => alert("Script updated locally. Use Generate video to proceed.")}
          className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white"
        >
          Save edits
        </button>
      </div>
    </div>
  );
}
