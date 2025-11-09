import ReactCompareImage from "react-compare-image";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  return (
    <div className="relative w-full rounded-lg overflow-hidden border" data-testid="slider-compare">
      <ReactCompareImage
        leftImage={beforeImage}
        rightImage={afterImage}
        sliderLineWidth={3}
        sliderLineColor="#3b82f6"
        leftImageLabel="Original"
        rightImageLabel="Edited"
      />
    </div>
  );
}
