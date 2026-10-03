interface MentorCTAProps {
  mentorName?: string;
}

function MentorCTA({ mentorName = "this mentor" }: MentorCTAProps) {

  const handleApply = () => {
    window.dispatchEvent(
      new CustomEvent("open-enquiry-popup")
    );
  };

  return (
    <section className="px-5 py-16">
      <div
        className="
        max-w-[1170px]
        mx-auto
        rounded-[32px]
        bg-gradient-to-r
        from-[#18191d]
        to-[#20254a]
        px-6
        py-16
        text-center
        "
      >

        <h2
          className="
          text-3xl
          md:text-5xl
          font-bold
          text-white
          mb-4
          "
        >
          Ready to Learn from {mentorName}?
        </h2>


        <p
          className="
          max-w-[600px]
          mx-auto
          text-gray-300
          text-base
          md:text-lg
          leading-7
          mb-8
          "
        >
          Secure your spot in the next mentorship cohort and accelerate your
          path to becoming a professional 3D artist.
        </p>


        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={handleApply}
            className="
            bg-[#3157FF]
            text-white
            px-8
            py-3
            rounded-full
            font-semibold
            hover:opacity-90
            transition
            "
          >
            Apply for Mentorship
          </button>

        </div>

      </div>
    </section>
  );
}

export default MentorCTA;