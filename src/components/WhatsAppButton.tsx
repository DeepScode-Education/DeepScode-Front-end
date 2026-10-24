import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const COURSES = [
  "UI/UX Design",
  "Graphics Design",
  "Motion Graphics & VFX",
  "3D Design & Animation",
  "Digital Marketing",
  "Data Analytics",
];

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const phone = "918700460998";

  const handleCourseSelect = (course: string) => {
    const message = `Hi deepScode Education,

I am interested in the ${course} course.

Please share:
• Course Details
• Duration
• Fees Structure
• Upcoming Batch Information

Thank you.`;

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-24 right-6 z-[9998]
          flex items-center justify-center
          w-14 h-14 rounded-full
          bg-[#25D366]
          text-white
          shadow-xl
          hover:scale-110
          transition-transform
        "
        aria-label="WhatsApp Chat"
      >
        <FaWhatsapp size={32} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">
                Which course are you interested in?
              </h3>

              <button
                onClick={() => setIsOpen(false)}
                className="text-xl text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {COURSES.map((course) => (
                <button
                  key={course}
                  onClick={() => handleCourseSelect(course)}
                  className="
                    w-full
                    text-left
                    p-3
                    rounded-xl
                    border
                    bg-white
                    hover:bg-green-50
                    hover:border-green-500
                    transition
                  "
                >
                  <span className="text-black font-medium">
                    {course}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;