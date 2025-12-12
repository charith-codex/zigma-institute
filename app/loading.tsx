import { FlowerLoader } from "@/components/ui/flower-loader";

export default function LoadingPage() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <FlowerLoader size="lg" className="text-[#A41FC5]" />
    </div>
  );
}
