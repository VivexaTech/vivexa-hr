export const faqs = [
  {
    question: "What is included in the Free plan?",
    answer:
      "The Free plan includes one company, up to five employees, employee management, basic attendance, leave management, employee profiles, basic notices, and a basic dashboard. Core HR work is not turned off on the Free plan.",
  },
  {
    question: "Can more than one company use Vivexa HR?",
    answer:
      "Yes. Vivexa HR is built as a multi-tenant product. Each company has its own employees, attendance, leaves, payroll, and documents. One company cannot access another company's data.",
  },
  {
    question: "Does the employee Android app work without the web dashboard?",
    answer:
      "The Android app is for employees. HR teams use the web dashboard to manage people, approve requests, and run payroll. Both connect to the same company workspace.",
  },
  {
    question: "How does attendance work?",
    answer:
      "Employees can check in and check out from the Android app. Your company sets working hours, grace periods, shifts, and optional geofencing. The server validates attendance events instead of trusting the phone alone.",
  },
  {
    question: "Can we import employees in bulk?",
    answer:
      "Yes. HR can add people one by one or import a CSV or Excel file during onboarding and later from the employee directory.",
  },
  {
    question: "Is payroll required on the Free plan?",
    answer:
      "No. Payroll is available according to your plan configuration. The Free plan focuses on employees, attendance, leaves, and day-to-day HR. Plan features can be updated by the platform administrator without changing the product code.",
  },
  {
    question: "Where are employee documents stored?",
    answer:
      "Document files are stored outside the database, using Cloudinary or S3-compatible storage. Vivexa HR keeps metadata such as type, owner, and access information.",
  },
  {
    question: "How long is detailed attendance kept?",
    answer:
      "By default, detailed daily attendance is retained for six months. Monthly summaries are kept so reports still work after older daily records are archived. Retention can be set to 6, 12, or 24 months, and records needed for payroll or legal reasons should not be removed automatically.",
  },
];
