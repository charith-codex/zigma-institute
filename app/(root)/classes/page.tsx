import ClassList from "@/components/classes/class-list";
import sampleData from "@/db/sample-data";

export default function ClassesPage() {
  return (
    <div>
      <ClassList data={sampleData.classes} title="All Classes" limit={8} />
    </div>
  );
}
