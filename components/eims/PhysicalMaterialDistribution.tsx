import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClasses } from "@/hooks/useData";
import {
  Plus,
  Search,
  Package,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PhysicalMaterial {
  id: string;
  name: string;
  description: string;
  type: "handout" | "book" | "worksheet" | "exam_paper" | "other";
  subject: string;
  grade: string;
  quantity: number;
  remainingQuantity: number;
  createdDate: string;
  createdBy: string;
}

interface MaterialDistribution {
  id: string;
  materialId: string;
  materialName: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  distributedDate: string;
  distributedBy: string;
  received: boolean;
  receivedDate?: string;
  notes?: string;
}

// Mock data - replace with actual data hooks
const mockMaterials: PhysicalMaterial[] = [
  {
    id: "MAT001",
    name: "Chemistry Lab Manual",
    description: "Complete lab manual for Chemistry practical sessions",
    type: "book",
    subject: "Chemistry",
    grade: "Grade 12",
    quantity: 50,
    remainingQuantity: 15,
    createdDate: "2024-01-15",
    createdBy: "Admin",
  },
  {
    id: "MAT002",
    name: "Math Problem Set 1",
    description: "Practice problems for algebra and calculus",
    type: "worksheet",
    subject: "Mathematics",
    grade: "Grade 11",
    quantity: 100,
    remainingQuantity: 45,
    createdDate: "2024-01-20",
    createdBy: "Ms. Johnson",
  },
];

const mockDistributions: MaterialDistribution[] = [
  {
    id: "DIST001",
    materialId: "MAT001",
    materialName: "Chemistry Lab Manual",
    studentId: "STU001",
    studentName: "John Smith",
    classId: "CLS001",
    className: "Grade 12-A",
    distributedDate: "2024-01-22",
    distributedBy: "Admin",
    received: true,
    receivedDate: "2024-01-22",
  },
  {
    id: "DIST002",
    materialId: "MAT001",
    materialName: "Chemistry Lab Manual",
    studentId: "STU002",
    studentName: "Jane Doe",
    classId: "CLS001",
    className: "Grade 12-A",
    distributedDate: "2024-01-22",
    distributedBy: "Admin",
    received: false,
  },
];

export function PhysicalMaterialDistribution() {
  const [materials, setMaterials] = useState<PhysicalMaterial[]>(mockMaterials);
  const [distributions, setDistributions] =
    useState<MaterialDistribution[]>(mockDistributions);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { classes } = useClasses();

  const [newMaterial, setNewMaterial] = useState<Partial<PhysicalMaterial>>({
    name: "",
    description: "",
    type: "handout",
    subject: "",
    grade: "",
    quantity: 0,
  });

  const handleAddMaterial = () => {
    if (!newMaterial.name || !newMaterial.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    const material: PhysicalMaterial = {
      id: `MAT${String(materials.length + 1).padStart(3, "0")}`,
      name: newMaterial.name!,
      description: newMaterial.description || "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: newMaterial.type as any,
      subject: newMaterial.subject || "",
      grade: newMaterial.grade || "",
      quantity: newMaterial.quantity!,
      remainingQuantity: newMaterial.quantity!,
      createdDate: new Date().toISOString().split("T")[0],
      createdBy: "Admin",
    };

    setMaterials([...materials, material]);
    setNewMaterial({
      name: "",
      description: "",
      type: "handout",
      subject: "",
      grade: "",
      quantity: 0,
    });
    toast.success("Material added successfully");
  };

  const handleDistributeMaterial = (materialId: string, classId: string) => {
    // Mock student data for the selected class
    const mockStudents = [
      { id: "STU003", name: "Alice Johnson" },
      { id: "STU004", name: "Bob Williams" },
      { id: "STU005", name: "Carol Brown" },
    ];

    const material = materials.find((m) => m.id === materialId);
    const selectedClassData = classes.find((c) => c.id === classId);

    if (!material || !selectedClassData) {
      toast.error("Invalid material or class selection");
      return;
    }

    const newDistributions = mockStudents.map((student) => ({
      id: `DIST${String(distributions.length + Math.random()).replace(".", "")}`,
      materialId,
      materialName: material.name,
      studentId: student.id,
      studentName: student.name,
      classId,
      className: selectedClassData.name,
      distributedDate: new Date().toISOString().split("T")[0],
      distributedBy: "Admin",
      received: false,
    }));

    setDistributions([...distributions, ...newDistributions]);

    // Update material quantity
    setMaterials(
      materials.map((m) =>
        m.id === materialId
          ? {
              ...m,
              remainingQuantity: m.remainingQuantity - mockStudents.length,
            }
          : m
      )
    );

    toast.success(`Material distributed to ${mockStudents.length} students`);
  };

  const toggleReceived = (distributionId: string) => {
    setDistributions(
      distributions.map((d) =>
        d.id === distributionId
          ? {
              ...d,
              received: !d.received,
              receivedDate: !d.received
                ? new Date().toISOString().split("T")[0]
                : undefined,
            }
          : d
      )
    );
    toast.success("Status updated successfully");
  };

  const filteredDistributions = distributions.filter((d) => {
    const matchesSearch =
      d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.materialName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "received" && d.received) ||
      (filterStatus === "pending" && !d.received);
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    const totalDistributions = distributions.length;
    const receivedCount = distributions.filter((d) => d.received).length;
    const pendingCount = totalDistributions - receivedCount;
    const totalMaterials = materials.length;

    return { totalDistributions, receivedCount, pendingCount, totalMaterials };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Physical Material Distribution</h1>
          <p className="text-muted-foreground">
            Manage and track distribution of physical study materials
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaterials}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Distributions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistributions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.receivedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distributions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distributions">Distribution Tracking</TabsTrigger>
          <TabsTrigger value="materials">Material Management</TabsTrigger>
          <TabsTrigger value="distribute">Distribute Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="distributions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Distribution Status</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search student or material..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Distributed Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell className="font-medium">
                        {distribution.studentName}
                      </TableCell>
                      <TableCell>{distribution.materialName}</TableCell>
                      <TableCell>{distribution.className}</TableCell>
                      <TableCell>{distribution.distributedDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            distribution.received ? "default" : "secondary"
                          }
                        >
                          {distribution.received ? "Received" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleReceived(distribution.id)}
                        >
                          Mark as{" "}
                          {distribution.received ? "Pending" : "Received"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Material Inventory</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Material</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Material Name</Label>
                        <Input
                          value={newMaterial.name || ""}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter material name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newMaterial.description || ""}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter description"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={newMaterial.type || "handout"}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onValueChange={(value) =>
                              setNewMaterial({
                                ...newMaterial,
                                type: value as any,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="handout">Handout</SelectItem>
                              <SelectItem value="book">Book</SelectItem>
                              <SelectItem value="worksheet">
                                Worksheet
                              </SelectItem>
                              <SelectItem value="exam_paper">
                                Exam Paper
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={newMaterial.quantity || 0}
                            onChange={(e) =>
                              setNewMaterial({
                                ...newMaterial,
                                quantity: parseInt(e.target.value),
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Subject</Label>
                          <Input
                            value={newMaterial.subject || ""}
                            onChange={(e) =>
                              setNewMaterial({
                                ...newMaterial,
                                subject: e.target.value,
                              })
                            }
                            placeholder="Enter subject"
                          />
                        </div>
                        <div>
                          <Label>Grade</Label>
                          <Input
                            value={newMaterial.grade || ""}
                            onChange={(e) =>
                              setNewMaterial({
                                ...newMaterial,
                                grade: e.target.value,
                              })
                            }
                            placeholder="Enter grade"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddMaterial} className="w-full">
                        Add Material
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Total Qty</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">
                        {material.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {material.type.replace("_", " ").toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{material.subject}</TableCell>
                      <TableCell>{material.grade}</TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell>{material.remainingQuantity}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            material.remainingQuantity > 10
                              ? "default"
                              : material.remainingQuantity > 0
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {material.remainingQuantity > 10
                            ? "In Stock"
                            : material.remainingQuantity > 0
                              ? "Low Stock"
                              : "Out of Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribute Materials to Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Material</Label>
                  <Select
                    value={selectedMaterial}
                    onValueChange={setSelectedMaterial}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials
                        .filter((m) => m.remainingQuantity > 0)
                        .map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name} (Available:{" "}
                            {material.remainingQuantity})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select Class</Label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.enrolled_students} students)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() =>
                  selectedMaterial &&
                  selectedClass &&
                  handleDistributeMaterial(selectedMaterial, selectedClass)
                }
                disabled={!selectedMaterial || !selectedClass}
                className="w-full"
              >
                Distribute to All Students in Class
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
