import React from "react";
import {
  APIProvider,
  Map,
  Marker,
  
} from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = "AIzaSyAz4-kvt2eeQnN-l7ocOV9_StxWqF3tqaY"; // Replace with your actual Google Maps API key

function BookingMap({ latitude, longitude, address }) {

  // Convert coordinates to numbers
  const lat = Number(latitude);
  const lng = Number(longitude);

  // If latitude/longitude are not available
  if (
    !latitude ||
    !longitude ||
    Number.isNaN(lat) ||
    Number.isNaN(lng)
  ) {
    return (
      <div className="worker-map-unavailable">
        <i className="bi bi-geo-alt-fill"></i>

        <div>
          <strong>Location coordinates unavailable</strong>

          <p>
            This booking does not contain an exact
            latitude and longitude.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-google-map">

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>

        <Map
          defaultCenter={{
            lat: lat,
            lng: lng
          }}
          defaultZoom={16}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId="HIVECARE_WORKER_MAP"
        >

          <Marker
            position={{
              lat: lat,
              lng: lng
            }}
            title={address || "Customer Location"}
          />

        </Map>

      </APIProvider>

    </div>
  );
}

export default BookingMap;