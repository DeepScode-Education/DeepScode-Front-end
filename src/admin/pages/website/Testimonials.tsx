import { useState } from "react";

import { Plus, Star, Trash2, Power, Edit, Eye, Play } from "lucide-react";

import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";

import { Button } from "@/components/ui/button";

import CreateTestimonial from "./CreateTestimonial";

import useTestimonials from "@/hooks/useTestimonials";

const Testimonials = () => {
  const navigate = useNavigate();

  const {
    testimonials,

    loading,

    removeTestimonial,

    toggleStatus,
  } = useTestimonials();

  const [open, setOpen] = useState(false);

  const [editData, setEditData] = useState<any | null>(null);

  return (
    <AdminLayout
      title="Testimonials"
      subtitle="Curate student and graduate testimonials."
      actions={
        <Button
          size="sm"
          className="text-white"
          onClick={() => {
            setEditData(null);

            setOpen(true);
          }}
        >
          <Plus size={14} />
          New Testimonial
        </Button>
      }
    >
      <CreateTestimonial
        open={open}
        editData={editData}
        onClose={() => {
          setOpen(false);

          setEditData(null);
        }}
      />

      {loading ? (
        <div
          className="
py-10
text-center
"
        >
          Loading...
        </div>
      ) : (
        <div
          className="
grid
grid-cols-1
gap-4
md:grid-cols-2
xl:grid-cols-3
"
        >
          {testimonials.map((t) => (
            <div
              key={t._id}
              className="
rounded-xl
border
bg-card
p-5
"
            >
              <div
                className="
flex
justify-between
items-center
"
              >
                <div
                  className="
flex
gap-3
items-center
"
                >
                  <img
                    src={t.image?.url}
                    alt={t.name}
                    className="
h-12
w-12
rounded-full
object-cover
"
                  />

                  <div>
                    <h3
                      className="
font-semibold
text-sm
"
                    >
                      {t.name}
                    </h3>

                    <p
                      className="
text-xs
text-muted-foreground
"
                    >
                      {t.role}
                    </p>
                  </div>
                </div>

                <span
                  className={`

text-xs
rounded-full
px-2
py-1


${t.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}

`}
                >
                  {t.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Video Preview */}

              {(() => {
                const videoValue = t.video as string | { url: string } | null;

                const videoUrl =
                  typeof videoValue === "string" ? videoValue : videoValue?.url;

                return videoUrl ? (
                  <div
                    className="
relative
mt-4
h-40
overflow-hidden
rounded-lg
bg-black
"
                  >
                    <video
                      src={videoUrl}
                      className="
h-full
w-full
object-cover
"
                    />

                    <button
                      onClick={() =>
                        navigate(`/admin/website/testimonials/${t._id}`)
                      }
                      className="
absolute
inset-0
flex
items-center
justify-center
bg-black/40
text-white
"
                    >
                      <span
                        className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-orange-500
"
                      >
                        <Play size={20} fill="white" />
                      </span>
                    </button>
                  </div>
                ) : null;
              })()}

              <div
                className="
mt-4
flex
gap-1
text-yellow-500
"
              >
                {Array.from({
                  length: 5,
                }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < t.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <p
                className="
mt-3
text-sm
text-muted-foreground
line-clamp-3
"
              >
                "{t.text}"
              </p>

              <div
                className="
mt-5
flex
gap-2
"
              >
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(`/admin/website/testimonials/${t._id}`)
                  }
                >
                  <Eye size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditData(t);

                    setOpen(true);
                  }}
                >
                  <Edit size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(t._id, !t.isActive)}
                >
                  <Power size={14} />
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeTestimonial(t._id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default Testimonials;
