import ClassCard from "./class-card";

const ClassList = ({
  data,
  title,
  limit,
}: {
  data: any;
  title: string;
  limit?: number;
}) => {
  const limitData = limit ? data.slice(0, limit) : data;
  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {limitData.map((classItem: any) => (
          <ClassCard key={classItem.slug} classItem={classItem}/>
          ))}
        </div>
      ) : (
        <div>
          <p>No Classes Available</p>
        </div>
      )}
    </div>
  );
};

export default ClassList;
