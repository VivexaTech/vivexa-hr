import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const reports = [
  { type: "attendance", title: "Attendance", text: "Daily marks with date filters." },
  { type: "leave", title: "Leave", text: "Requests and status." },
  { type: "employees", title: "Employees", text: "Directory export." },
  { type: "payroll", title: "Payroll", text: "Latest calculated items." },
  { type: "departments", title: "Departments", text: "Department directory." },
  { type: "branches", title: "Branches", text: "Branch locations and geofences." },
];

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" description="Exports are generated on the server with a record cap so large companies stay responsive." />
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardTitle>{report.title}</CardTitle>
            <CardDescription>{report.text}</CardDescription>
            <a href={`/api/reports/export?type=${report.type}`} className="mt-4 inline-block text-sm font-medium text-brand">
              Download CSV
            </a>
          </Card>
        ))}
      </div>
    </>
  );
}
