let AdvancedMarkerElementRef:
  | typeof google.maps.marker.AdvancedMarkerElement
  | null = null;

export const loadMarkerLibrary = async () => {
  if (!AdvancedMarkerElementRef) {
    const { AdvancedMarkerElement } = (await google.maps.importLibrary(
      "marker",
    )) as google.maps.MarkerLibrary;
    AdvancedMarkerElementRef = AdvancedMarkerElement;
  }
  return AdvancedMarkerElementRef;
};

export const createMarkerContent = (title: string) => {
  const div = document.createElement("div");
  div.style.width = "24px";
  div.style.height = "24px";
  div.style.background = "#FF8E9E";
  div.style.borderRadius = "50%";
  div.style.cursor = "pointer";
  div.title = title;
  return div;
};

export const clearAllMarkers = (
  markersMap: Map<string, google.maps.marker.AdvancedMarkerElement>,
) => {
  markersMap.forEach((marker) => (marker.map = null));
  markersMap.clear();
};
