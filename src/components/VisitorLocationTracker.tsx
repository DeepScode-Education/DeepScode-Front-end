import { useEffect } from "react";

const VisitorLocationTracker = () => {
  useEffect(() => {
    if (!navigator.geolocation) return;

    const API_BASE = import.meta.env.VITE_API_BASE;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch(`${API_BASE}/visitor/location`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });
        } catch (error) {
          console.error("Visitor location API failed:", error);
        }
      },
      (error) => {
        console.log("Location permission/error:", error.message);
      },
      {
        timeout: 5000,
        maximumAge: 300000,
        enableHighAccuracy: false,
      }
    );
  }, []);

  return null;
};

export default VisitorLocationTracker;