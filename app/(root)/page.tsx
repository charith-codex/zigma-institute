import Link from "next/link";

export default function ShowcaseSite() {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/lms">LMS</Link>
        <Link href="/lms-cms">LMS CMS</Link>
      </div>
    </div>
  );
}
