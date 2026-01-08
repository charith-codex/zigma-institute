"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, IdCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  getStudentIdCardData,
  type StudentIdCardData,
} from "@/lib/actions/student-profile";

export function StudentIdCardDisplay() {
  const [data, setData] = useState<StudentIdCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getStudentIdCardData();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error ?? "Failed to load ID card data");
          toast.error(result.error ?? "Failed to load ID card data");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadIdCard = async () => {
    if (!data?.idCardUrl) return;

    try {
      if (data.idCardUrl.startsWith("data:image/svg+xml")) {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1960;
          canvas.height = 1160;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `student-id-${data.studentPublicId || "card"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("ID card downloaded as PNG");
          }
        };
        img.src = data.idCardUrl;
      } else {
        const response = await fetch(data.idCardUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `student-id-${data.studentPublicId || "card"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("ID card downloaded successfully");
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download ID card");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <FlowerLoader size="md" className="text-primary" />
        <p className="text-muted-foreground animate-pulse">
          Loading ID Card...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IdCard className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h4 className="text-lg font-semibold mb-2">Unavailable</h4>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {error || "Could not load student information."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Student ID Card</h2>
        <p className="text-muted-foreground">
          View and download your digital student identity card.
        </p>
      </div>

      <Card className="border-border/50 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <IdCard className="h-5 w-5 text-primary" />
            Digital ID
          </CardTitle>
          <CardDescription>
            This ID card acts as your official proof of student status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 bg-muted/30">
          {data.idCardUrl ? (
            <div className="w-full max-w-2xl relative group">
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background shadow-xl">
                <Image
                  src={data.idCardUrl}
                  alt="Student ID card"
                  width={960}
                  height={560}
                  className="h-auto w-full transform transition duration-500 hover:scale-[1.02]"
                  unoptimized
                />
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  variant="default"
                  size="default"
                  onClick={handleDownloadIdCard}
                  className="bg-[#A41FC5] hover:bg-[#A41FC5]/90 text-white gap-2 px-8 rounded-xl shadow-lg transition-all active:scale-95 font-semibold"
                >
                  <Download className="h-4 w-4" />
                  Download ID Card
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-muted/50 rounded-2xl border-2 border-dashed w-full max-w-md">
              <IdCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-sm font-bold mb-1">No ID Card Generated</h3>
              <p className="text-xs text-muted-foreground">
                Your student ID card has not been generated yet. Please contact
                administration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <p className="flex gap-2">
          <span className="font-bold">Note:</span>
          Please keep this ID card saved on your device for quick access during
          physical exams and institute entry.
        </p>
      </div>
    </div>
  );
}
