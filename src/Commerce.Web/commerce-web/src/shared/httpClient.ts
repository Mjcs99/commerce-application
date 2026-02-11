export class ApiError extends Error {
  public status: number;
  public body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string) {
  const base = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!base) return path; 
  return new URL(path, base).toString();
}

async function parseBody(res: Response) {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function http<T>(path: string, init: RequestInit & { body?: any } = {}): Promise<T> {
  const url = buildUrl(path);

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
    body: init.body !== undefined ? init.body : undefined,
  });

  if (!res.ok) {
    const body = await parseBody(res).catch(() => undefined);
    throw new ApiError(`Request failed (${res.status})`, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await parseBody(res)) as T;
}

export async function get<T>(path: string, init?: RequestInit){
  return http<T>(path, { ...init, method: "GET" });
}

export async function post<T>(path: string,  
                              init?: RequestInit) {
  return http<T>(path, { ...init, method: "POST" });
}

export async function patch<T>(path: string,  
                              init?: RequestInit) {
  return http<T>(path, { ...init, method: "PATCH" });
}