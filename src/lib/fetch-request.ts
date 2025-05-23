export interface IBaseResponse<T = void> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export const apiFetchRequest = async <T = void>(url: string, init?: RequestInit): Promise<T> => {
  console.log(
    "=========> api fetch request => window",
    typeof window === "undefined" ? "server" : "client",
  );
  const result = await baseFetchJson<IBaseResponse<T>>(url, init);
  if (result.success) {
    return result.data;
  } else {
    console.warn(result);
    throw new Error(result.message);
  }
};

export const baseFetchJson = async <T = void>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  return await response.json();
};

export const baseFetchText = async (url: string, init?: RequestInit): Promise<string> => {
  const response = await fetch(url, init);
  return await response.text();
};
