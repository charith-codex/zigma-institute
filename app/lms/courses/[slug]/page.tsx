import { getCourseBySlug } from "@/lib/actions/course";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function CourseDetailsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const course = await getCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  return (
    <div>
      <h2>{course.name}</h2>
      <Image
        loading="lazy"
        src={course.coverImage}
        alt={course.name}
        width={600}
        height={400}
      />
      <p>{course.description}</p>
      <p>{course.teacherName}</p>
    </div>
  );
}
