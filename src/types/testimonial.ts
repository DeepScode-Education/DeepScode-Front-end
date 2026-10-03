export interface TestimonialImage {
  url: string;
  publicId?: string;
}

export interface TestimonialVideo {
  url: string;
}

export interface Testimonial {
  _id: string;

  name: string;

  role: string;

  text: string;

  image: TestimonialImage;

  video?: string | TestimonialVideo | null;

  rating: number;

  isActive: boolean;

  displayOrder: number;

  createdAt?: string;

  updatedAt?: string;
}

export interface CreateTestimonialPayload {
  name: string;

  role: string;

  text: string;

  video?: string;

  rating: number;

  displayOrder: number;

  image?: File;
}
