import BlindBoxCard, { type BlindBoxData } from '@/features/marketplace/components/BlindBoxCard';

type MarqueeRowProps = {
  boxes: BlindBoxData[];
  rowIndex: number;
  direction: 'left' | 'right';
};

export default function MarqueeRow({ boxes, rowIndex, direction }: MarqueeRowProps) {
  const minimumCardsPerLoop = Math.max(6, boxes.length);
  const baseLoopBoxes = Array.from({ length: Math.ceil(minimumCardsPerLoop / boxes.length) }, () => boxes).flat();
  const duplicatedBoxes = [...baseLoopBoxes, ...baseLoopBoxes];

  return (
    <div className="marquee-row group relative overflow-hidden" data-cursor="interactive">
      <div className="marquee-row__viewport">
        <div className="marquee-row__edge-glow marquee-row__edge-glow--left" />
        <div className="marquee-row__edge-glow marquee-row__edge-glow--right" />

        <div
          className={`marquee-track ${direction === 'right' ? 'marquee-track--right' : 'marquee-track--left'}`}
          style={{
            animationDuration: `${32 + rowIndex * 7}s`,
          }}
        >
          {duplicatedBoxes.map((box, index) => (
            <div
              key={`${rowIndex}-${box.id}-${index}`}
              className="marquee-card-shell w-[290px] shrink-0 md:w-[320px]"
            >
              <BlindBoxCard
                box={box}
                href={`/boxes/${box.id}`}
                featured={(index + rowIndex) % 4 === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
