import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "http://192.168.1.129:8080"; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  (config as any).__requestToken = token ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const requestToken = (error?.config as any)?.__requestToken ?? null;
    const currentToken = await AsyncStorage.getItem("token");

    // Ignore stale auth responses that arrive after logout/login switched the account.
    // These requests belong to screens from the previous session and should not surface
    // as uncaught promise errors in Expo.
    if ((status === 401 || status === 403) && (!currentToken || requestToken !== currentToken)) {
      return Promise.resolve({
        data: {
          data: null,
          message: "Ignored stale auth response",
        },
        status,
        statusText: "Ignored stale auth response",
        headers: error?.response?.headers ?? {},
        config: error?.config,
      });
    }

    return Promise.reject(error);
  }
);
