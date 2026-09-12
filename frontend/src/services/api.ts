import type {
  CategoryDto,
  PracticeQuestionDto,
  RoomCreatedResponse,
  RoomStatusDto,
} from "../types";

const DEFAULT_BASE_URL = "http://localhost:8080";

const configuredBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (configuredBaseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const problem = (await response.json()) as { detail?: string };
    return problem.detail ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }

  return (await response.json()) as T;
}

export function createRoom(): Promise<RoomCreatedResponse> {
  return request<RoomCreatedResponse>("/api/v1/rooms", { method: "POST" });
}

export function fetchRoomStatus(code: string): Promise<RoomStatusDto> {
  return request<RoomStatusDto>(`/api/v1/rooms/${encodeURIComponent(code)}`);
}

export function fetchCategories(): Promise<CategoryDto[]> {
  return request<CategoryDto[]>("/api/v1/categories");
}

export function fetchPracticeQuestions(limit = 5): Promise<PracticeQuestionDto[]> {
  return request<PracticeQuestionDto[]>(`/api/v1/practice/questions?limit=${limit}`);
}
