import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, Star } from "lucide-react";

import AdminLayout from "../../components/AdminLayout";

import { Button } from "@/components/ui/button";

import { getAdminTestimonials } from "@/services/testimonial.service";

const TestimonialDetail = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [testimonial, setTestimonial] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const response = await getAdminTestimonials();

        const data = response.data.find((item: any) => item._id === id);

        setTestimonial(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonial();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Testimonial Details" subtitle="Loading testimonial">
        <div
          className="
py-10
text-center
"
        >
          Loading...
        </div>
      </AdminLayout>
    );
  }

  if (!testimonial) {
    return (
      <AdminLayout title="Testimonial Details" subtitle="">
        <div className="py-10">Testimonial not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Testimonial Details"
      subtitle="View complete testimonial information"
    >
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-5">
        <ArrowLeft size={16} />
        Back
      </Button>

      <div
        className="
rounded-xl
border
bg-card
p-6
space-y-6
"
      >
        <div
          className="
flex
items-center
gap-5
"
        >
          <img
            src={testimonial.image?.url}
            alt={testimonial.name}
            className="
h-24
w-24
rounded-full
object-cover
"
          />

          <div>
            <h1
              className="
text-2xl
font-bold
"
            >
              {testimonial.name}
            </h1>

            <p
              className="
text-muted-foreground
"
            >
              {testimonial.role}
            </p>
          </div>
        </div>

        <div>
          <h3
            className="
font-semibold
mb-2
"
          >
            Rating
          </h3>

          <div
            className="
flex
gap-1
text-yellow-500
"
          >
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <Star
                key={index}
                size={18}
                fill={index < testimonial.rating ? "currentColor" : "none"}
              />
            ))}
          </div>
        </div>

        <div>
          <h3
            className="
font-semibold
mb-2
"
          >
            Testimonial
          </h3>

          <p
            className="
leading-relaxed
text-muted-foreground
"
          >
            "{testimonial.text}"
          </p>
        </div>

        {(() => {
          const videoUrl =
            typeof testimonial.video === "string"
              ? testimonial.video
              : testimonial.video?.url;

          return videoUrl ? (
            <div>
              <h3
                className="
font-semibold
mb-3
"
              >
                Video Testimonial
              </h3>

              <video
                src={videoUrl}
                controls
                className="
w-full
max-w-3xl
rounded-xl
"
              />
            </div>
          ) : null;
        })()}

        <div
          className="
flex
gap-3
"
        >
          <span
            className="
rounded-full
bg-green-100
px-3
py-1
text-sm
text-green-600
"
          >
            {testimonial.isActive ? "Active" : "Inactive"}
          </span>

          <span
            className="
rounded-full
bg-blue-100
px-3
py-1
text-sm
text-blue-600
"
          >
            Order:
            {testimonial.displayOrder}
          </span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TestimonialDetail;
