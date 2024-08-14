import { useEffect, useRef, useState } from "react";
import { Box, Button, ButtonGroup, Flex, HStack, IconButton, Input, SkeletonText, Text, useToast } from "@chakra-ui/react";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import "./Map.css";
import mapboxgl from "mapbox-gl";
import Car from "./Map/Car";

mapboxgl.accessToken = 'pk.eyJ1IjoiaGFtemF6YWlkaSIsImEiOiJja3ZtY3RodzgwNGdlMzBwaWdjNWx5cTQ3In0.2s32bZnlSY-Qg5PFmoLrJw';

const center = { lat: 26.8467, lng: 80.9462 };

function Map() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [ride, setRide] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const toast = useToast();

  const originRef = useRef();
  const destinationRef = useRef();

  useEffect(() => {
    if (map) return; // initialize map only once

    const initializeMap = ({ setMap, mapContainerRef }) => {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [center.lng, center.lat],
        zoom: 15,
      });

      map.on("load", () => {
        setMap(map);
        new mapboxgl.Marker().setLngLat([center.lng, center.lat]).addTo(map);
      });
    };

    if (!map) initializeMap({ setMap, mapContainerRef });
  }, [map]);

  async function getCoordinates(city) {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${city}.json?access_token=${mapboxgl.accessToken}`
    );
    const data = await response.json();
    return data.features[0].center; // [lng, lat]
  }

  async function calculateRoute(e) {
    e.preventDefault();
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    }

    const originCoordinates = await getCoordinates(originRef.current.value);
    const destinationCoordinates = await getCoordinates(destinationRef.current.value);

    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoordinates.join(',')};${destinationCoordinates.join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    );

    const response = await query.json();
    const data = response.routes[0];
    setDirectionsResponse(data);
    setDistance(data.legs[0].distance);
    setDuration(data.legs[0].duration);

    const coords = data.geometry.coordinates;
    const bounds = new mapboxgl.LngLatBounds(coords[0], coords[0]);

    for (const coord of coords) {
      bounds.extend(coord);
    }

    map.fitBounds(bounds, { padding: 40 });
    setRide(!ride);
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");
    originRef.current.value = "";
    destinationRef.current.value = "";
  }

  useEffect(() => {
    if (map && directionsResponse) {
      const { geometry } = directionsResponse;

      if (map.getLayer("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry,
        },
      });

      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b9ddd",
          "line-width": 8,
        },
      });
    }
  }, [map, directionsResponse]);

  const handleOriginInput = (e) => {
    setOrigin(e.target.value);
    setDestination(e.target.value);
  };

  const handleDestinationInput = (e) => {
    setDestination(e.target.value);
  };

  const handleDriverArrival = () => {
    toast({
      title: "Driver Arrival",
      description: "The driver will reach you in 5 minutes.",
      status: "info",
      duration: 10000,
      position: "top-left",
      isClosable: true,
    });
  };

  return (
    <Flex position="relative" flexDirection="column" alignItems="center" h="70vh" w="65vw" border="1px solid">
      <Box position="absolute" left={0} top={0} h="100%" w="100%" ref={mapContainerRef} />
      <Box p={4} position="absolute" left={-460} top={-25} borderRadius="lg" m={4} bgColor="white" shadow="base" minW="400" zIndex="1">
        <div className="formdiv">
          <h2>Request  Now</h2>
          <form action="">
            <br />
            <b>
              <label htmlFor="currnt location">Origin</label>
            </b>
            <br />
            <input type="text" placeholder="From" ref={originRef} onChange={handleOriginInput} />
            <br />
            <label htmlFor="destination">Destination</label>
            <br />
            <input type="text" placeholder="Where To ?" ref={destinationRef} onChange={handleDestinationInput} />
            <br />
            <br />
            <ButtonGroup>
              <Button color="white" bg="#000" type="submit" onClick={calculateRoute}>
                Calculate Route
              </Button>
              <IconButton aria-label="center back" icon={<FaTimes />} onClick={clearRoute} />
            </ButtonGroup>
            {ride ? <Car distance={distance} origin={origin} destination={destination} /> : null}
          </form>
        </div>
        <HStack spacing={4} mt={4} justifyContent="space-between">
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton
            aria-label="center back"
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.flyTo({ center: [center.lng, center.lat], zoom: 15 });
            }}
          />
          <button onClick={handleDriverArrival}>Notify Driver Arrival</button>
        </HStack>
      </Box>
    </Flex>
  );
}

export default Map;
