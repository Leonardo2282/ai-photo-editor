import { useLocation } from "wouter";
import InterviewFlow from "@/components/InterviewFlow";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();

  const handleComplete = (preferences: any) => {
    console.log('Onboarding completed with preferences:', preferences);
    // In real app, would save to backend
    setLocation("/editor");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 bg-muted/30">
      <div className="max-w-2xl mx-auto w-full mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/")}
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <InterviewFlow onComplete={handleComplete} />
      </div>
    </div>
  );
}
