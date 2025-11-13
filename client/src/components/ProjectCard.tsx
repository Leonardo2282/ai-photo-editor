import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FolderOpen } from "lucide-react";
import { Link } from "wouter";
import type { Project, Image } from "@shared/schema";

interface ProjectCardProps {
  project: Project & { originalImage?: Image };
  onOpenProject: () => void;
}

export default function ProjectCard({ project, onOpenProject }: ProjectCardProps) {
  const thumbnailUrl = project.originalImage?.currentUrl || "";
  const projectName = project.name || `Project #${project.id}`;

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group" 
      data-testid={`card-project-${project.id}`}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={projectName}
            className="w-full h-full object-cover"
            data-testid={`img-project-${project.id}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base line-clamp-1" data-testid={`text-project-name-${project.id}`}>
            {projectName}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProject();
            }}
            className="flex-1 gap-2"
            data-testid={`button-open-project-${project.id}`}
          >
            <FolderOpen className="h-4 w-4" />
            Open Project
          </Button>
          {project.originalImage && (
            <Link href={`/editor/${project.originalImage.id}`}>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="gap-2"
                data-testid={`button-open-editor-${project.id}`}
              >
                <ExternalLink className="h-4 w-4" />
                Editor
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
