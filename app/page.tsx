import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <p className="text-sky-600">Home</p>
      <div className="flex items-center gap-2">
        <Image src="/logo.png" alt="zigma" width={32} height={32} /> 
        <h2 className="font-bold text-2xl">Zigma Institute</h2>
      </div>
      <Button>Click me</Button>
    </div>
  )
}
