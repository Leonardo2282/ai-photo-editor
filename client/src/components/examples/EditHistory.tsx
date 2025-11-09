import EditHistory from '../EditHistory';
import { useState } from 'react';

export default function EditHistoryExample() {
  const [edits, setEdits] = useState([
    {
      id: 1,
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      prompt: "Make the sky more dramatic with sunset colors",
      timestamp: "2 mins ago",
      isSaved: false
    },
    {
      id: 2,
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      prompt: "Add warm golden hour lighting",
      timestamp: "5 mins ago",
      isSaved: true
    },
    {
      id: 3,
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
      prompt: "Increase contrast and saturation",
      timestamp: "10 mins ago",
      isSaved: false
    }
  ]);

  const handleSave = (id: number) => {
    setEdits(edits.map(edit => 
      edit.id === id ? { ...edit, isSaved: true } : edit
    ));
    console.log('Saved edit:', id);
  };

  return (
    <div className="h-screen bg-sidebar">
      <EditHistory
        edits={edits}
        activeEditId={1}
        onSave={handleSave}
        onUseAsBase={(id) => console.log('Use as base:', id)}
      />
    </div>
  );
}
