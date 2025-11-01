"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQRAttendanceSessions, useClasses } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Clock, Users, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

const AttendanceQR = () => {
  const { qrSessions, loading, refetch } = useQRAttendanceSessions();
  const { classes } = useClasses();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [qrCode, setQrCode] = useState("");

  const generateQRSession = async () => {
    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class",
      });
      return;
    }

    try {
      const sessionCode = Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2); // 2 hour expiry

      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      setQrCode(sessionCode);
      toast({
        title: "QR Session Created",
        description:
          "Attendance QR code session has been generated successfully.",
      });

      refetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    }
  };

  const markAttendance = async (sessionCode: string) => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const sessionData = null; // Replace with actual session lookup
      const error = null; // Replace with actual database call

      if (!sessionData) {
        toast({
          title: "Error",
          description: "Invalid QR code or session expired",
        });
        return;
      }

      toast({
        title: "Attendance Marked",
        description: "Your attendance has been successfully recorded.",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      // TODO: Implement with Neon PostgreSQL
      const error = null; // Replace with actual database call

      if (error) throw error;

      toast({
        title: "Session Ended",
        description: "QR attendance session has been ended.",
      });

      refetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) return <div>Loading attendance QR...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">QR Code Attendance</h2>
          <p className="text-muted-foreground">
            Manage attendance through QR code scanning
          </p>
        </div>
        {(session?.user?.role === "teacher" ||
          session?.user?.role === "admin") && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <QrCode className="mr-2 h-4 w-4" />
                Generate QR Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate QR Attendance Session</DialogTitle>
                <DialogDescription>
                  Create a QR code for students to mark their attendance
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.courses?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={generateQRSession} className="w-full">
                  Generate QR Code
                </Button>

                {qrCode && (
                  <div className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                      QR Code Generated: {qrCode}
                    </div>
                    <div className="bg-white p-4 border rounded-lg inline-block">
                      {/* In a real implementation, you'd generate an actual QR code image */}
                      <div className="w-32 h-32 bg-black text-white flex items-center justify-center text-xs">
                        QR: {qrCode}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Students can scan this code to mark attendance
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {session?.user?.role === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>
              Scan the QR code shown by your teacher to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter QR code or scan"
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      markAttendance((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <Button variant="outline">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qrSessions.filter((session) => session.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrSessions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Attendance Sessions</CardTitle>
          <CardDescription>All QR code attendance sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.class?.name}</TableCell>
                  <TableCell>
                    {new Date(session.session_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {session.qr_code}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={session.is_active ? "default" : "secondary"}
                    >
                      {session.is_active ? "Active" : "Ended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(session.expires_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {session.is_active &&
                      (session?.user?.role === "teacher" ||
                        session?.user?.role === "admin") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => endSession(session.id)}
                        >
                          End Session
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceQR;
