"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
}

export default function FreeBookPage() {
  const pathname = usePathname();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isRTL, setIsRTL] = useState(false);

  // Detect RTL languages (Arabic, Urdu)
  useEffect(() => {
    const rtlLanguages = ["ar", "ur"];
    const currentLang = pathname.split("/")[1];
    setIsRTL(rtlLanguages.includes(currentLang));
  }, [pathname]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/book-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message,
        });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          notes: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message:
            data.error || "An error occurred while submitting your request.",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container} dir={isRTL ? "rtl" : "ltr"}>
      <div className={styles.header}>
        <h1>Get Your Free Copy</h1>
        <p className={styles.subtitle}>
          Request a free physical copy of &ldquo;Our Virtue: An Introduction to
          God&rdquo; to be shipped to your address.
        </p>
        <div className={styles.shippingNotice}>
          <p>
            <strong>Please note:</strong> Due to logistical delays, shipping may
            take 2-4 weeks or more. <br /> All books are shipped at no cost to
            you.
          </p>
        </div>
      </div>

      {submitStatus && (
        <div
          className={
            submitStatus.type === "success"
              ? styles.successMessage
              : styles.errorMessage
          }
        >
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSubmitting}
              placeholder="Include country code (e.g., +1 555-123-4567)"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Street Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            placeholder="Full street address including apartment/unit number"
          />
        </div>

        <div className={`${styles.formRow} ${styles.addressRow}`}>
          <div className={styles.formGroup}>
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="state">State/Province/Region *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="e.g., California, Ontario, Punjab, Tokyo, etc."
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="zipCode">ZIP/Postal Code *</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              placeholder="e.g., 12345, M5V 3A8, 100001, etc."
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="country">Country *</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="India">India</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Singapore">Singapore</option>
            <option value="Philippines">Philippines</option>
            <option value="Thailand">Thailand</option>
            <option value="Vietnam">Vietnam</option>
            <option value="South Korea">South Korea</option>
            <option value="Japan">Japan</option>
            <option value="China">China</option>
            <option value="Taiwan">Taiwan</option>
            <option value="Hong Kong">Hong Kong</option>
            <option value="Saudi Arabia">Saudi Arabia</option>
            <option value="United Arab Emirates">United Arab Emirates</option>
            <option value="Qatar">Qatar</option>
            <option value="Kuwait">Kuwait</option>
            <option value="Oman">Oman</option>
            <option value="Bahrain">Bahrain</option>
            <option value="Jordan">Jordan</option>
            <option value="Lebanon">Lebanon</option>
            <option value="Egypt">Egypt</option>
            <option value="Morocco">Morocco</option>
            <option value="Tunisia">Tunisia</option>
            <option value="Algeria">Algeria</option>
            <option value="Spain">Spain</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
            <option value="Italy">Italy</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Belgium">Belgium</option>
            <option value="Switzerland">Switzerland</option>
            <option value="Austria">Austria</option>
            <option value="Sweden">Sweden</option>
            <option value="Norway">Norway</option>
            <option value="Denmark">Denmark</option>
            <option value="Finland">Finland</option>
            <option value="Mexico">Mexico</option>
            <option value="Brazil">Brazil</option>
            <option value="Argentina">Argentina</option>
            <option value="Chile">Chile</option>
            <option value="Colombia">Colombia</option>
            <option value="Peru">Peru</option>
            <option value="Venezuela">Venezuela</option>
            <option value="South Africa">South Africa</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Kenya">Kenya</option>
            <option value="Ghana">Ghana</option>
            <option value="Ethiopia">Ethiopia</option>
            <option value="New Zealand">New Zealand</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={3}
            placeholder="Any special delivery instructions or messages..."
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting Request..." : "Request Free Book"}
        </button>
      </form>

      <div className={styles.footer}>
        <p>
          Your information will only be used for shipping purposes and will not
          be shared with third parties. This is a one-time request per address
          to ensure everyone has the opportunity to receive a copy.
        </p>
      </div>
    </div>
  );
}
