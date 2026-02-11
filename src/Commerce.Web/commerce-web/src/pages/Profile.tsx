import { useEffect, useMemo, useState } from "react";
import { getUser, updateUser } from "../api/user/UserApiClient";
import styles from "./Profile.module.css";
import { useMsal } from "@azure/msal-react";
import type { CustomerDto, ShippingAddress, UpdateCustomerRequest } from "../types/Customer";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: ShippingAddress
};


export default function Profile() {
  const initial: ProfileForm = useMemo(
    () => ({
      firstName: "John",
      lastName: "Doe",
      email: "email@example.com",
      phone: "",
      shippingAddress: {
        line1: "",
        line2: "",
        city: "",
        province: "AB",
        postalCode: "",
        country: "Canada",
      }
    }),
    []
  );
  const { instance } = useMsal();
  const account = instance.getActiveAccount();
  const [form, setForm] = useState<ProfileForm>(initial);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function mapUserToProfileForm(c: CustomerDto): ProfileForm {
    return {
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        email: c.email ?? "",
        phone: "",
        shippingAddress: {
        ...initial.shippingAddress,
        ...(c.shippingAddress ?? {}),
        },
    };
    }

  useEffect(() => {
    let ignore = false;

    (async () => {
        const account = instance.getActiveAccount();
        if (!account){ return; }

        const { accessToken } = await instance.acquireTokenSilent({
            scopes: [import.meta.env.VITE_API_SCOPE!],
            account,
        });

        const user = await getUser(accessToken);
        if (!ignore) setForm(mapUserToProfileForm(user));
    })().catch(console.error);

    return () => { ignore = true; };
    }, [instance]);

  function onChange<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onShippingChange<K extends keyof ShippingAddress>(
  key: K,
  value: ShippingAddress[K]) 
  {
    setForm(prev => ({
        ...prev,
        shippingAddress: {
        ...prev.shippingAddress,
        [key]: value,
        },
    }));
  }

  function onEdit() {
    setMessage(null);
    setIsEditing(true);
  }

  function onCancel() {
    setForm(initial);
    setMessage(null);
    setIsEditing(false);
  }

  async function onSave() {
    if (!account) {
        setMessage("Please sign in first.");
        return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
        const request: UpdateCustomerRequest = {
        firstName: form.firstName,
        lastName: form.lastName,
        shippingAddress: form.shippingAddress,
        };

        const { accessToken } = await instance.acquireTokenSilent({
        scopes: [import.meta.env.VITE_API_SCOPE!],
        account,
        });

        await updateUser(request, accessToken);

        setMessage("Saved.");
        setIsEditing(false);
    } catch (e) {
        console.error(e);
        setMessage("Could not save. Try again.");
    } finally {
        setIsSaving(false);
    }
    }


  if (!account) {
    return (
    <div className={styles.page}>Please sign in to view your profile.
     <button
          onClick={() =>
            instance.loginRedirect({
              scopes: [import.meta.env.VITE_API_SCOPE!],
              prompt: "login",
            })
          }
        >
          Sign in
        </button>
    </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Your Profile</h1>
          <p className={styles.subtitle}>
            Update your account details and shipping info.
          </p>
        </div>

        <div className={styles.actions}>
          {!isEditing ? (
            <button className={styles.primary} onClick={onEdit}>
              Edit profile
            </button>
          ) : (
            <>
              <button
                className={styles.primary}
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button className={styles.ghost} onClick={onCancel} disabled={isSaving}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {message && <div className={styles.banner}>{message}</div>}

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Account</div>

        <div className={styles.grid}>
          <Field
            label="First name"
            value={form.firstName}
            disabled={!isEditing}
            onChange={(v) => onChange("firstName", v)}
          />
          <Field
            label="Last name"
            value={form.lastName}
            disabled={!isEditing}
            onChange={(v) => onChange("lastName", v)}
          />
          <Field
            label="Phone"
            value={form.phone}
            disabled={!isEditing}
            placeholder="(optional)"
            onChange={(v) => onChange("phone", v)}
          />
          <Field
            label="Email"
            value={form.email}
            disabled={true} 
            onChange={(v) => onChange("email", v)}
          />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Shipping address</div>

        <div className={styles.grid}>
          <Field
            label="Address line 1"
            value={form.shippingAddress.line1}
            disabled={!isEditing}
            onChange={(v) => onShippingChange("line1", v)}
          />
          <Field
            label="Address line 2"
            value={form.shippingAddress.line2}
            disabled={!isEditing}
            placeholder="Apt / Unit / Floor (optional)"
            onChange={(v) => onShippingChange("line2", v)}
          />
          <Field
            label="City"
            value={form.shippingAddress.city}
            disabled={!isEditing}
            onChange={(v) => onShippingChange("city", v)}
          />
          <div className={styles.row}>
            <div className={styles.rowItem}>
              <label className={styles.label}>Province</label>
              <select
                className={styles.select}
                value={form.shippingAddress.province}
                disabled={!isEditing}
                onChange={(e) => onShippingChange("province", e.target.value)}
              >
                <option value="AB">Alberta</option>
                <option value="BC">British Columbia</option>
                <option value="MB">Manitoba</option>
                <option value="NB">New Brunswick</option>
                <option value="NL">Newfoundland and Labrador</option>
                <option value="NS">Nova Scotia</option>
                <option value="NT">Northwest Territories</option>
                <option value="NU">Nunavut</option>
                <option value="ON">Ontario</option>
                <option value="PE">Prince Edward Island</option>
                <option value="QC">Quebec</option>
                <option value="SK">Saskatchewan</option>
                <option value="YT">Yukon</option>
              </select>
            </div>

            <Field
              label="Postal code"
              value={form.shippingAddress.postalCode}
              disabled={!isEditing}
              placeholder="e.g. T5J 0N3"
              onChange={(v) => onShippingChange("postalCode", v)}
            />
          </div>

          <Field
            label="Country"
            value={form.shippingAddress.country}
            disabled={true}
            onChange={(v) => onShippingChange("country", v)}
          />
        </div>

        {!isEditing && (
          <div className={styles.mutedNote}>
            Tip: click <strong>Edit profile</strong> to make changes.
          </div>
        )}
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  disabled: boolean;
  placeholder?: string;
  hint?: string;
  onChange: (value: string) => void;
}) 
{
  return (
    <div className={styles.field}>
      <label className={styles.label}>{props.label}</label>
      <input
        className={styles.input}
        value={props.value}
        disabled={props.disabled}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint && <div className={styles.hint}>{props.hint}</div>}
    </div>
  );
}
