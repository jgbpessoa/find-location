import axios from "axios";
const API_KEY = "e0a33a51610943918afbcfe29b798665";

declare var ol: any;

type GeoapifyResponse = {
  features: {
    properties: { lat: number; lon: number; formatted: string };
  }[];
};

const form = document.querySelector("form")!;
const addressInput = document.getElementById("address")! as HTMLInputElement;

function searchAddressHandler(event: Event) {
  event.preventDefault();
  const enteredAddress = addressInput.value;

  // Send to API
  axios
    .get<GeoapifyResponse>(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURI(
        enteredAddress
      )}&apiKey=${API_KEY}`
    )
    .then((response) => {
      if (response.data.features.length === 0) {
        throw new Error("Could not fetch location! Try again...");
      }

      const { lat } = response.data.features[0].properties;
      const { lon } = response.data.features[0].properties;
      const { formatted } = response.data.features[0].properties;

      document.getElementById("map")!.innerHTML = "";

      const iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])),
        name: "Your location!",
      });

      new ol.Map({
        target: "map",
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM(),
          }),
          new ol.layer.Vector({
            source: new ol.source.Vector({
              features: [iconFeature],
            }),
            style: new ol.style.Style({
              image: new ol.style.Icon({
                anchor: [0.5, 46],
                anchorXUnits: "fraction",
                anchorYUnits: "pixels",
                src: "https://openlayers.org/en/latest/examples/data/icon.png",
              }),
            }),
          }),
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([lon, lat]),
          zoom: 16,
        }),
      });

      const formattedAddress = document.getElementById(
        "formatted"
      )! as HTMLParagraphElement;

      formattedAddress.innerText = formatted;
    })
    .catch((error) => alert(error));
}

form.addEventListener("submit", searchAddressHandler);
