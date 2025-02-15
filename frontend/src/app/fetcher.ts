import { AuthActions } from "@/lib/auth"

// Extract necessary functions from the AuthActions utility.
const { handleJWTRefresh, storeToken, getToken, removeTokens } = AuthActions();
const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://turntable-django-4426.onrender.com";

const fetchWithAuth = async (url: string, options = {} as any) => {
    const token = getToken("access", options?.cookies);
    const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    if (!(options?.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }


    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        try {
            const { access } = await (await handleJWTRefresh()).json() as any;
            storeToken(access, "access");

            const retryHeaders = {
                ...headers,
                Authorization: `Bearer ${access}`
            };

            const retryResponse = await fetch(url, { ...options, headers: retryHeaders });
            if (retryResponse.status === 401) {
                removeTokens();
                if (typeof window !== "undefined") {
                    window.location.replace("/");
                }
            }

            return retryResponse.json();
        } catch (err) {
            removeTokens();
            if (typeof window !== "undefined") {
                window.location.replace("/");
            }
        }
    }

    return response
};



export const fetcher = (
    url: string,
    options: { method?: string, body?: any, next?: any, cookies?: any, headers?: any } = {}
): Promise<any> => {
    const { method = "GET", body, next, cookies } = options;

    let fullUrl = `${baseUrl}${url}`;
    let fetchOptions : any = {
        method,
        ...(body ? { body: ((body instanceof FormData) ? body : JSON.stringify(body)) } : {}),
        ...(cookies ? { cookies } : {})
    };

    if(!(body instanceof FormData)) {
        fetchOptions['headers'] = {
          "Content-Type": "application/json",
        }
      }


    if (next?.tags) {
        // @ts-ignore
        fetchOptions.headers = {
            // @ts-ignore
            ...fetchOptions.headers,
            'Cache-Control': `max-age=0, s-maxage=86400, stale-while-revalidate, tag=${next.tags.join(',')}`,
        };
    }

    return fetchWithAuth(fullUrl, fetchOptions);
};

export const fetcherAuth = async (url: string): Promise<any> => {
    const response = await fetchWithAuth(`${baseUrl}${url}`);
    return response.json()
};