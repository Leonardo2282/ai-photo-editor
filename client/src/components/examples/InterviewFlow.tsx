import InterviewFlow from '../InterviewFlow';

export default function InterviewFlowExample() {
  return (
    <div className="min-h-screen flex flex-col p-8 bg-muted/30">
      <div className="flex-1 flex items-center justify-center">
        <InterviewFlow
          onComplete={(preferences) => {
            console.log('Interview completed:', preferences);
            alert('Interview completed! Check console for preferences.');
          }}
        />
      </div>
    </div>
  );
}
