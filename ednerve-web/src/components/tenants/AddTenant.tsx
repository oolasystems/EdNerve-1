
import { useState, type FormEvent } from "react";
import {
  Building2,
  UserRound,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { tenantService } from "../../services/tenant-service";
import type { CreateTenantPayload } from "../../types/tenant";

interface AddTenantProps {
  onCancel: () => void;
  onCreated: () => void;
}

interface FormData {
  code: string;
  name: string;
  slug: string;
  institution_type: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  password: string;
  password_confirmation: string;
}

const initialFormData: FormData = {
  code: "",
  name: "",
  slug: "",
  institution_type: "university",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  admin_name: "",
  admin_email: "",
  admin_phone: "",
  password: "",
  password_confirmation: "",
};

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getApiError(error: unknown): string {
  const err = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };
  };

  const errors = err.response?.data?.errors;

  if (errors) {
    return Object.values(errors).flat().join(" ");
  }

  return (
    err.response?.data?.message ||
    "Unable to create the institution. Please try again."
  );
}

function AddTenant({ onCancel, onCreated }: AddTenantProps) {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field: keyof FormData, value: string) => {
    setForm((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === "name" && !slugManuallyEdited) {
        updated.slug = generateSlug(value);
      }

      return updated;
    });

    setError("");
    setSuccess("");
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    updateField("slug", generateSlug(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.password_confirmation) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    const payload: CreateTenantPayload = {
      tenant: {
        code: form.code.trim(),
        name: form.name.trim(),
        slug: form.slug.trim(),
        institution_type: form.institution_type,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim(),
      },
      initial_admin: {
        name: form.admin_name.trim(),
        email: form.admin_email.trim(),
        phone: form.admin_phone.trim() || null,
        password: form.password,
      },
    };

    try {
      setSubmitting(true);

      await tenantService.createTenant(payload);

      setSuccess(
        "Institution and its initial administrator have been created successfully."
      );

      onCreated();
    } catch (err) {
      console.error("Unable to create institution:", err);
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tenant-form-container">
      <form onSubmit={handleSubmit} className="tenant-form">

        {error && (
          <div className="alert alert-error tenant-form-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success tenant-form-alert">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Institution Details */}
        <section className="tenant-form-section">
          <div className="tenant-form-section-heading">
            <div className="tenant-form-section-icon">
              <Building2 size={20} />
            </div>
            <div>
              <h2>Institution Details</h2>
              <p>Enter the basic information about the institution.</p>
            </div>
          </div>

          <div className="tenant-form-grid">

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-code">
                Institution Code <span className="required-mark">*</span>
              </label>
              <input
                id="tenant-code"
                className="form-control"
                value={form.code}
                onChange={(e) =>
                  updateField("code", e.target.value.toUpperCase())
                }
                placeholder="e.g. AMU"
                maxLength={50}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-name">
                Institution Name <span className="required-mark">*</span>
              </label>
              <input
                id="tenant-name"
                className="form-control"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter institution name"
                maxLength={255}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-slug">
                URL Slug <span className="required-mark">*</span>
              </label>
              <input
                id="tenant-slug"
                className="form-control"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="institution-url-slug"
                maxLength={255}
                required
              />
              <small className="tenant-field-help">
                Suggested from the institution name. You can edit it.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-type">
                Institution Type <span className="required-mark">*</span>
              </label>
              <select
                id="tenant-type"
                className="form-control"
                value={form.institution_type}
                onChange={(e) =>
                  updateField("institution_type", e.target.value)
                }
                required
              >
                <option value="university">University</option>
                <option value="college">College</option>
                <option value="college_group">College Group</option>
                <option value="autonomous_college">Autonomous College</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-email">
                Official Email
              </label>
              <input
                id="tenant-email"
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="info@institution.edu"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-phone">
                Contact Phone
              </label>
              <input
                id="tenant-phone"
                type="tel"
                className="form-control"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="Institution contact number"
              />
            </div>

            <div className="form-group tenant-form-full">
              <label className="form-label" htmlFor="tenant-website">
                Website
              </label>
              <input
                id="tenant-website"
                type="url"
                className="form-control"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="https://www.institution.edu"
              />
            </div>

            <div className="form-group tenant-form-full">
              <label className="form-label" htmlFor="tenant-address">
                Address
              </label>
              <textarea
                id="tenant-address"
                className="form-control tenant-form-textarea"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Institution address"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-city">
                City
              </label>
              <input
                id="tenant-city"
                className="form-control"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-state">
                State
              </label>
              <input
                id="tenant-state"
                className="form-control"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="State"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tenant-country">
                Country <span className="required-mark">*</span>
              </label>
              <input
                id="tenant-country"
                className="form-control"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                required
              />
            </div>

          </div>
        </section>

        {/* Initial Administrator */}
        <section className="tenant-form-section">
          <div className="tenant-form-section-heading">
            <div className="tenant-form-section-icon admin-icon">
              <UserRound size={20} />
            </div>
            <div>
              <h2>Initial Institution Administrator</h2>
              <p>
                Create the first administrator account for this institution.
              </p>
            </div>
          </div>

          <div className="tenant-form-grid">

            <div className="form-group">
              <label className="form-label" htmlFor="admin-name">
                Full Name <span className="required-mark">*</span>
              </label>
              <input
                id="admin-name"
                className="form-control"
                value={form.admin_name}
                onChange={(e) => updateField("admin_name", e.target.value)}
                placeholder="Administrator's full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                Email Address <span className="required-mark">*</span>
              </label>
              <input
                id="admin-email"
                type="email"
                className="form-control"
                value={form.admin_email}
                onChange={(e) => updateField("admin_email", e.target.value)}
                placeholder="admin@institution.edu"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-phone">
                Phone
              </label>
              <input
                id="admin-phone"
                type="tel"
                className="form-control"
                value={form.admin_phone}
                onChange={(e) => updateField("admin_phone", e.target.value)}
                placeholder="Administrator's phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password <span className="required-mark">*</span>
              </label>
              <input
                id="admin-password"
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password-confirm">
                Confirm Password <span className="required-mark">*</span>
              </label>
              <input
                id="admin-password-confirm"
                type="password"
                className="form-control"
                value={form.password_confirmation}
                onChange={(e) =>
                  updateField("password_confirmation", e.target.value)
                }
                autoComplete="new-password"
                required
              />
            </div>

          </div>
        </section>

        {/* Form Actions */}
        <div className="tenant-form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            <ArrowLeft size={16} />
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <Save size={16} />
            {submitting ? "Creating Institution..." : "Create Institution"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default AddTenant;
