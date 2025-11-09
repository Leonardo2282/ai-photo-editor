import { useLocation } from "wouter";
import InterviewFlow from "@/components/InterviewFlow";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();

  const handleComplete = (preferences: any) => {
    console.log('Onboarding completed with preferences:', preferences);
    // In real app, would save to backend
    setLocation("/editor");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <InterviewFlow onComplete={handleComplete} />
    </div>
  );
}
