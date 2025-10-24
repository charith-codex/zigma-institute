import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

const ClassCard = ({ classItem }: { classItem: any }) => {
  console.log(classItem);
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/class/${classItem.slug}`}>
          <Image
            src={classItem.cover_image}
            alt={classItem.name}
            height={300}
            width={300}
            priority={true}
            className="px-3"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="text-xs">{classItem.brand}</div>
        <Link href={`/class/${classItem.slug}`}>
          <h2 className="font-bold">{classItem.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <p className="text-sm font-medium">{classItem.teacher.name}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassCard;
