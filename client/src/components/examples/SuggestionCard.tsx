import SuggestionCard from '../SuggestionCard';

export default function SuggestionCardExample() {
  return (
    <div className="p-8 max-w-md mx-auto space-y-4">
      <SuggestionCard
        prompt="Make the sky more dramatic with sunset colors"
        category="lighting"
        onClick={() => console.log('Suggestion clicked')}
      />
      <SuggestionCard
        prompt="Add warm golden hour tones throughout the image"
        category="color"
        onClick={() => console.log('Suggestion clicked')}
      />
      <SuggestionCard
        prompt="Convert to black and white with high contrast"
        category="style"
        onClick={() => console.log('Suggestion clicked')}
      />
    </div>
  );
}
