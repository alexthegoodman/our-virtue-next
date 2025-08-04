"use client";

import { useEffect, useState, useRef } from "react";
import Map, { Layer, Source, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { PovertyDataSource } from "@prisma/client";
import styles from "./PovertyMap.module.css";

interface PovertyMapProps {
  data: PovertyDataSource[];
}

interface RegionData {
  name: string;
  center: [number, number];
  bounds: [[number, number], [number, number]];
  dataSources: PovertyDataSource[];
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Regional data with approximate centers and bounds for African regions
const REGION_COORDINATES: Record<
  string,
  { center: [number, number]; bounds: [[number, number], [number, number]] }
> = {
  "West Africa": {
    center: [-4, 10],
    bounds: [
      [-17, 4],
      [9, 16],
    ],
  },
  "East Africa": {
    center: [35, 0],
    bounds: [
      [21, -12],
      [50, 18],
    ],
  },
  "Central Africa": {
    center: [20, 0],
    bounds: [
      [8, -13],
      [31, 10],
    ],
  },
  "Southern Africa": {
    center: [25, -25],
    bounds: [
      [11, -35],
      [39, -15],
    ],
  },
  "North Africa": {
    center: [15, 25],
    bounds: [
      [-17, 15],
      [47, 37],
    ],
  },
  Africa: {
    center: [20, 0],
    bounds: [
      [-17, -35],
      [50, 37],
    ],
  },
};

const DATA_TYPE_COLORS: Record<string, string> = {
  poverty_rate: "#dc2626",
  income_distribution: "#ea580c",
  housing_cost: "#d97706",
  food_insecurity: "#ca8a04",
  employment: "#65a30d",
  education: "#16a34a",
  healthcare: "#059669",
  agricultural_profile: "#0d9488",
  continental_analysis: "#0e7490",
  other: "#6366f1",
};

export default function PovertyMap({ data }: PovertyMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 20,
    latitude: 0,
    zoom: 3,
  });
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [popupLongitude, setPopupLongitude] = useState<number | null>(null);
  const [popupLatitude, setPopupLatitude] = useState<number | null>(null);
  const [filterDataType, setFilterDataType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const mapRef = useRef<any>(null);

  // Group data by geographic scope
  const regionData: RegionData[] = Object.entries(
    data.reduce((acc, source) => {
      const region = source.geographicScope;
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(source);
      return acc;
    }, {} as Record<string, PovertyDataSource[]>)
  ).map(([region, sources]) => ({
    name: region,
    center: REGION_COORDINATES[region]?.center || [0, 0],
    bounds: REGION_COORDINATES[region]?.bounds || [
      [-180, -90],
      [180, 90],
    ],
    dataSources: sources,
  }));

  // Filter data by type if selected
  const filteredRegionData = filterDataType
    ? regionData
        .map((region) => ({
          ...region,
          dataSources: region.dataSources.filter(
            (source) => source.dataType === filterDataType
          ),
        }))
        .filter((region) => region.dataSources.length > 0)
    : regionData;

  // Create GeoJSON for region circles
  const geoJsonData = {
    type: "FeatureCollection" as const,
    features: filteredRegionData.map((region, index) => ({
      type: "Feature" as const,
      id: index,
      properties: {
        name: region.name,
        dataCount: region.dataSources.length,
        primaryDataType: region.dataSources[0]?.dataType || "other",
      },
      geometry: {
        type: "Point" as const,
        coordinates: region.center,
      },
    })),
  };

  const handleRegionClick = (event: any) => {
    const feature = event.features?.[0];
    if (feature) {
      const regionName = feature.properties.name;
      const region = filteredRegionData.find((r) => r.name === regionName);
      if (region) {
        setSelectedRegion(region);
        setPopupLongitude(feature.geometry.coordinates[0]);
        setPopupLatitude(feature.geometry.coordinates[1]);
      } else {
        // show error
        console.error("Region not found for clicked feature:", regionName);
        setSelectedRegion(null);
        setPopupLongitude(null);
        setPopupLatitude(null);
      }
    } else {
      // show error
      console.error("No feature found at clicked location");
      setSelectedRegion(null);
      setPopupLongitude(null);
      setPopupLatitude(null);
    }
  };

  const getDataTypes = () => {
    const types = new Set(data.map((source) => source.dataType));
    return Array.from(types);
  };

  useEffect(() => {
    // Simulate loading time for map initialization
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={styles.error}>
        <h3>Map Configuration Error</h3>
        <p>
          Mapbox access token is required. Please set
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.controls}>
        <div className={styles.filterSection}>
          <label htmlFor="dataTypeFilter">Filter by Data Type:</label>
          <select
            id="dataTypeFilter"
            value={filterDataType}
            onChange={(e) => setFilterDataType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Data Types</option>
            {getDataTypes().map((type) => (
              <option key={type} value={type}>
                {type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.legend}>
          <h4>Data Types</h4>
          {getDataTypes().map((type) => (
            <div key={type} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: DATA_TYPE_COLORS[type] }}
              />
              <span>
                {type
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <p>Loading poverty map...</p>
        </div>
      )}

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={["poverty-data-circles"]}
        onClick={handleRegionClick}
      >
        <Source id="poverty-data" type="geojson" data={geoJsonData}>
          <Layer
            id="poverty-data-circles"
            type="circle"
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "dataCount"],
                1,
                20,
                5,
                40,
                10,
                60,
              ],
              "circle-color": [
                "case",
                ["==", ["get", "primaryDataType"], "poverty_rate"],
                DATA_TYPE_COLORS.poverty_rate,
                ["==", ["get", "primaryDataType"], "income_distribution"],
                DATA_TYPE_COLORS.income_distribution,
                ["==", ["get", "primaryDataType"], "housing_cost"],
                DATA_TYPE_COLORS.housing_cost,
                ["==", ["get", "primaryDataType"], "food_insecurity"],
                DATA_TYPE_COLORS.food_insecurity,
                ["==", ["get", "primaryDataType"], "employment"],
                DATA_TYPE_COLORS.employment,
                ["==", ["get", "primaryDataType"], "education"],
                DATA_TYPE_COLORS.education,
                ["==", ["get", "primaryDataType"], "healthcare"],
                DATA_TYPE_COLORS.healthcare,
                ["==", ["get", "primaryDataType"], "agricultural_profile"],
                DATA_TYPE_COLORS.agricultural_profile,
                ["==", ["get", "primaryDataType"], "continental_analysis"],
                DATA_TYPE_COLORS.continental_analysis,
                DATA_TYPE_COLORS.other,
              ],
              "circle-opacity": 0.8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {selectedRegion && popupLongitude !== null && popupLatitude !== null && (
          <Popup
            key={`${selectedRegion.name}-${popupLongitude}-${popupLatitude}`}
            longitude={popupLongitude}
            latitude={popupLatitude}
            anchor="bottom"
            onClose={() => {
              setSelectedRegion(null);
              setPopupLongitude(null);
              setPopupLatitude(null);
            }}
            className={styles.popup}
          >
            <div className={styles.popupContent}>
              <h3>{selectedRegion.name}</h3>
              <p>
                <strong>{selectedRegion.dataSources?.length}</strong> data
                sources
              </p>
              <div className={styles.dataSourcesList}>
                {selectedRegion.dataSources
                  ?.slice(0, 3)
                  .map((source, index) => (
                    <div key={index} className={styles.dataSourceItem}>
                      <div className={styles.dataSourceTitle}>
                        {source.title}
                      </div>
                      <div className={styles.dataSourceMeta}>
                        <span className={styles.dataType}>
                          {source.dataType.replace("_", " ")}
                        </span>
                        {source.isVerified && (
                          <span className={styles.verifiedBadge}>
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {selectedRegion.dataSources?.length > 3 && (
                  <div className={styles.moreDataSources}>
                    +{selectedRegion.dataSources?.length - 3} more sources
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
