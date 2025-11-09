import BeforeAfterSlider from '../BeforeAfterSlider';

export default function BeforeAfterSliderExample() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <BeforeAfterSlider
        beforeImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
        afterImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&sat=-100"
      />
    </div>
  );
}
