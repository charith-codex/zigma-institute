"use client";

import React, { useState, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MarkedStudent = {
  id: string;
  timestamp: string;
};

const AttendanceQR = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedStudent, setScannedStudent] = useState<string | null>(null);
  const [students, setStudents] = useState<MarkedStudent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock function to mark attendance (you can replace with API/DB call)
  const markAttendance = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      // Example delay (simulate API call)
      await new Promise((resolve) => setTimeout(resolve, 600));

      const timestamp = new Date().toLocaleString();
      setStudents((prev) => [
        { id: studentId, timestamp },
        ...prev.filter((s) => s.id !== studentId),
      ]);
      setScannedStudent(studentId);
    } catch {
      setError("Failed to mark attendance");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScan = (result: any) => {
    if (!result) return;
    let studentId = "";
    if (typeof result === "string") studentId = result.trim();
    else if (Array.isArray(result) && result[0]?.rawValue)
      studentId = result[0].rawValue.trim();

    if (studentId) {
      markAttendance(studentId);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleError = (err: any) => {
    setError(err?.message || "Camera access or scan error");
    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Student Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {!scanning ? (
            <Button
              onClick={() => {
                setError(null);
                setScannedStudent(null);
                setScanning(true);
              }}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Scan Student ID
            </Button>
          ) : (
            <div className="relative w-full aspect-square bg-black rounded-lg overflow-hidden">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                allowMultiple={false}
                components={{ finder: true }}
                constraints={{ facingMode: "environment" }}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => setScanning(false)}
              >
                Stop
              </Button>
            </div>
          )}

          {/* Loading / success message */}
          {loading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Marking attendance...</span>
            </div>
          )}
          {scannedStudent && !loading && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Attendance marked for ID: {scannedStudent}</span>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* List of marked students */}
          {students.length > 0 && (
            <div className="w-full mt-4 space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Marked Students
              </h4>
              <div className="border rounded-md p-2 space-y-1 text-sm">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center py-1 border-b last:border-0"
                  >
                    <span className="font-mono">{s.id}</span>
                    <Badge variant="secondary">{s.timestamp}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceQR;
