import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";

type obj = {
  [key: string]: any;
};

const request = axios.create({
  baseURL: import.meta.env.APP_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

request.interceptors.request.use((config: AxiosRequestConfig) => {
  const customHeaders: obj = {};
  return {
    ...config,
    headers: {
      ...config.headers,
      ...customHeaders
    }
  };
});

// after send request
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
export { request };
