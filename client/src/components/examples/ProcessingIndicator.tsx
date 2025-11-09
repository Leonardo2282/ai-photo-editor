import ProcessingIndicator from '../ProcessingIndicator';

export default function ProcessingIndicatorExample() {
  return (
    <div className="relative h-96 bg-muted rounded-lg">
      <ProcessingIndicator progress={65} />
    </div>
  );
}
