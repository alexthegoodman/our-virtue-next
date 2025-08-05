'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash, PencilSimple } from '@phosphor-icons/react';
import styles from './DataTableEditor.module.css';

interface DataTableEditorProps {
  value: { columns: string[]; data: any[][] } | null;
  onChange: (tableData: { columns: string[]; data: any[][] }) => void;
}

export default function DataTableEditor({ value, onChange }: DataTableEditorProps) {
  const [columns, setColumns] = useState<string[]>(['Location', 'Value']);
  const [data, setData] = useState<any[][]>([['', '']]);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [columnEditValue, setColumnEditValue] = useState('');

  // Initialize from value prop
  useEffect(() => {
    if (value && value.columns && value.data) {
      setColumns(value.columns);
      setData(value.data.length > 0 ? value.data : [new Array(value.columns.length).fill('')]);
    }
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onChange({ columns, data: data.filter(row => row.some(cell => cell !== '')) });
  }, [columns, data, onChange]);

  const addColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;
    setColumns([...columns, newColumnName]);
    setData(data.map(row => [...row, '']));
  };

  const removeColumn = (columnIndex: number) => {
    if (columns.length <= 1) return; // Keep at least one column
    
    setColumns(columns.filter((_, index) => index !== columnIndex));
    setData(data.map(row => row.filter((_, index) => index !== columnIndex)));
  };

  const startEditingColumn = (columnIndex: number) => {
    setEditingColumn(columnIndex);
    setColumnEditValue(columns[columnIndex]);
  };

  const finishEditingColumn = () => {
    if (editingColumn !== null && columnEditValue.trim()) {
      const newColumns = [...columns];
      newColumns[editingColumn] = columnEditValue.trim();
      setColumns(newColumns);
    }
    setEditingColumn(null);
    setColumnEditValue('');
  };

  const cancelEditingColumn = () => {
    setEditingColumn(null);
    setColumnEditValue('');
  };

  const addRow = () => {
    setData([...data, new Array(columns.length).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (data.length <= 1) return; // Keep at least one row
    
    setData(data.filter((_, index) => index !== rowIndex));
  };

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][columnIndex] = value;
    setData(newData);
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, columnIndex: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const nextColumnIndex = columnIndex + 1;
      const nextRowIndex = rowIndex;
      
      if (nextColumnIndex < columns.length) {
        // Move to next column in same row
        const nextInput = document.querySelector(
          `input[data-row="${nextRowIndex}"][data-col="${nextColumnIndex}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      } else if (rowIndex + 1 < data.length) {
        // Move to first column of next row
        const nextInput = document.querySelector(
          `input[data-row="${rowIndex + 1}"][data-col="0"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      } else {
        // Add new row and focus on first cell
        addRow();
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-row="${data.length}"][data-col="0"]`
          ) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex + 1 < data.length) {
        // Move to same column of next row
        const nextInput = document.querySelector(
          `input[data-row="${rowIndex + 1}"][data-col="${columnIndex}"]`
        ) as HTMLInputElement;
        nextInput?.focus();
      } else {
        // Add new row and focus on same column
        addRow();
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-row="${data.length}"][data-col="${columnIndex}"]`
          ) as HTMLInputElement;
          nextInput?.focus();
        }, 0);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Data Table Editor</h4>
        <p className={styles.description}>
          Enter your data in the table below. Use Tab to move between cells, Enter to move to the next row.
        </p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rowNumber}>#</th>
              {columns.map((column, columnIndex) => (
                <th key={columnIndex} className={styles.columnHeader}>
                  {editingColumn === columnIndex ? (
                    <div className={styles.columnEdit}>
                      <input
                        type="text"
                        value={columnEditValue}
                        onChange={(e) => setColumnEditValue(e.target.value)}
                        onBlur={finishEditingColumn}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditingColumn();
                          if (e.key === 'Escape') cancelEditingColumn();
                        }}
                        className={styles.columnEditInput}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className={styles.columnDisplay}>
                      <span 
                        className={styles.columnName}
                        onClick={() => startEditingColumn(columnIndex)}
                      >
                        {column}
                      </span>
                      <div className={styles.columnActions}>
                        <button
                          type="button"
                          onClick={() => startEditingColumn(columnIndex)}
                          className={styles.editColumnButton}
                          title="Rename column"
                        >
                          <PencilSimple size={14} />
                        </button>
                        {columns.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColumn(columnIndex)}
                            className={styles.removeColumnButton}
                            title="Remove column"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </th>
              ))}
              <th className={styles.addColumnCell}>
                <button
                  type="button"
                  onClick={addColumn}
                  className={styles.addColumnButton}
                  title="Add column"
                >
                  <Plus size={16} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className={styles.rowNumber}>
                  <span>{rowIndex + 1}</span>
                  {data.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className={styles.removeRowButton}
                      title="Remove row"
                    >
                      <Trash size={12} />
                    </button>
                  )}
                </td>
                {row.map((cell, columnIndex) => (
                  <td key={columnIndex} className={styles.dataCell}>
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, columnIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, columnIndex)}
                      className={`${styles.cellInput} ${cell === '' ? styles.emptyCell : ''}`}
                      data-row={rowIndex}
                      data-col={columnIndex}
                      placeholder={`Enter ${columns[columnIndex].toLowerCase()}`}
                    />
                  </td>
                ))}
                <td className={styles.addColumnCell}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={addRow}
          className={styles.addRowButton}
        >
          <Plus size={16} />
          Add Row
        </button>
        
        <div className={styles.stats}>
          {columns.length} columns, {data.length} rows
        </div>
      </div>

      <div className={styles.tips}>
        <h5>Tips:</h5>
        <ul>
          <li>Click column headers to rename them</li>
          <li>Use Tab to move to the next cell, Enter to move down</li>
          <li>Empty rows will be automatically filtered out</li>
          <li>You can add/remove columns and rows as needed</li>
        </ul>
      </div>
    </div>
  );
}