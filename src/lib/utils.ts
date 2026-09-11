import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCookie = (name: string) =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

type ClientData = {
  userAgent: string;
  latitude: number | null;
  longitude: number | null;
};

export const getClientData = async (): Promise<ClientData> => {
  const userAgent = navigator.userAgent;

  let latitude: number | null = null;
  let longitude: number | null = null;

  if ("geolocation" in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        },
      );

      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    } catch (error) {
      console.warn("Unable to fetch location:", error);
    }
  }

  return { userAgent, latitude, longitude };
};
