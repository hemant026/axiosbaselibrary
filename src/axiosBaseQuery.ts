import {
  BaseQueryFn,
  FetchBaseQueryError,
  fetchBaseQuery,
  FetchArgs,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query/react";
import axios, { AxiosRequestConfig, AxiosError, Method } from "axios";

interface IAxiosBaseQuery {
  baseUrl?: string;
  headers?: (headers: { [key: string]: string }) => { [key: string]: string };
}

interface IBaseQuery {
  url: string;
  params?: { [key: string]: string | number };
  method: Method;
  data?: AxiosRequestConfig["data"];
  error?: {
    status: number;
    data: string;
  };
}

export const axiosBaseQuery = ({
  baseUrl = "",
  headers,
}: IAxiosBaseQuery): BaseQueryFn<
  IBaseQuery,
  unknown,
  {
    status?: number;
    data?: unknown;
    error?: {
      status: number | string;
      data: unknown;
    };
  }
> => {
  return async ({ url, params, method, data }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method: method,
        ...(params && { params: params }),
        ...(headers && { headers: headers({}) }),
        ...(data && { data: data }),
        responseType: "json",
      });
      return {
        data: result.data,
      };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: { status: err.response?.status, data: err.response?.data },
      };
    }
  };
};

export const APIBaseQueryInterceptor = axiosBaseQuery({
  baseUrl: "https://jsonplaceholder.typicode.com",
  headers: (headers) => {
    const token = "test";
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
    return headers;
  },
});

export const APIBaseQuery: BaseQueryFn<IBaseQuery, unknown, unknown> = async (
  args,
  api,
  extraOptions
) => {
  const result = await APIBaseQueryInterceptor(args, api, extraOptions);

  if (result.error && result.error.status === 404) {
    // try to get a new token
    //const refreshResult = await APIBaseQueryInterceptor('/refreshToken', api, extraOptions);
    console.log("test");
    if (false) {
      // store the new token
      //api.dispatch(tokenReceived(refreshResult.data));
      // retry the initial query
      //result = await APIBaseQueryInterceptor(args, api, extraOptions);
    } else {
      //api.dispatch(loggedOut());
    }
  }
  return result;
};