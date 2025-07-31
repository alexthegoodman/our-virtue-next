"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DataTableEditor from "./DataTableEditor";
import styles from "./PovertyDataForm.module.css";

interface PovertyDataFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const DATA_TYPES = [
  { value: "poverty_rate", label: "Poverty Rate" },
  { value: "income_distribution", label: "Income Distribution" },
  { value: "housing_cost", label: "Housing Cost" },
  { value: "food_insecurity", label: "Food Insecurity" },
  { value: "employment", label: "Employment Data" },
  { value: "education", label: "Education Access" },
  { value: "healthcare", label: "Healthcare Access" },
  { value: "other", label: "Other" },
];

export default function PovertyDataForm({
  onSubmit,
  onCancel,
}: PovertyDataFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sourceUrl: "",
    sourceOrg: "",
    geographicScope: "",
    timeRange: "",
    dataType: "poverty_rate",
    submissionNotes: "",
  });
  const [dataTable, setDataTable] = useState<{
    columns: string[];
    data: any[][];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Validate data table
      if (!dataTable || !dataTable.columns.length || !dataTable.data.length) {
        throw new Error("Please add some data to the table");
      }

      // Validate that all rows have data
      const hasEmptyRows = dataTable.data.some((row) =>
        row.every((cell) => !cell || cell.toString().trim() === "")
      );

      if (hasEmptyRows) {
        throw new Error("Please remove empty rows or fill in the data");
      }

      const response = await fetch("/api/poverty-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          sourceUrl: formData.sourceUrl,
          sourceOrg: formData.sourceOrg || undefined,
          dataTable: dataTable,
          geographicScope: formData.geographicScope,
          timeRange: formData.timeRange || undefined,
          dataType: formData.dataType,
          submissionNotes: formData.submissionNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit poverty data");
      }

      onSubmit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.formTitle}>Submit Poverty Data Source</h2>
        <p className={styles.formDescription}>
          Help build our crowdsourced poverty data repository by submitting a
          data source with proper attribution. This data will be used to create
          an interactive poverty map.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              maxLength={200}
              placeholder="e.g., US Census Bureau Poverty Statistics 2023"
            />
            <small className={styles.fieldHelp}>
              A descriptive title for this data source
            </small>
          </div>

          <div className={styles.field}>
            <label htmlFor="sourceUrl">Source Attribution Link *</label>
            <input
              id="sourceUrl"
              type="url"
              value={formData.sourceUrl}
              onChange={(e) =>
                setFormData({ ...formData, sourceUrl: e.target.value })
              }
              required
              placeholder="https://example.com/data-source"
            />
            <small className={styles.fieldHelp}>
              Direct link to the original data source for proper attribution
            </small>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label htmlFor="sourceOrg">Source Organization</label>
            <input
              id="sourceOrg"
              type="text"
              value={formData.sourceOrg}
              onChange={(e) =>
                setFormData({ ...formData, sourceOrg: e.target.value })
              }
              maxLength={100}
              placeholder="e.g., US Census Bureau, World Bank, etc."
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="dataType">Data Type *</label>
            <select
              id="dataType"
              value={formData.dataType}
              onChange={(e) =>
                setFormData({ ...formData, dataType: e.target.value })
              }
              className={styles.select}
            >
              {DATA_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label htmlFor="geographicScope">Geographic Scope *</label>
            <input
              id="geographicScope"
              type="text"
              value={formData.geographicScope}
              onChange={(e) =>
                setFormData({ ...formData, geographicScope: e.target.value })
              }
              required
              maxLength={100}
              placeholder="e.g., United States, California, Global, etc."
            />
            <small className={styles.fieldHelp}>
              The geographic area this data covers
            </small>
          </div>

          <div className={styles.field}>
            <label htmlFor="timeRange">Time Range</label>
            <input
              id="timeRange"
              type="text"
              value={formData.timeRange}
              onChange={(e) =>
                setFormData({ ...formData, timeRange: e.target.value })
              }
              maxLength={50}
              placeholder="e.g., 2020-2023, Annual 2022, etc."
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            maxLength={500}
            placeholder="Brief description of what this data represents..."
          />
        </div>

        <div className={styles.field}>
          <label>Data Table *</label>
          <DataTableEditor value={dataTable} onChange={setDataTable} />
          <small className={styles.fieldHelp}>
            Enter your data in the table above. This standardized format ensures
            the data can be easily integrated into the poverty map.
          </small>
        </div>

        <div className={styles.field}>
          <label htmlFor="submissionNotes">Submission Notes</label>
          <textarea
            id="submissionNotes"
            value={formData.submissionNotes}
            onChange={(e) =>
              setFormData({ ...formData, submissionNotes: e.target.value })
            }
            rows={3}
            maxLength={500}
            placeholder="Any additional notes about this data source or submission..."
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Submitting..." : "Submit Data Source"}
          </button>
        </div>
      </form>
    </div>
  );
}
