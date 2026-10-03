import type { FeaturedProject } from "@/types/mentor";
interface Project {
  category: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
  artStationUrl?: string;
}

function FeaturedProjects({ projects, artStationUrl = "#" }: FeaturedProjectsProps) {
  return (
    <section className="bg-[#1a1d23] px-6 py-12 md:px-16 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Featured Projects
            </h2>
            <p className="mt-2 max-w-xl text-sm text-gray-400">
              A selection of 3D works showcased in international galleries and
              used in commercial productions.
            </p>
          </div>

          <a
            href={artStationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-full border border-white px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-[#1a1d23]"
          >
            View ArtStation
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl bg-white"
            >
              <img
                src={project.imageUrl}
                alt={project.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {project.category}
                </p>
                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProjects;