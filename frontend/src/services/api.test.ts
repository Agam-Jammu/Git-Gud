import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  createRoom,
  fetchCategories,
  fetchPracticeQuestions,
  fetchRoomStatus,
} from "./api";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function requestedUrl(call = 0): string {
  return fetchMock.mock.calls[call]?.[0] as string;
}

describe("api client", () => {
  it("creates a room with a POST", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: "ABC123" }, 201));

    await expect(createRoom()).resolves.toEqual({ code: "ABC123" });
    expect(requestedUrl()).toBe("http://localhost:8080/api/v1/rooms");
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ method: "POST" });
  });

  it("encodes the room code when checking status", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ code: "A B", state: "LOBBY", players: [] }));

    await expect(fetchRoomStatus("A B")).resolves.toMatchObject({ state: "LOBBY" });
    expect(requestedUrl()).toBe("http://localhost:8080/api/v1/rooms/A%20B");
  });

  it("loads the categories", async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ name: "Java & Spring Boot", questionCount: 10 }]));

    await expect(fetchCategories()).resolves.toHaveLength(1);
    expect(requestedUrl()).toBe("http://localhost:8080/api/v1/categories");
  });

  it("requests the default practice limit", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchPracticeQuestions();

    expect(requestedUrl()).toBe("http://localhost:8080/api/v1/practice/questions?limit=5");
  });

  it("honours a custom practice limit", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await fetchPracticeQuestions(2);

    expect(requestedUrl()).toBe("http://localhost:8080/api/v1/practice/questions?limit=2");
  });

  it("surfaces the problem detail on a failed request", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "No room with code ZZZZZZ" }, 404));

    await expect(fetchRoomStatus("ZZZZZZ")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "No room with code ZZZZZZ",
    });
  });

  it("falls back to a generic message when the error body is not json", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    });

    await expect(fetchCategories()).rejects.toBeInstanceOf(ApiError);
    await expect(fetchCategories()).rejects.toMatchObject({
      status: 500,
      message: "Request failed with status 500",
    });
  });
});
