import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "The portfolio I built at Slate was the single biggest reason I cracked Google.",
    name: "Ananya R.",
    role: "UX Designer · Google",
    initials: "AR",
    color: "bg-violet-500",
  },
  {
    quote:
      "I switched from marketing to product design in 8 months. The mentorship was unreal.",
    name: "Rohan K.",
    role: "Product Designer · Razorpay",
    initials: "RK",
    color: "bg-blue-500",
  },
  {
    quote:
      "Landed 3 freelance clients before graduating. Slate genuinely changed my trajectory.",
    name: "Priya M.",
    role: "UI Designer · Swiggy",
    initials: "PM",
    color: "bg-pink-500",
  },
];

const SuccessStories = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block border border-slate-300 text-slate-500 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Success Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Designers Who{" "}
            <span className="text-[#0037FF]">Made It</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            Real grads. Real roles. Real outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#f8f8fc] border border-slate-100 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <Quote className="h-5 w-5 text-[#0037FF]/40 mb-4" />
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-3 w-3 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
