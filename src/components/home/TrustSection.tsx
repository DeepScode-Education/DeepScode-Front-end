import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type TrustProps = { data?: any };

const defaultStats = [
  { value: 15, suffix: "+", label: "Skills That\nMatter" },
  { value: 30, suffix: "+", label: "Learning by\nDoing" },
  { value: 48, suffix: "", label: "Years of Industry\nExperience" },
  { value: 96, suffix: "+", label: "Companies We\nHave Partnered With" },
  { value: 128, suffix: "+", label: "Success stories\nof our students" },
];

// Counter Hook
const useCountOnce = (target: number, duration = 1800) => {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          observer.disconnect();

          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            setCount(Math.round(eased * target));

            if (progress < 1) {
              requestAnimationFrame(tick);
            }
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
};

// Stat Card
const StatCard = ({
  value,
  suffix,
  label,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  index: number;
}) => {
  const { count, ref } = useCountOnce(value, 1600 + index * 100);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="
        flex flex-col items-center justify-center text-center
        rounded-3xl
        border border-slate-200
        bg-white
        w-full
        min-h-[170px]
        sm:min-h-[190px]
        p-5 sm:p-6
        shadow-sm
        hover:shadow-lg
        hover:-translate-y-1
        transition-all duration-300
      "
    >
      <span className="text-4xl sm:text-5xl font-bold text-slate-700 leading-none tabular-nums">
        {count}
        {suffix}
      </span>

      <span className="mt-4 text-xs sm:text-sm font-semibold text-slate-500 leading-snug whitespace-pre-line">
        {label}
      </span>
    </motion.div>
  );
};

// Main Component
const TrustSection = ({ data }: TrustProps) => {
  const stats =
    Array.isArray(data?.stats) && data.stats.length
      ? data.stats
      : defaultStats;

  return (
    <section className="py-14 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Why Slate
          </p>

          <h2 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-700">
            Because{" "}
            <span className="text-[#0037FF]">average</span>{" "}
            was never your thing.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-500 max-w-xl mx-auto font-medium">
            Built for learners who want results, not certificates that collect
            dust.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((item: typeof defaultStats[0], index: number) => (
            <StatCard
              key={index}
              value={item.value}
              suffix={item.suffix}
              label={item.label}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;