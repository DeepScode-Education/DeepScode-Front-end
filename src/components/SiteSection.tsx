import { Link } from "react-router-dom";

interface SectionContent {
    title?: string;
    html?: string;
    text?: string;
    image_url?: string;
    background_color?: string;
    text_color?: string;
    button_text?: string;
    button_url?: string;
    subtitle?: string;
}

interface SiteSectionProps {
    type: string;
    content: SectionContent;
    className?: string;
}

const SiteSection = ({ type, content, className = "" }: SiteSectionProps) => {
    const wrapperStyle = {
        backgroundColor: content.background_color || "transparent",
        color: content.text_color || "inherit",
    };

    // ── Hero ─────────────────────────────────────────────────────
    if (type === "hero") {
        return (
            <section
                style={wrapperStyle}
                className={`relative w-full py-20 px-6 overflow-hidden ${className}`}
            >
                {/* Background image */}
                {content.image_url && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={content.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                )}

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    {content.title && (
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                            style={{ color: content.text_color || (content.image_url ? "#ffffff" : "inherit") }}
                        >
                            {content.title}
                        </h1>
                    )}
                    {content.subtitle && (
                        <p
                            className="text-lg md:text-xl mb-8 opacity-90"
                            style={{ color: content.text_color || (content.image_url ? "#ffffff" : "inherit") }}
                        >
                            {content.subtitle}
                        </p>
                    )}
                    {content.button_text && content.button_url && (
                        <Link
                            to={content.button_url}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg"
                        >
                            {content.button_text}
                        </Link>
                    )}
                </div>
            </section>
        );
    }

    // ── Text ─────────────────────────────────────────────────────
    if (type === "text") {
        return (
            <section
                style={wrapperStyle}
                className={`py-12 px-6 ${className}`}
            >
                <div className="max-w-4xl mx-auto">
                    {content.title && (
                        <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
                    )}
                    {content.html && (
                        <div
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: content.html }}
                        />
                    )}
                </div>
            </section>
        );
    }

    // ── Image ────────────────────────────────────────────────────
    if (type === "image") {
        return (
            <section
                style={wrapperStyle}
                className={`py-12 px-6 ${className}`}
            >
                <div className="max-w-5xl mx-auto">
                    {content.image_url && (
                        <figure>
                            <img
                                src={content.image_url}
                                alt={content.title || ""}
                                className="w-full rounded-2xl shadow-lg object-cover"
                            />
                            {content.title && (
                                <figcaption className="text-center text-sm text-gray-500 mt-3">
                                    {content.title}
                                </figcaption>
                            )}
                        </figure>
                    )}
                </div>
            </section>
        );
    }

    // ── Banner ───────────────────────────────────────────────────
    if (type === "banner") {
        return (
            <section
                style={wrapperStyle}
                className={`py-6 px-6 ${className}`}
            >
                <div className="max-w-5xl mx-auto text-center">
                    {content.title && (
                        <p className="text-lg font-semibold">{content.title}</p>
                    )}
                    {content.subtitle && (
                        <p className="text-sm opacity-80 mt-1">{content.subtitle}</p>
                    )}
                    {content.button_text && content.button_url && (
                        <Link
                            to={content.button_url}
                            className="inline-block mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {content.button_text}
                        </Link>
                    )}
                </div>
            </section>
        );
    }

    return null;
};

export default SiteSection;
