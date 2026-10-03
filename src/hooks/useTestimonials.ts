import { useCallback, useEffect, useState } from "react";

import type { Testimonial } from "@/types/testimonial";

import {
  getAdminTestimonials,
  createTestimonial,
  deleteTestimonial,
  updateTestimonialStatus,
  updateTestimonial,
  updateTestimonialOrder,
} from "@/services/testimonial.service";

const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // GET ALL

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const response = await getAdminTestimonials();

      setTestimonials(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  // CREATE

  const addTestimonial = async (formData: FormData) => {
    try {
      setLoading(true);

      await createTestimonial(formData);

      await fetchTestimonials();
    } finally {
      setLoading(false);
    }
  };

  // UPDATE

  const editTestimonial = async (id: string, formData: FormData) => {
    try {
      setLoading(true);

      await updateTestimonial(id, formData);

      await fetchTestimonials();
    } finally {
      setLoading(false);
    }
  };

  // DELETE

  const removeTestimonial = async (id: string) => {
    try {
      setLoading(true);

      await deleteTestimonial(id);

      setTestimonials((prev) => prev.filter((item) => item._id !== id));
    } finally {
      setLoading(false);
    }
  };

  // STATUS CHANGE

  const toggleStatus = async (id: string, status: boolean) => {
    await updateTestimonialStatus(id, status);

    setTestimonials((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              isActive: status,
            }
          : item,
      ),
    );
  };

  // ORDER UPDATE

  const changeOrder = async (id: string, order: number) => {
    await updateTestimonialOrder(id, order);

    await fetchTestimonials();
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  return {
    testimonials,

    loading,

    error,

    fetchTestimonials,

    addTestimonial,

    editTestimonial,

    removeTestimonial,

    toggleStatus,

    changeOrder,
  };
};

export default useTestimonials;
