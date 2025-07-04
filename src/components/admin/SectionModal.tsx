

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SectionModalProps {
  onAddSection: (type: string, name: string, description: string) => void;
}

const SectionModal: React.FC<SectionModalProps> = ({ onAddSection }) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [sectionName, setSectionName] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');

  const sectionTypes = [
    { id: 'hero', name: 'Hero Section', description: 'Main banner with headline and CTA', icon: '🎯' },
    { id: 'features', name: 'Features', description: 'Product features grid', icon: '⭐' },
    { id: 'testimonials', name: 'Testimonials', description: 'Customer reviews and ratings', icon: '💬' },
    { id: 'cta', name: 'Call to Action', description: 'Action button section', icon: '📢' },
    { id: 'text', name: 'Text Block', description: 'Rich text content', icon: '📝' },
    { id: 'image', name: 'Image', description: 'Single image with caption', icon: '🖼️' },
    { id: 'gallery', name: 'Gallery', description: 'Multiple images grid', icon: '🎨' },
  ];

  const handleSubmit = () => {
    if (selectedType && sectionName) {
      onAddSection(
        sectionTypes.find(t => t.id === selectedType)?.name || selectedType,
        sectionName,
        sectionDescription
      );
      // Reset form
      setSelectedType('');
      setSectionName('');
      setSectionDescription('');
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Section</DialogTitle>
        <p className="text-sm text-slate-600">Choose a section type to add to your template</p>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Section Type Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-3 block">
            Section Type
          </label>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {sectionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  p-3 text-left rounded-lg border transition-all duration-200 hover:border-blue-300
                  ${selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl" role="img" aria-label={type.name}>
                    {type.icon}
                  </span>
                  <div>
                    <h3 className="font-medium text-slate-800">{type.name}</h3>
                    <p className="text-xs text-slate-600">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section Details */}
        {selectedType && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Section Name
              </label>
              <Input
                placeholder="Enter section name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Brief description of this section"
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 min-h-[80px]"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={!selectedType || !sectionName}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
          >
            Add Section
          </Button>
        </div>
      </div>
    </>
  );
};

export default SectionModal;
