'use client';

import React from 'react';
import styles from './DataTableViewer.module.css';

interface DataTableViewerProps {
  dataTable: {
    columns: string[];
    data: string[][];
  } | null;
  title?: string;
}

export default function DataTableViewer({ dataTable, title }: DataTableViewerProps) {
  if (!dataTable || !dataTable.columns || !dataTable.data) {
    return null;
  }

  return (
    <div className={styles.container}>
      {title && <h4 className={styles.title}>{title}</h4>}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {dataTable.columns.map((column, index) => (
                <th key={index} className={styles.header}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataTable.data.map((row, rowIndex) => (
              <tr key={rowIndex} className={styles.row}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styles.cell}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}