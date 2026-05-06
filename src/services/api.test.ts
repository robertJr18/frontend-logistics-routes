import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./api";
import { authStorage } from "@/lib/authStorage";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  authStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function jsonResponse(status: number, body: unknown) {
  return new Response(body !== undefined ? JSON.stringify(body) : null, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api request", () => {
  it("inyecta Authorization header cuando hay token en storage", async () => {
    authStorage.setToken("fake-token");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await api.get("/api/test");

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer fake-token");
  });

  it("no inyecta Authorization si no hay token", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await api.get("/api/test");

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("no inyecta Authorization cuando skipAuth es true aunque haya token", async () => {
    authStorage.setToken("fake-token");
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await api.post("/api/auth/login", { email: "x" }, { skipAuth: true });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("dispara evento auth:unauthorized en respuesta 401", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: "unauthorized" }));
    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);

    await expect(api.get("/api/test")).rejects.toBeInstanceOf(ApiError);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:unauthorized", listener);
  });

  it("no dispara evento en 403 (sin permisos pero con sesión)", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(403, { message: "forbidden" }));
    const listener = vi.fn();
    window.addEventListener("auth:unauthorized", listener);

    await expect(api.get("/api/test")).rejects.toBeInstanceOf(ApiError);

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener("auth:unauthorized", listener);
  });

  it("retorna undefined en 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await api.delete("/api/test");

    expect(result).toBeUndefined();
  });

  it("retorna body parseado en 200", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { value: 42 }));

    const result = await api.get<{ value: number }>("/api/test");

    expect(result).toEqual({ value: 42 });
  });

  it("ApiError contiene status y body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(409, { code: "PLACA_DUPLICADA" }));

    try {
      await api.post("/api/vehiculos", {});
      expect.fail("debería haber lanzado");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(409);
      expect((err as ApiError).body).toEqual({ code: "PLACA_DUPLICADA" });
    }
  });
});
