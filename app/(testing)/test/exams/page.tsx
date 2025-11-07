// import { ClassContentManager } from "@/components/cms/ClassContentManager";
import { ExamBuilder } from "@/components/cms/ExamBuilder";
// import { ExamResults } from "@/components/cms/ExamResults";
import { QuestionCreation } from "@/components/cms/QuestionCreation";
import React from "react";

export default function page() {
  return (
    <div>
      <ExamBuilder />
      {/* <ClassContentManager/> */}
      {/* <ExamResults classId="13" /> */}
      <QuestionCreation />
    </div>
  );
}
