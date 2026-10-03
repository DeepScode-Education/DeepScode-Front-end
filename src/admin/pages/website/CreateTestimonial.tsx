import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import useTestimonials from "@/hooks/useTestimonials";

interface Props {
  open: boolean;

  onClose: () => void;

  editData?: any | null;
}

const CreateTestimonial = ({ open, onClose, editData }: Props) => {
  const {
    addTestimonial,

    editTestimonial,
  } = useTestimonials();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",

    role: "",

    text: "",

    rating: 5,

    displayOrder: 0,
  });

  const [image, setImage] = useState<File | null>(null);

  const [video, setVideo] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",

        role: editData.role || "",

        text: editData.text || "",

        rating: editData.rating || 5,

        displayOrder: editData.displayOrder || 0,
      });

      setImagePreview(editData.image?.url || null);

      setVideoPreview(
        typeof editData.video === "string"
          ? editData.video
          : editData.video?.url || null,
      );
    }
  }, [editData]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);

      formData.append("role", form.role);

      formData.append("text", form.text);

      formData.append("rating", String(form.rating));

      formData.append("displayOrder", String(form.displayOrder));

      if (image) {
        formData.append("image", image);
      }

      if (video) {
        formData.append("video", video);
      }

      if (editData) {
        await editTestimonial(
          editData._id,

          formData,
        );
      } else {
        await addTestimonial(formData);
      }

      onClose();

      setImage(null);

      setVideo(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/50
"
    >
      <div
        className="
w-full
max-w-xl
rounded-xl
bg-white
p-6
overflow-y-auto
max-h-[90vh]
"
      >
        <div
          className="
flex
justify-between
items-center
mb-5
"
        >
          <h2
            className="
text-xl
font-semibold
"
          >
            {editData ? "Edit Testimonial" : "Create Testimonial"}
          </h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
space-y-4
"
        >
          <input
            name="name"
            placeholder="Student Name"
            value={form.name}
            onChange={handleChange}
            className="
w-full
border
rounded-md
p-2
"
          />

          <input
            name="role"
            placeholder="Role"
            value={form.role}
            onChange={handleChange}
            className="
w-full
border
rounded-md
p-2
"
          />

          <textarea
            name="text"
            placeholder="Testimonial"
            value={form.text}
            onChange={handleChange}
            className="
w-full
border
rounded-md
p-2
h-24
"
          />

          <input
            type="number"
            name="rating"
            min={1}
            max={5}
            value={form.rating}
            onChange={handleChange}
            className="
w-full
border
rounded-md
p-2
"
          />

          <input
            type="number"
            name="displayOrder"
            value={form.displayOrder}
            onChange={handleChange}
            className="
w-full
border
rounded-md
p-2
"
          />

          <label>Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setImage(file);

                setImagePreview(URL.createObjectURL(file));
              }
            }}
          />

          {imagePreview && (
            <img
              src={imagePreview}
              className="
h-32
w-32
rounded-lg
object-cover
"
            />
          )}

          <label>Video</label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                setVideo(file);

                setVideoPreview(URL.createObjectURL(file));
              }
            }}
          />

          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="
w-full
rounded-lg
"
            />
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : editData
                ? "Update Testimonial"
                : "Create Testimonial"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateTestimonial;
