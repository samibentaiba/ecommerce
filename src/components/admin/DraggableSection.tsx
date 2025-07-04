import React from 'react';
import { GripVertical, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Section {
  id: string;
  name: string;
  type: string;
  description: string;
}

interface DraggableSectionProps {
  section: Section;
  index: number;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, sectionId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  onDragEnd: () => void;
  onRemove: (sectionId: string) => void;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  index,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove
}) => {
  const getSectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hero':
        return '🎯';
      case 'features':
        return '⭐';
      case 'testimonials':
        return '💬';
      case 'call to action':
        return '📢';
      case 'text block':
        return '📝';
      case 'image':
        return '🖼️';
      case 'gallery':
        return '🎨';
      default:
        return '📋';
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, section.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, section.id)}
      onDragEnd={onDragEnd}
      className={`
        group cursor-move transition-all duration-200 border-slate-200 hover:border-blue-300 hover:shadow-md
        ${isDragging ? 'opacity-50 scale-95 shadow-lg border-blue-400' : 'hover:scale-[1.01]'}
      `}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <span className="text-2xl" role="img" aria-label={section.type}>
              {getSectionIcon(section.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-slate-800 truncate">{section.name}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {section.type}
                </span>
              </div>
              {section.description && (
                <p className="text-sm text-slate-600 truncate mt-1">{section.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-100"
              onClick={(e) => {
                e.stopPropagation();
                // Handle edit section
              }}
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(section.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DraggableSection;
