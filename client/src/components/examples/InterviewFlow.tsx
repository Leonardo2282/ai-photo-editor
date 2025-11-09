import InterviewFlow from '../InterviewFlow';

export default function InterviewFlowExample() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-muted/30">
      <InterviewFlow
        onComplete={(preferences) => {
          console.log('Interview completed:', preferences);
          alert('Interview completed! Check console for preferences.');
        }}
      />
    </div>
  );
}
