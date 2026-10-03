import React from "react";
import { ArrowUpRight, LucideIcon } from "lucide-react";

export interface SupportCardProps {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  href: string;
  color: string;
}

const SupportCard: React.FC<SupportCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  href,
  color,
}) => {
  const Icon = icon;

  const isExternal =
    href.startsWith("http") ||
    href.startsWith("https") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");

  return (
    <div
      className="
        group
        flex
        h-full
        flex-col
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#D1D5DB]
        hover:shadow-xl
      "
    >
      {/* Icon */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: color }}
      >
        <Icon size={28} color="#FFFFFF" />
      </div>

      {/* Content */}
      <div className="mt-5 flex-1">
        <h3 className="text-[16px] font-semibold text-[#111827]">
          {title}
        </h3>

        <p className="mt-2 text-[14px] leading-7 font-medium text-[#6B7280]">
          {description}
        </p>
      </div>

      {/* Button */}
      <div className="mt-6">
        <a
          href={href}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noreferrer" : undefined}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-[#111827]
            px-5
            py-3
            text-sm
            font-medium
            text-white
            transition-all
            duration-300
            hover:bg-black
          "
        >
          {buttonText}

          <ArrowUpRight
            size={17}
            className="
              transition-transform
              duration-300
              group-hover:translate-x-1
              group-hover:-translate-y-1
            "
          />
        </a>
      </div>
    </div>
  );
};

export default SupportCard;