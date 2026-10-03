import React, { useEffect, useState } from "react";
import axios from "axios";

interface Student {
  _id: string;

  name: string;

  role: string;

  company: string;

  image: {
    url: string;
  };

  offerLetter?: {
    url: string;
  };
}

const StudentSkeleton = () => {
  return (
    <div
      style={{
        display: "flex",
        gap: "32px",
        width: "max-content",
      }}
    >
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          style={{
            width: "280px",

            height: "360px",

            flexShrink: 0,

            borderRadius: "32px",

            background: "#e5e7eb",

            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
};

const StudentPlacementSlider = () => {
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE;

  // Avoid runtime style injection; animation is defined in global CSS.

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_BASE}/api/placements`);

      setStudents(response.data.data || []);
    } catch (error) {
      console.log("Placement API Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const sliderStudents =
    students.length <= 3
      ? [...students, ...students, ...students]
      : [...students, ...students];

  if (loading || students.length === 0) {
    return (
      <section
        style={{
          width: "100%",

          overflow: "hidden",

          padding: "50px 0",
        }}
      >
        <StudentSkeleton />
      </section>
    );
  }

  return (
    <section className="student-placement-section">
    
  <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-bold ">
        Our Successful Alumni
      </h2>
      <p className="mt-3 text-sm md:text-base text-gray-500">
        Meet our students who are building successful careers
      </p>
    </div>

      <div
        className="student-placement-track"
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = "running";
        }}
      >
        {sliderStudents.map((student, index) => (
          <div
            key={`${student._id}-${index}`}
            style={{
              width: "280px",

              height: "360px",

              flexShrink: 0,

              borderRadius: "32px",

              overflow: "hidden",

              position: "relative",

              background: "#3545f5",

              transition: "all .4s ease",

              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";

              const btn = e.currentTarget.querySelector(
                ".offer-btn",
              ) as HTMLElement;

              if (btn) {
                btn.style.opacity = "1";

                btn.style.transform = "translateX(-50%) translateY(0)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";

              const btn = e.currentTarget.querySelector(
                ".offer-btn",
              ) as HTMLElement;

              if (btn) {
                btn.style.opacity = "0";

                btn.style.transform = "translateX(-50%) translateY(20px)";
              }
            }}
          >
            <img
              src={student.image?.url}
              alt={student.name}
              className="student-placement-image"
              loading="lazy"
              decoding="async"
              width={280}
              height={360}
            />

            <div
              style={{
                position: "absolute",

                inset: 0,

                background:
                  "linear-gradient(to top,rgba(30,45,220,.95),transparent 60%)",
              }}
            />

            <div
              style={{
                position: "absolute",

                bottom: "25px",

                left: "20px",

                right: "20px",

                color: "#fff",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",

                  fontWeight: 700,

                  marginBottom: "6px",
                }}
              >
                {student.name}
              </h3>

              <p
                style={{
                  fontSize: "13px",

                  fontWeight: 500,

                  margin: 0,
                }}
              >
                {student.role}
              </p>

              <p
                style={{
                  fontSize: "12px",

                  opacity: 0.9,

                  margin: 0,
                }}
              >
                {student.company}
              </p>
            </div>

            {student.offerLetter?.url && (
              <button
                className="offer-btn"
                onClick={() => {
                  window.open(student.offerLetter?.url, "_blank");
                }}
                style={{
                  position: "absolute",

                  bottom: "25px",

                  left: "50%",

                  transform: "translateX(-50%) translateY(20px)",

                  opacity: 0,

                  transition: "all .4s ease",

                  background: "#fff",

                  color: "#3545f5",

                  border: "none",

                  padding: "10px 22px",

                  borderRadius: "30px",

                  fontSize: "13px",

                  fontWeight: 600,

                  cursor: "pointer",

                  zIndex: 5,

                  whiteSpace: "nowrap",
                }}
              >
                View Offer Letter
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StudentPlacementSlider;
