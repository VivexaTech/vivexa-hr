"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Alert } from "@/components/ui/states";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const WEEKDAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export function SettingsForm({
  companyId,
  settings,
}: {
  companyId: string;
  settings: {
    office_start: string;
    office_end: string;
    grace_period_minutes: number;
    geofence_required: boolean;
    attendance_retention_months: number;
    retain_for_payroll: boolean;
    retain_for_legal: boolean;
    default_geofence_radius_m: number;
    working_days?: number[];
  };
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const workingDays = settings.working_days ?? [1, 2, 3, 4, 5];

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const supabase = createBrowserSupabaseClient();
        const form = new FormData(event.currentTarget);
        const days = WEEKDAYS.filter((day) => form.get(`day_${day.value}`)).map((day) => day.value);
        const { error: saveError } = await supabase!
          .from("company_settings")
          .update({
            office_start: form.get("office_start"),
            office_end: form.get("office_end"),
            grace_period_minutes: Number(form.get("grace_period_minutes")),
            late_mark_after_minutes: Number(form.get("grace_period_minutes")),
            geofence_required: form.get("geofence_required") === "on",
            attendance_retention_months: Number(form.get("attendance_retention_months")),
            retain_for_payroll: form.get("retain_for_payroll") === "on",
            retain_for_legal: form.get("retain_for_legal") === "on",
            default_geofence_radius_m: Number(form.get("default_geofence_radius_m")),
            working_days: days,
            week_off_days: WEEKDAYS.map((day) => day.value).filter((value) => !days.includes(value)),
          })
          .eq("company_id", companyId);
        if (saveError) {
          setError("Unable to save settings.");
          return;
        }
        setError("");
        setMessage("Settings saved.");
        router.refresh();
      }}
    >
      {error ? <Alert tone="error">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Working days</legend>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((day) => (
            <label key={day.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`day_${day.value}`} defaultChecked={workingDays.includes(day.value)} />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <Label htmlFor="office_start">Office start</Label>
        <Input id="office_start" name="office_start" type="time" defaultValue={String(settings.office_start).slice(0, 5)} />
      </div>
      <div>
        <Label htmlFor="office_end">Office end</Label>
        <Input id="office_end" name="office_end" type="time" defaultValue={String(settings.office_end).slice(0, 5)} />
      </div>
      <div>
        <Label htmlFor="grace_period_minutes">Grace period (minutes)</Label>
        <Input id="grace_period_minutes" name="grace_period_minutes" type="number" defaultValue={settings.grace_period_minutes} />
      </div>
      <div>
        <Label htmlFor="default_geofence_radius_m">Default geofence (meters)</Label>
        <Input id="default_geofence_radius_m" name="default_geofence_radius_m" type="number" defaultValue={settings.default_geofence_radius_m} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="geofence_required" defaultChecked={settings.geofence_required} />
        Require geofence for attendance
      </label>
      <div>
        <Label htmlFor="attendance_retention_months">Detailed attendance retention</Label>
        <select
          id="attendance_retention_months"
          name="attendance_retention_months"
          defaultValue={settings.attendance_retention_months}
          className="h-11 w-full rounded-lg border border-line px-3 text-sm"
        >
          <option value="6">6 months</option>
          <option value="12">12 months</option>
          <option value="24">24 months</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="retain_for_payroll" defaultChecked={settings.retain_for_payroll} />
        Keep detailed attendance when needed for payroll
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="retain_for_legal" defaultChecked={settings.retain_for_legal} />
        Keep detailed attendance when needed for legal or policy reasons
      </label>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
