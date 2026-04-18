import React, { useMemo, useState } from "react";

const requiredFields = ["name", "contactEmail", "contactPhone"];

const fieldConfig = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "age", label: "Age", type: "number" },
  { key: "graduationYear", label: "Graduation Year", type: "number" },
  { key: "collegeName", label: "College Name", type: "text" },
  { key: "collegeLocation", label: "College Location", type: "text" },
  { key: "yearOfStudy", label: "Year of Study", type: "text" },
  { key: "department", label: "Department", type: "text" },
  { key: "contactEmail", label: "Email", type: "email", required: true },
  { key: "contactPhone", label: "Phone", type: "tel", required: true },
];

const isValidEmail = (email = "") => /^\S+@\S+\.\S+$/.test(email.trim());
const isValidPhone = (phone = "") => {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

export function ProfileForm({ initialValues, onSave, onCancel }) {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const formTitle = useMemo(
    () => (initialValues.name || initialValues.contactEmail ? "Edit Profile" : "Add Profile"),
    [initialValues],
  );

  const handleFieldChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((field) => {
      if (!String(formValues[field] || "").trim()) {
        nextErrors[field] = "This field is required.";
      }
    });

    if (formValues.contactEmail && !isValidEmail(formValues.contactEmail)) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }

    if (formValues.contactPhone && !isValidPhone(formValues.contactPhone)) {
      nextErrors.contactPhone = "Phone number should be 10-15 digits.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    onSave(formValues);
  };

  return (
    <div className="card p-6 md:p-8">
      <h2 className="text-xl font-semibold text-black mb-6">{formTitle}</h2>
      <form onSubmit={submitForm} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {fieldConfig.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="block text-sm mb-1.5">
                {field.label}
                {field.required ? " *" : ""}
              </label>
              <input
                id={field.key}
                type={field.type}
                className="input"
                value={formValues[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
              {errors[field.key] && <p className="text-xs text-red-600 mt-1">{errors[field.key]}</p>}
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm mb-1.5">
            Bio
          </label>
          <textarea
            id="bio"
            className="input min-h-28"
            value={formValues.bio}
            onChange={(e) => handleFieldChange("bio", e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-primary">
            Save
          </button>
          <button type="button" className="btn-ghost border border-black/10" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
