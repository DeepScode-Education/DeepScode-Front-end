import {
  BASE_URL,
  getAdminToken,
  getToken,
} from "@/integrations/client";

import type { Testimonial } from "@/types/testimonial";

export interface TestimonialsResponse {
  data: Testimonial[];
}

const request = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getAdminToken() ?? getToken();

  const isFormData = options.body instanceof FormData;

  const response = await fetch(
    `${BASE_URL}${url}`,

    {
      ...options,

      headers: {
        ...(isFormData
          ? {}
          : {
              "Content-Type": "application/json",
            }),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Request failed",
    }));

    throw new Error(error.message || "Something went wrong");
  }

  return response.json();
};

// GET ADMIN LIST

export const getAdminTestimonials = async (): Promise<TestimonialsResponse> => {
  return request<TestimonialsResponse>("/api/testimonials/admin");
};

// CREATE

export const createTestimonial = async (formData: FormData) => {
  return request(
    "/api/testimonials",

    {
      method: "POST",

      body: formData,
    },
  );
};

// UPDATE

export const updateTestimonial = async (
  id: string,

  formData: FormData,
) => {
  return request(
    `/api/testimonials/${id}`,

    {
      method: "PUT",

      body: formData,
    },
  );
};

// DELETE

export const deleteTestimonial = async (id: string) => {
  return request(
    `/api/testimonials/${id}`,

    {
      method: "DELETE",
    },
  );
};

// STATUS

export const updateTestimonialStatus = async (
  id: string,

  isActive: boolean,
) => {
  return request(
    `/api/testimonials/${id}/status`,

    {
      method: "PATCH",

      body: JSON.stringify({
        isActive,
      }),
    },
  );
};

// ORDER

export const updateTestimonialOrder = async (
  id: string,

  displayOrder: number,
) => {
  return request(
    `/api/testimonials/${id}/order`,

    {
      method: "PATCH",

      body: JSON.stringify({
        displayOrder,
      }),
    },
  );
};
