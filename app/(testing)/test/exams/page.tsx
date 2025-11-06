// import { ClassContentManager } from "@/components/cms/ClassContentManager";
import { ExamBuilder } from "@/components/cms/ExamBuilder";
// import { ExamResults } from "@/components/cms/ExamResults";
import { QuestionAuthoring } from "@/components/cms/QuestionAuthoring";
import React from "react";

export default function page() {
  return (
    <div>
      <ExamBuilder />
      {/* <ClassContentManager/> */}
      {/* <ExamResults classId="13" /> */}
      <QuestionAuthoring />
    </div>
  );
}
