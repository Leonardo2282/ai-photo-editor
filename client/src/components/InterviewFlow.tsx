import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface InterviewFlowProps {
  onComplete: (preferences: {
    editingStyle: string;
    useCases: string[];
    skillLevel: string;
    favoriteEffects: string[];
  }) => void;
}

export default function InterviewFlow({ onComplete }: InterviewFlowProps) {
  const [step, setStep] = useState(0);
  const [editingStyle, setEditingStyle] = useState("");
  const [useCases, setUseCases] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [favoriteEffects, setFavoriteEffects] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const steps = [
    {
      title: "What's your editing style?",
      explanation: "This will influence how AI processes your images - subtle enhancements or bold transformations.",
      options: [
        { value: "natural", label: "Natural & Subtle", description: "AI will make minimal, refined adjustments" },
        { value: "dramatic", label: "Bold & Dramatic", description: "AI will apply stronger, eye-catching effects" },
        { value: "artistic", label: "Creative & Artistic", description: "AI gets creative freedom for unique results" }
      ],
      value: editingStyle,
      setValue: setEditingStyle,
      multiSelect: false
    },
    {
      title: "What will you use this for?",
      explanation: "We'll personalize prompt suggestions to match your goals and use cases.",
      options: [
        { value: "social", label: "Social Media", description: "Optimized for engagement - vibrant, eye-catching" },
        { value: "professional", label: "Professional Work", description: "Clean, natural edits for portfolios" },
        { value: "personal", label: "Personal Projects", description: "Creative freedom for your hobby" },
        { value: "ecommerce", label: "E-commerce", description: "Product-focused: backgrounds, lighting" }
      ],
      value: useCases,
      setValue: setUseCases,
      multiSelect: true
    },
    {
      title: "What's your skill level?",
      explanation: "We'll adjust the interface complexity and provide appropriate guidance for your experience level.",
      options: [
        { value: "beginner", label: "Beginner", description: "Simple prompts with helpful explanations" },
        { value: "intermediate", label: "Intermediate", description: "Balanced interface with useful tips" },
        { value: "advanced", label: "Advanced", description: "Full control with technical details" }
      ],
      value: skillLevel,
      setValue: setSkillLevel,
      multiSelect: false
    },
    {
      title: "Favorite effects?",
      explanation: "Your preferred effects will appear first in prompt suggestions, making editing faster.",
      options: [
        { value: "lighting", label: "Lighting", description: "Golden hour, dramatic skies, shadows" },
        { value: "color", label: "Color Grading", description: "Warm tones, saturation, color shifts" },
        { value: "filters", label: "Filters", description: "Vintage, B&W, cinematic looks" },
        { value: "effects", label: "Special Effects", description: "Blur, sharpen, artistic filters" }
      ],
      value: favoriteEffects,
      setValue: setFavoriteEffects,
      multiSelect: true
    }
  ];

  const currentStep = steps[step];

  const handleSelect = (value: string) => {
    if (step === 0) {
      // Editing style
      setEditingStyle(value);
    } else if (step === 1) {
      // Use cases (multi-select)
      if (useCases.includes(value)) {
        setUseCases(useCases.filter(v => v !== value));
      } else {
        setUseCases([...useCases, value]);
      }
    } else if (step === 2) {
      // Skill level
      setSkillLevel(value);
    } else if (step === 3) {
      // Favorite effects (multi-select)
      if (favoriteEffects.includes(value)) {
        setFavoriteEffects(favoriteEffects.filter(v => v !== value));
      } else {
        setFavoriteEffects([...favoriteEffects, value]);
      }
    }
  };

  const canProceed = currentStep.multiSelect 
    ? (currentStep.value as string[]).length > 0
    : currentStep.value !== "";

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        editingStyle,
        useCases,
        skillLevel,
        favoriteEffects
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Let's personalize your experience!!!</h2>
          <span className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-medium">{currentStep.title}</h3>
          <p className="text-sm text-muted-foreground" data-testid="text-explanation">
            {currentStep.explanation}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentStep.options.map((option) => {
            const isSelected = currentStep.multiSelect
              ? (currentStep.value as string[]).includes(option.value)
              : currentStep.value === option.value;

            return (
              <Card
                key={option.value}
                className={`p-6 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                  isSelected ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelect(option.value)}
                data-testid={`option-${option.value}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          data-testid="button-back"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          data-testid="button-next"
        >
          {step === totalSteps - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </Card>
  );
}
