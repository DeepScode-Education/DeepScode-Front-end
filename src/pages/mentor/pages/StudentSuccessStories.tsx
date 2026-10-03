import { Star, Plus } from "lucide-react";
import type { Testimonial } from "@/types/mentor";


interface Props {
  testimonials: Testimonial[];
  totalStudents: string;
}

function StudentSuccessStories({ testimonials, totalStudents }: Props) {
  return (
    <section
      style={{
        padding: "90px 20px",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "60px",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Student Success Stories
          </h2>

          <p
            style={{
              color: "#6B7280",
              fontSize: "17px",
            }}
          >
            Hear from the artists who have transitioned into professional roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {testimonials.map((item) => (
            <div
              key={item.id}
		className="w-full h-[300px]"
              style={{
                border: "1px solid #ECECEC",
                borderRadius: 24,
                padding: 20,
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 200,
                      margin: 0,
                    }}
                  >
                    {item.name}
                  </h4>

                  <span
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    {item.designation}
                  </span>
                </div>
              </div>

              <p
                style={{
                  color: "#555",
                  lineHeight: 1.4,
                  fontStyle: "italic",
                  minHeight: 140,
                }}
              >
                "{item.review}"
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginTop: 18,
                }}
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#3157FF" color="#3157FF" />
                ))}
              </div>
            </div>
          ))}

          {/* CTA Card */}

          <div
            style={{
              border: "1px solid #ECECEC",
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
              background: "#fff",
            }}
          >
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: "50%",
                background: "#F3F4F6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <Plus size={36} />
            </div>

            <p
              style={{
                color: "#4B5563",
                fontSize: 18,
              }}
            >
              Join {totalStudents} successful students
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudentSuccessStories;
