import EditHistoryItem from '../EditHistoryItem';

export default function EditHistoryItemExample() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <EditHistoryItem
        id={1}
        thumbnailUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop"
        prompt="Make the sky more dramatic with sunset colors"
        timestamp="2 mins ago"
        isActive={true}
        isSaved={false}
        onSave={() => console.log('Save clicked')}
        onUseAsBase={() => console.log('Use as base clicked')}
      />
      <EditHistoryItem
        id={2}
        thumbnailUrl="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop"
        prompt="Add warm golden hour lighting"
        timestamp="5 mins ago"
        isSaved={true}
        onSave={() => console.log('Save clicked')}
        onUseAsBase={() => console.log('Use as base clicked')}
      />
    </div>
  );
}
