import { getCourseBySlug } from "@/lib/actions/course";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CoursePurchaseButton } from "@/components/courses/course-purchase-button";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CourseDetailsPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ success?: string; canceled?: string }>;
}) {
  const { slug } = await props.params;
  const resolvedSearchParams = props.searchParams
    ? await props.searchParams
    : {};
  const { success, canceled } = resolvedSearchParams;

  const course = await getCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  const priceLabel = formatCurrency(course.priceInCents, course.currency);
  const showSuccess = success === "true";
  const showCanceled = canceled === "true";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{course.name}</h2>
        <p className="text-muted-foreground">Taught by {course.teacherName}</p>
        <p className="text-xl font-semibold text-primary">{priceLabel}</p>
      </div>
      <Image
        loading="lazy"
        src={course.coverImage}
        alt={course.name}
        width={600}
        height={400}
        className="w-full max-w-3xl rounded-md object-cover"
      />
      <div className="space-y-4">
        {showSuccess ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Thank you for your purchase! Check your email for further
            instructions.
          </div>
        ) : null}
        {showCanceled ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Checkout was cancelled. You can restart the process at any time.
          </div>
        ) : null}
        <p className="text-base leading-relaxed text-muted-foreground">
          {course.description}
        </p>
      </div>
      <CoursePurchaseButton courseId={course.id} className="w-full sm:w-auto" />
    </div>
  );
}
