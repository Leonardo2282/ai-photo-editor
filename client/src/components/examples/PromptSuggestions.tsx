import PromptSuggestions from '../PromptSuggestions';

export default function PromptSuggestionsExample() {
  const mockSuggestions = [
    { id: 1, prompt: "Make the sky more dramatic with sunset colors", category: "lighting" },
    { id: 2, prompt: "Add warm golden hour tones throughout", category: "color" },
    { id: 3, prompt: "Increase contrast and saturation", category: "color" },
    { id: 4, prompt: "Apply vintage film effect", category: "style" },
    { id: 5, prompt: "Add soft bokeh background blur", category: "effects" }
  ];

  return (
    <div className="p-8">
      <PromptSuggestions
        suggestions={mockSuggestions}
        onSelect={(prompt) => console.log('Selected:', prompt)}
      />
    </div>
  );
}
