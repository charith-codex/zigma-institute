"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Trophy,
  Medal,
  ClipboardList,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { FlowerLoader } from "@/components/ui/flower-loader";
import {
  getCourseAnalytics,
  type StudentAnalyticsData,
  type PaperData,
} from "@/lib/actions/course-analytics";
import { Badge } from "@/components/ui/badge";

interface CourseAnalyticsProps {
  courseId: string;
}

export function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const [data, setData] = useState<StudentAnalyticsData[]>([]);
  const [papers, setPapers] = useState<PaperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPapers, setExpandedPapers] = useState<Record<string, boolean>>(
    {}
  );

  const togglePaper = (paperId: string) => {
    setExpandedPapers((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getCourseAnalytics(courseId);
        setData(result.summary);
        setPapers(result.papers);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  const filteredData = useMemo(() => {
    return data
      .filter(
        (student) =>
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.studentPublicId
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (a.attendedAll !== b.attendedAll) {
          return a.attendedAll ? -1 : 1;
        }
        return (b.overallMark || 0) - (a.overallMark || 0);
      });
  }, [data, searchQuery]);

  // Identify top 3 from the FULL sorted data (not just filtered)
  const topThreeIds = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (a.attendedAll !== b.attendedAll) {
        return a.attendedAll ? -1 : 1;
      }
      return (b.overallMark || 0) - (a.overallMark || 0);
    });
    return sorted.slice(0, 3).map((s) => s.userId);
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <FlowerLoader size="md" className="text-primary" />
      </div>
    );
  }

  const getRankStyle = (userId: string, overallMark: number | null) => {
    if (overallMark === null || overallMark === 0) return "";
    const rankIndex = topThreeIds.indexOf(userId);
    if (rankIndex === 0)
      return "bg-red-500/10 border-red-500/50 hover:bg-red-500/20";
    if (rankIndex === 1)
      return "bg-sky-400/10 border-sky-400/50 hover:bg-sky-400/20";
    if (rankIndex === 2)
      return "bg-amber-600/10 border-amber-600/50 hover:bg-amber-600/20";
    return "";
  };

  const getRankBadge = (userId: string, overallMark: number | null) => {
    if (overallMark === null || overallMark === 0) return null;
    const rankIndex = topThreeIds.indexOf(userId);
    if (rankIndex === 0)
      return (
        <Badge className="bg-red-500 text-white">
          <Trophy className="w-3 h-3 mr-1" /> 1st
        </Badge>
      );
    if (rankIndex === 1)
      return (
        <Badge className="bg-sky-400 text-white">
          <Medal className="w-3 h-3 mr-1" /> 2nd
        </Badge>
      );
    if (rankIndex === 2)
      return (
        <Badge className="bg-amber-600 text-white">
          <Medal className="w-3 h-3 mr-1" /> 3rd
        </Badge>
      );
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-10 pb-10 px-0 sm:px-2">
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Student Analytics of Course
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Comprehensive performance tracking and student rankings.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-border/60 focus-visible:ring-slate-500/30"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                Overall exams
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto px-2 sm:px-5 pb-5">
            <div className="border border-border/60 rounded-lg overflow-hidden glass-morphism shadow-inner">
              <Table className="min-w-[800px] lg:min-w-full">
                <TableHeader className="dark:bg-primary/70 bg-primary">
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead className="w-[150px] text-white font-semibold ">
                      Student ID
                    </TableHead>
                    <TableHead className="text-white font-semibold ">
                      Student Name
                    </TableHead>
                    <TableHead className="text-center text-white font-semibold ">
                      Exams Attended
                    </TableHead>
                    <TableHead className="text-center text-white font-semibold ">
                      Online Marks
                    </TableHead>
                    <TableHead className="text-center text-white font-semibold ">
                      Physical Marks
                    </TableHead>
                    <TableHead className="text-center text-white font-semibold ">
                      Overall Marks
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-muted-foreground italic"
                      >
                        {searchQuery
                          ? "No students match your search."
                          : "No student data available yet."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((student) => (
                      <TableRow
                        key={student.userId}
                        className={`transition-colors border-border/40 ${getRankStyle(student.userId, student.overallMark)}`}
                      >
                        <TableCell className="font-medium text-sm">
                          {student.studentPublicId || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm sm:text-base">
                              {student.name}
                            </span>
                            {getRankBadge(student.userId, student.overallMark)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span
                              className={`text-xs sm:text-sm font-medium ${
                                student.attendedAll
                                  ? "text-slate-600 dark:text-slate-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {student.attendedExams} / {student.totalExams}
                            </span>
                            {student.attendedAll && (
                              <span className="text-[8px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                Full Attendance
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              student.onlineMark !== null
                                ? "font-bold text-slate-600 dark:text-slate-400 text-xs sm:text-sm"
                                : "text-muted-foreground text-[10px] sm:text-xs"
                            }
                          >
                            {student.onlineMark !== null
                              ? student.onlineMark.toFixed(1)
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              student.physicalMark !== null
                                ? "font-bold text-slate-600 dark:text-slate-400 text-xs sm:text-sm"
                                : "text-muted-foreground text-[10px] sm:text-xs"
                            }
                          >
                            {student.physicalMark !== null
                              ? student.physicalMark.toFixed(1)
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <div
                              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold ${
                                student.overallMark !== null
                                  ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shadow-sm"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {student.overallMark !== null
                                ? `${student.overallMark.toFixed(1)}`
                                : "—"}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paper Breakdown Section */}
      {papers.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="px-2">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              Paper Breakdown
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Detailed results per exam session.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {papers.map((paper) => {
              const isExpanded = expandedPapers[paper.id];
              const isOnline = paper.type === "Online";

              const headerBg = isOnline
                ? "bg-sky-500/5 hover:bg-sky-500/10"
                : "bg-emerald-500/5 hover:bg-emerald-500/10";
              const accentColor = isOnline
                ? "text-sky-600 dark:text-sky-400"
                : "text-emerald-600 dark:text-emerald-400";
              const borderColor = isOnline
                ? "border-sky-500/30"
                : "border-emerald-500/30";

              return (
                <Card key={paper.id}>
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={() => togglePaper(paper.id)}
                  >
                    <CardTitle className="text-sm sm:text-base font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {isExpanded ? (
                          <ChevronDown
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${accentColor}`}
                          />
                        ) : (
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                        )}
                        <span
                          className={`truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none ${isExpanded ? accentColor : ""}`}
                        >
                          {paper.title}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          isOnline
                            ? "bg-sky-500/10 text-sky-500 border-sky-500/30"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        } font-bold text-[10px] sm:text-xs px-1 sm:px-2 py-0`}
                      >
                        {paper.type} Exam
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="p-0 border-t border-border/40">
                      <div className="overflow-x-auto p-2 sm:px-5 sm:py-6">
                        <div
                          className={`border ${borderColor} rounded-lg overflow-hidden shadow-inner min-w-[500px] sm:min-w-full`}
                        >
                          <Table>
                            <TableHeader
                              className={
                                isOnline ? "bg-sky-500/10" : "bg-emerald-500/10"
                              }
                            >
                              <TableRow className="hover:bg-transparent">
                                <TableHead
                                  className={`w-[120px] sm:w-[180px] font-bold text-[10px] sm:text-xs uppercase tracking-wider ${accentColor}`}
                                >
                                  Student ID
                                </TableHead>
                                <TableHead
                                  className={`font-bold text-[10px] sm:text-xs uppercase tracking-wider ${accentColor}`}
                                >
                                  Student Name
                                </TableHead>
                                <TableHead
                                  className={`text-right font-bold text-[10px] sm:text-xs uppercase tracking-wider pr-4 sm:pr-10 ${accentColor}`}
                                >
                                  Marks Obtained
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paper.results
                                .filter(
                                  (r) =>
                                    r.studentName
                                      .toLowerCase()
                                      .includes(searchQuery.toLowerCase()) ||
                                    r.studentPublicId
                                      ?.toLowerCase()
                                      .includes(searchQuery.toLowerCase())
                                )
                                .sort((a, b) => (b.mark || 0) - (a.mark || 0))
                                .map((result) => (
                                  <TableRow
                                    key={result.studentId}
                                    className="border-border/40 hover:bg-muted/10 transition-all duration-200"
                                  >
                                    <TableCell className="text-[11px] sm:text-sm font-medium">
                                      {result.studentPublicId ||
                                        result.studentId.substring(0, 8)}
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground/80 text-[11px] sm:text-sm">
                                      {result.studentName}
                                    </TableCell>
                                    <TableCell
                                      className={`text-right pr-4 sm:pr-10 font-bold text-sm sm:text-lg ${
                                        result.mark === null
                                          ? "text-muted-foreground/30"
                                          : accentColor
                                      }`}
                                    >
                                      {result.mark !== null
                                        ? isOnline
                                          ? `${result.mark.toFixed(1)}%`
                                          : result.mark.toFixed(1)
                                        : "Absent"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              {/* Empty state logic same as before */}
                              {paper.results.filter(
                                (r) =>
                                  r.studentName
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                  r.studentPublicId
                                    ?.toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                              ).length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={3}
                                    className="h-16 sm:h-20 text-center text-muted-foreground italic text-xs sm:text-sm"
                                  >
                                    No results found for this paper.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
