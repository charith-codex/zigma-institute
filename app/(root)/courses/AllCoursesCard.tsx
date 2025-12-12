"use client";

import { useMemo, useState } from "react";
import CourseCard from "@/components/courses/course-card";
import { Input } from "@/components/ui/input";
import { Course } from "@/types";

const categories = [
  { key: "professional", title: "Professional" },
  { key: "advanced level", title: "Advanced Level" },
  { key: "ordinary level", title: "Ordinary Level" },
];

const normalize = (value: string | null | undefined) =>
  value?.trim().toLowerCase() ?? "";

const AllCoursesCard = ({ data }: { data: Course[] }) => {
  const [nameQuery, setNameQuery] = useState<string>("");

  const filteredCourses = useMemo(() => {
    const normalizedName = normalize(nameQuery);

    return data.filter((course) => {
      return (
        normalizedName.length === 0 ||
        normalize(course.name).includes(normalizedName) ||
        normalize(course.slug).includes(normalizedName)
      );
    });
  }, [data, nameQuery]);

  const categorizedCourses = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        courses: filteredCourses.filter(
          (course) => normalize(course.courseCategory?.name) === category.key
        ),
      })),
    [filteredCourses]
  );

  const hasResults = filteredCourses.length > 0;

  return (
    <div className="my-10 space-y-8">
      <div className="space-y-2 w-sm">
        <Input
          id="course-name"
          placeholder="Search course by name"
          value={nameQuery}
          onChange={(event) => setNameQuery(event.target.value)}
        />
      </div>

      {hasResults ? (
        <div className="space-y-10">
          {categorizedCourses.map((category) => (
            <section key={category.key} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Courses curated for the {category.title.toLowerCase()}{" "}
                    track.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.courses.length} course
                  {category.courses.length === 1 ? "" : "s"}
                </p>
              </div>

              {category.courses.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.courses.map((course) => (
                    <CourseCard
                      key={course.slug}
                      course={course}
                      showDescription
                      clickable={false}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No courses in this category match your search.
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
          <p>
            No courses found. Adjust your search terms to see available
            programs.
          </p>
        </div>
      )}
    </div>
  );
};

export default AllCoursesCard;
