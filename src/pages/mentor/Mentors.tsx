
import { useEffect, useState } from "react";
import axios from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Instagram, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/data/mentors";

const API_BASE = import.meta.env.VITE_API_BASE;

interface Mentor {
  _id: string;
  slug?: string;
  name: string;
  designation?: string;
  company?: string;
  expertise: string[];
  rating: number;
  studentsCount: number;
  linkedinUrl?: string;
  instagramUrl?: string;
  photoUrl?: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const Mentors = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const initAos = async () => {
      const [{ default: AOS }] = await Promise.all([
        import("aos"),
        import("aos/dist/aos.css"),
      ]);

      if (!isMounted) return;
      AOS.init({
        duration: 700,
        once: true,
      });
    };

    initAos();
    fetchMentors();

    return () => {
      isMounted = false;
    };
  }, []);

  // const fetchMentors = async () => {
  //   try {
  //     const res = await axios.get(`${API_BASE}/api/mentors`);

  //     setMentors(res.data.data || []);
  //   } catch (error) {
  //     console.error("Mentor fetch error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const fetchMentors = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/mentors`);

    const data = res.data.data || [];

    const priorityNames = ["Shadman Ahmed", "Sunny Singh"];

    const sortedMentors = [
      ...priorityNames
        .map((name) => data.find((mentor: Mentor) => mentor.name === name))
        .filter(Boolean),
      ...data.filter(
        (mentor: Mentor) => !priorityNames.includes(mentor.name)
      ),
    ];

    setMentors(sortedMentors);
  } catch (error) {
    console.error("Mentor fetch error:", error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading mentors...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-5 py-20">
        {/* Header */}

        <div data-aos="fade-up" className="text-center max-w-3xl mx-auto">
          <Badge className="mb-5 px-4 py-1 text-white">Industry Experts</Badge>

          <h1 className="text-2xl lg:text-4xl font-bold text-black">
            Learn from the best mentors in India
          </h1>

          <p className="mt-5 text-gray-500 text-lg">
            Get guidance from experienced industry professionals in Design,
            Marketing, Data Science and 3D.
          </p>
        </div>

        {/* Cards */}

      <div
  className="
    mt-14
    grid
    grid-cols-1
    md:grid-cols-2
    lg:grid-cols-3
    min-[1440px]:grid-cols-4
    gap-6
    max-w-7xl
    mx-auto
  "
>
          {mentors.map((mentor, index) => (
            // <Card
            //   key={mentor._id}
            //   onClick={() => navigate(`//${mentor.slug || slugify(mentor.name)}`)}
            //   data-aos="zoom-in"
            //   data-aos-delay={index * 100}
            //   className="
            //   h-full
            //   rounded-3xl
            //   border
            //   shadow-sm
            //   hover:shadow-xl
            //   transition-all
            //   duration-300
            //   hover:-translate-y-2
            //   cursor-pointer
            //   "
            // >

            <Card
  key={mentor._id}
  onClick={() =>
    navigate(`/mentors/${mentor.slug || slugify(mentor.name)}`)
  }
  data-aos="zoom-in"
  data-aos-delay={index * 100}
  className="
    h-full
    rounded-3xl
    border
    shadow-sm
    hover:shadow-xl
    transition-all
    duration-300
    hover:-translate-y-2
    cursor-pointer
  "
>
              <CardContent className="p-6 flex flex-col h-full">
                {/* Profile */}

                <div className="flex items-center gap-4">
                  {mentor.photoUrl ? (
                    <img
                      src={mentor.photoUrl}
                      alt={mentor.name}
                      className="
                    w-20
                    h-20
                    rounded-full
                    object-cover
                    border
                    "
                    />
                  ) : (
                    <div
                      className="
                    w-20
                    h-20
                    rounded-full
                    bg-[#0037FF]
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-bold
                    "
                    >
                      {getInitials(mentor.name)}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold">{mentor.name}</h3>

                    <p className="text-sm text-gray-500">
                      {mentor.designation}

                      {mentor.company && ` · ${mentor.company}`}
                    </p>
                  </div>
                </div>

                {/* Expertise */}

                <div className="mt-5 flex flex-wrap gap-2">
                  {mentor.expertise?.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Spacer */}

                <div className="flex-1" />

                {/* Stats */}

                <div
                  className="
                  mt-6
                  pt-4
                  border-t
                  flex
                  justify-between
                  "
                >
                  <div className="flex items-center gap-1">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />

                    <span className="font-semibold">{mentor.rating}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <Users size={15} />

                    <span>{mentor.studentsCount || 0} learners</span>
                  </div>
                </div>

                {/* Social */}

                <div className="mt-5 flex gap-3">
                  {mentor.linkedinUrl && (
                    <a
                      href={mentor.linkedinUrl}
                      target="_blank"
                      className="
                  flex-1
                  flex
                  justify-center
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#0037FF]
                  text-white
                  py-3
                  text-sm
                  font-semibold
                  "
                    >
                      <Linkedin size={16} />
                      LinkedIn
                    </a>
                  )}

                  {mentor.instagramUrl && (
                    <a
                      href={mentor.instagramUrl}
                      target="_blank"
                      className="
                  flex-1
                  flex
                  justify-center
                  items-center
                  gap-2
                  rounded-xl
                  bg-gradient-to-r
                  from-pink-500
                  to-orange-500
                  text-white
                  py-3
                  text-sm
                  font-semibold
                  "
                    >
                      <Instagram size={16} />
                      Instagram
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mentors.length === 0 && (
          <div className="text-center mt-10 text-gray-500">
            No mentors found.
          </div>
        )}
      </main>
    </div>
  );
};

export default Mentors;
