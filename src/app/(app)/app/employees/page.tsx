import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, Th, Td } from "@/components/ui/table";
import { EmployeeToolbar } from "./toolbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, sanitizeSearch } from "@/lib/utils";

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const { q, page, status } = await searchParams;
  const currentPage = Math.max(Number(page || "1") || 1, 1);
  const pageSize = 20;
  const from = (currentPage - 1) * pageSize;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const queryText = q ? sanitizeSearch(q) : "";
  let query = supabase
    .from("employees")
    .select("id, employee_code, full_name, email, phone, employment_status, joining_date, user_id, departments(name), designations(name)", {
      count: "exact",
    })
    .is("deleted_at", null)
    .order("full_name")
    .range(from, from + pageSize - 1);

  if (queryText) {
    query = query.or(`full_name.ilike.%${queryText}%,email.ilike.%${queryText}%,employee_code.ilike.%${queryText}%`);
  }
  if (status) {
    query = query.eq("employment_status", status);
  }

  const { data, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));

  return (
    <>
      <PageHeader
        title="Employees"
        description="Directory, employment status, app logins, and bulk import. Plan limits are enforced on save."
        action={{ href: "/app/employees/new", label: "Add employee" }}
      />
      <EmployeeToolbar />
      {!data?.length ? (
        <EmptyState title="No employees yet" description="Add one person or import a CSV with full_name, employee_code, email, and phone columns." />
      ) : (
        <Table>
          <THead>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Department</Th>
            <Th>Designation</Th>
            <Th>Status</Th>
            <Th>App login</Th>
            <Th>Joined</Th>
          </THead>
          <tbody>
            {data.map((employee) => (
              <tr key={employee.id}>
                <Td>{employee.employee_code}</Td>
                <Td>
                  <Link href={`/app/employees/${employee.id}`} className="font-medium text-brand">
                    {employee.full_name}
                  </Link>
                  <p className="text-xs text-muted">{employee.email}</p>
                </Td>
                <Td>{(employee.departments as { name?: string } | null)?.name || "—"}</Td>
                <Td>{(employee.designations as { name?: string } | null)?.name || "—"}</Td>
                <Td>
                  <Badge tone={employee.employment_status === "active" ? "success" : "warning"}>{employee.employment_status}</Badge>
                </Td>
                <Td>
                  <Badge tone={employee.user_id ? "success" : "default"}>{employee.user_id ? "Yes" : "Not created"}</Badge>
                </Td>
                <Td>{formatDate(employee.joining_date)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <p>
          {count ?? 0} people · page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-3">
          {currentPage > 1 ? (
            <Link href={`/app/employees?page=${currentPage - 1}${queryText ? `&q=${encodeURIComponent(queryText)}` : ""}${status ? `&status=${status}` : ""}`} className="text-brand">
              Previous
            </Link>
          ) : null}
          {currentPage < totalPages ? (
            <Link href={`/app/employees?page=${currentPage + 1}${queryText ? `&q=${encodeURIComponent(queryText)}` : ""}${status ? `&status=${status}` : ""}`} className="text-brand">
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
