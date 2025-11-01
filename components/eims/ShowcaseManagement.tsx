import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Globe,
  Zap,
  BarChart3,
  Star,
  BookOpen,
  GraduationCap,
  Camera,
  Phone,
  Plus,
  Trash2,
  Save,
  Eye,
  Trophy,
  Award,
  Users,
  Calendar,
} from "lucide-react";

interface StatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
}

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface CourseItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  rating: number;
  students: number;
}

interface FacultyItem {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialization: string;
  rating: number;
  emoji: string;
}

interface TestimonialItem {
  id: string;
  content: string;
  author: string;
  role: string;
  rating: number;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: "achievement" | "student" | "institute" | "event";
  imageUrl?: string;
}

export function ShowcaseManagement() {
  const [activeTab, setActiveTab] = useState("hero");

  // Hero Section State
  const [heroData, setHeroData] = useState({
    badge: "New Batch Starting Soon - Limited Seats Available!",
    title: "Transform Your Future with Quality Education",
    subtitle:
      "Join ZIGMA Institute and unlock your potential with our comprehensive courses, expert faculty, and proven teaching methods.",
    ctaText: "Enroll Now",
  });

  // Statistics State
  const [stats, setStats] = useState<StatItem[]>([
    { id: "1", label: "Active Students", value: "500+", icon: "Users" },
    { id: "2", label: "Expert Faculty", value: "25+", icon: "GraduationCap" },
    { id: "3", label: "Courses Available", value: "15+", icon: "BookOpen" },
    { id: "4", label: "Success Rate", value: "95%", icon: "Trophy" },
  ]);

  // Features State
  const [features, setFeatures] = useState<FeatureItem[]>([
    {
      id: "1",
      title: "Expert Faculty",
      description: "Learn from experienced professionals",
      icon: "GraduationCap",
      color: "primary",
    },
    {
      id: "2",
      title: "Modern Facilities",
      description: "State-of-the-art classrooms and labs",
      icon: "Award",
      color: "secondary",
    },
    {
      id: "3",
      title: "Flexible Timing",
      description: "Classes that fit your schedule",
      icon: "Calendar",
      color: "accent",
    },
    {
      id: "4",
      title: "Career Support",
      description: "Job placement assistance",
      icon: "Star",
      color: "success",
    },
  ]);

  // Gallery State
  const [gallery, setGallery] = useState<GalleryItem[]>([
    {
      id: "1",
      title: "Island Rank 1st - Mathematics",
      description: "Our student achieved island's top rank",
      category: "achievement",
    },
    {
      id: "2",
      title: "District Champion - Science Fair",
      description: "First place in district science competition",
      category: "student",
    },
    {
      id: "3",
      title: "ISO 9001:2015 Certification",
      description: "Quality management certification",
      category: "institute",
    },
    {
      id: "4",
      title: "Annual Cultural Festival",
      description: "Students showcasing talents",
      category: "event",
    },
  ]);

  const [newStat, setNewStat] = useState({
    label: "",
    value: "",
    icon: "Users",
  });
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    icon: "Star",
    color: "primary",
  });
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    description: "",
    category: "achievement" as const,
  });

  const handleSaveHero = () => {
    toast({ title: "Hero section updated successfully!" });
  };

  const addStat = () => {
    if (newStat.label && newStat.value) {
      setStats([...stats, { ...newStat, id: Date.now().toString() }]);
      setNewStat({ label: "", value: "", icon: "Users" });
      toast({ title: "Statistic added successfully!" });
    }
  };

  const removeStat = (id: string) => {
    setStats(stats.filter((stat) => stat.id !== id));
    toast({ title: "Statistic removed successfully!" });
  };

  const addFeature = () => {
    if (newFeature.title && newFeature.description) {
      setFeatures([...features, { ...newFeature, id: Date.now().toString() }]);
      setNewFeature({
        title: "",
        description: "",
        icon: "Star",
        color: "primary",
      });
      toast({ title: "Feature added successfully!" });
    }
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter((feature) => feature.id !== id));
    toast({ title: "Feature removed successfully!" });
  };

  const addGalleryItem = () => {
    if (newGalleryItem.title && newGalleryItem.description) {
      setGallery([
        ...gallery,
        { ...newGalleryItem, id: Date.now().toString() },
      ]);
      setNewGalleryItem({
        title: "",
        description: "",
        category: "achievement",
      });
      toast({ title: "Gallery item added successfully!" });
    }
  };

  const removeGalleryItem = (id: string) => {
    setGallery(gallery.filter((item) => item.id !== id));
    toast({ title: "Gallery item removed successfully!" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Website Management</h1>
          <p className="text-muted-foreground">
            Manage showcase site content and sections
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Hero Section Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="badge">Promotional Badge</Label>
                <Input
                  id="badge"
                  value={heroData.badge}
                  onChange={(e) =>
                    setHeroData({ ...heroData, badge: e.target.value })
                  }
                  placeholder="Enter promotional badge text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Main Title</Label>
                <Input
                  id="title"
                  value={heroData.title}
                  onChange={(e) =>
                    setHeroData({ ...heroData, title: e.target.value })
                  }
                  placeholder="Enter main hero title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={heroData.subtitle}
                  onChange={(e) =>
                    setHeroData({ ...heroData, subtitle: e.target.value })
                  }
                  placeholder="Enter hero subtitle"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta">Call-to-Action Button</Label>
                <Input
                  id="cta"
                  value={heroData.ctaText}
                  onChange={(e) =>
                    setHeroData({ ...heroData, ctaText: e.target.value })
                  }
                  placeholder="Enter CTA button text"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveHero}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Section */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistics Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Stats */}
              <div className="space-y-4">
                <h3 className="font-semibold">Current Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-primary">
                          {stat.value}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeStat(stat.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Add New Stat */}
              <div className="space-y-4">
                <h3 className="font-semibold">Add New Statistic</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={newStat.label}
                      onChange={(e) =>
                        setNewStat({ ...newStat, label: e.target.value })
                      }
                      placeholder="e.g., Active Students"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      value={newStat.value}
                      onChange={(e) =>
                        setNewStat({ ...newStat, value: e.target.value })
                      }
                      placeholder="e.g., 500+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newStat.icon}
                      onChange={(e) =>
                        setNewStat({ ...newStat, icon: e.target.value })
                      }
                    >
                      <option value="Users">Users</option>
                      <option value="GraduationCap">GraduationCap</option>
                      <option value="BookOpen">BookOpen</option>
                      <option value="Trophy">Trophy</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addStat} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Statistic
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Section */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Features Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Features */}
              <div className="space-y-4">
                <h3 className="font-semibold">Current Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <div
                      key={feature.id}
                      className="p-4 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{feature.title}</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFeature(feature.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{feature.icon}</Badge>
                        <Badge variant="outline">{feature.color}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Add New Feature */}
              <div className="space-y-4">
                <h3 className="font-semibold">Add New Feature</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newFeature.title}
                        onChange={(e) =>
                          setNewFeature({
                            ...newFeature,
                            title: e.target.value,
                          })
                        }
                        placeholder="Feature title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color Theme</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newFeature.color}
                        onChange={(e) =>
                          setNewFeature({
                            ...newFeature,
                            color: e.target.value,
                          })
                        }
                      >
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="accent">Accent</option>
                        <option value="success">Success</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newFeature.description}
                      onChange={(e) =>
                        setNewFeature({
                          ...newFeature,
                          description: e.target.value,
                        })
                      }
                      placeholder="Feature description"
                      rows={2}
                    />
                  </div>
                </div>
                <Button
                  onClick={addFeature}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Section */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Gallery Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gallery Items by Category */}
              <div className="space-y-6">
                {["achievement", "student", "institute", "event"].map(
                  (category) => (
                    <div key={category} className="space-y-4">
                      <h3 className="font-semibold capitalize flex items-center gap-2">
                        {category === "achievement" && (
                          <Trophy className="w-4 h-4" />
                        )}
                        {category === "student" && (
                          <Users className="w-4 h-4" />
                        )}
                        {category === "institute" && (
                          <Award className="w-4 h-4" />
                        )}
                        {category === "event" && (
                          <Calendar className="w-4 h-4" />
                        )}
                        {category} Gallery
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gallery
                          .filter((item) => item.category === category)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="p-4 border rounded-lg space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{item.title}</h4>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeGalleryItem(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                              <Badge variant="outline" className="capitalize">
                                {item.category}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              <Separator />

              {/* Add New Gallery Item */}
              <div className="space-y-4">
                <h3 className="font-semibold">Add New Gallery Item</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newGalleryItem.title}
                        onChange={(e) =>
                          setNewGalleryItem({
                            ...newGalleryItem,
                            title: e.target.value,
                          })
                        }
                        placeholder="Gallery item title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newGalleryItem.category}
                        onChange={(e) =>
                          setNewGalleryItem({
                            ...newGalleryItem,
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            category: e.target.value as any,
                          })
                        }
                      >
                        <option value="achievement">Achievement</option>
                        <option value="student">Student</option>
                        <option value="institute">Institute</option>
                        <option value="event">Event</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newGalleryItem.description}
                      onChange={(e) =>
                        setNewGalleryItem({
                          ...newGalleryItem,
                          description: e.target.value,
                        })
                      }
                      placeholder="Gallery item description"
                      rows={2}
                    />
                  </div>
                </div>
                <Button
                  onClick={addGalleryItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Gallery Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Section */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Courses Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Course management functionality will be implemented here.</p>
                <p className="text-sm">
                  This will include course creation, editing, and showcase
                  display management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Section */}
        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Faculty Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  Faculty management functionality will be implemented here.
                </p>
                <p className="text-sm">
                  This will include faculty profiles, qualifications, and
                  showcase display management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Section */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  Contact information management functionality will be
                  implemented here.
                </p>
                <p className="text-sm">
                  This will include phone, email, address, and social media link
                  management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
