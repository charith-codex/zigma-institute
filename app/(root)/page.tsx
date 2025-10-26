import Link from "next/link";

export default function ShowcaseSite() {
  return (
    <div className="flex gap-10">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/lms">LMS</Link>
        <Link href="/lms-cms">LMS CMS</Link>
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/courses">Courses</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/student-register">Student Register</Link>
      </div>
    </div>
  );
}
