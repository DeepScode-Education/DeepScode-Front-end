export type LiveClassStatus = "scheduled" | "live" | "ended" | "cancelled";

export type BatchDays = "MTW" | "MWT" | "MTT" | "SS";
export type BatchTime = "10:00-12:00" | "12:00-2:00" | "2:30-4:30" | "4:30-6:30";

export interface LiveClassBatch {
  days: BatchDays;
  time: BatchTime;
}

export interface LiveClassCourseRef {
  _id: string;
  title: string;
}

export interface LiveClassMentorRef {
  _id: string;
  fullName: string;
}

export interface LiveClass {
  _id: string;
  course: LiveClassCourseRef | string;
  mentor: LiveClassMentorRef | string;
  batch: LiveClassBatch;
  title: string;
  status: LiveClassStatus;
  provider: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface JoinClassPayload {
  token?: string;
  livekitUrl?: string;
  roomName?: string;
  liveClassId?: string;
  role?: "mentor" | "student";
  title?: string;
}

export interface StartClassPayload {
  courseId: string;
  days: BatchDays;
  time: BatchTime;
  title?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}