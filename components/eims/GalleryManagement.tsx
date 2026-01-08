import { ShowcaseGalleryManager } from "./showcase/ShowcaseGalleryManager";
import { Globe } from "lucide-react";

export function GalleryManagement() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">Manage showcase site gallery.</p>
        </div>
      </div>

      <ShowcaseGalleryManager />
    </div>
  );
}
