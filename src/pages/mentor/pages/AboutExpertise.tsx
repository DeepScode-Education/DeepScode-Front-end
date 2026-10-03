// interface AboutExpertiseProps {
//   mentor: {
//     name: string;
//     about?: string[]; // paragraphs
//     expertise?: string[]; // tags
//   };
// }

// const AboutExpertise = ({ mentor }: AboutExpertiseProps) => {
//   const aboutParagraphs = mentor.about || [
//     "With nearly a decade of experience in the 3D industry, I have navigated the evolution of digital art from traditional poly-modeling to the procedural revolution we see today. My journey began with a passion for architectural visualization, which soon expanded into the world of AAA game development and cinematic storytelling.",
//     "I believe that technical skill is only half the battle. To truly excel, an artist must understand the 'why' behind the 'how'. My mentorship philosophy focuses on creative problem-solving, efficient workflows, and building a portfolio that speaks the language of industry professionals.",
//   ];

//   const expertiseTags = mentor.expertise || [
//     "Blender 4.0",
//     "3D Modeling",
//     "PBR Texturing",
//     "Hard Surface Design",
//     "Character Sculpting",
//     "Lighting & Rendering",
//     "Geometry Nodes",
//     "Environment Art",
//     "Unreal Engine 5",
//     "Substance Painter",
//   ];

//   return (
//     <section className="bg-[#f7f7f9] py-14 sm:py-16 md:py-20">
//       <div className="container mx-auto grid grid-cols-1 gap-10 border-t border-gray-200 px-5 pt-14 sm:gap-12 sm:pt-16 md:grid-cols-2 md:gap-8 md:pt-20 lg:gap-16">
//         {/* ABOUT */}
//         <div>
//           <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
//             About {mentor.name}
//           </h2>

//           <div className="mt-5 space-y-4 sm:mt-6">
//             {aboutParagraphs.map((para, idx) => (
//               <p
//                 key={idx}
//                 className="text-sm leading-relaxed text-gray-600 sm:text-base"
//               >
//                 {para}
//               </p>
//             ))}
//           </div>
//         </div>

//         {/* AREAS OF EXPERTISE */}
//         <div>
//           <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
//             Areas of Expertise
//           </h2>

//           <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
//             {expertiseTags.map((tag, idx) => (
//               <span
//                 key={idx}
//                 className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm sm:text-sm"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutExpertise;


interface AboutExpertiseProps {
  mentor: {
    name: string;
    about?: string[]; // paragraphs
    expertise?: string[]; // tags
  };
}

const AboutExpertise = ({ mentor }: AboutExpertiseProps) => {
  const hasAbout = !!mentor.about?.length;
  const hasExpertise = !!mentor.expertise?.length;

  // Nothing to show for this mentor — hide the whole section instead of
  // falling back to placeholder/dummy content.
  if (!hasAbout && !hasExpertise) return null;

  return (
    <section className="bg-[#f7f7f9] py-14 sm:py-16 md:py-20">
      <div
        className={`container mx-auto grid grid-cols-1 gap-10 border-t border-gray-200 px-5 pt-14 sm:gap-12 sm:pt-16 ${
          hasAbout && hasExpertise ? "md:grid-cols-2" : ""
        } md:gap-8 md:pt-20 lg:gap-16`}
      >
        {/* ABOUT */}
        {hasAbout && (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
              About {mentor.name}
            </h2>

            <div className="mt-5 space-y-4 sm:mt-6">
              {mentor.about!.map((para, idx) => (
                <p
                  key={idx}
                  className="text-sm leading-relaxed text-gray-600 sm:text-base"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* AREAS OF EXPERTISE */}
        {hasExpertise && (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
              Areas of Expertise
            </h2>

            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              {mentor.expertise!.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm sm:text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutExpertise;