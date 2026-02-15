import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { FieldReport, Alert, Region } from '../types';
import { ChevronDown } from 'lucide-react';

interface MapWidgetProps {
  reports: FieldReport[];
  alerts: Alert[];
  regions?: Region[];
  height?: string;
}

const MapWidget: React.FC<MapWidgetProps> = ({ reports, alerts, regions, height = "400px" }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');

  // Helper to properly format region names (Capitalization for English, standard for Arabic)
  const formatRegionName = (name: string) => {
    if (!name) return '';
    // Capitalize first letter of each word if the name contains Latin characters
    if (/[a-zA-Z]/.test(name)) {
      return name.replace(/\b\w/g, c => c.toUpperCase());
    }
    return name;
  };

  // Helper to calculate polygon center
  const getRegionCenter = (region: Region): [number, number] | null => {
    if (!region.geometry || !region.geometry.coordinates) return null;
    
    let coords: number[][] = [];
    if (region.geometry.type === 'Polygon') {
      // GeoJSON Polygon: [ [lng, lat], ... ]
      // Type definition says coordinates is number[][][]
      coords = region.geometry.coordinates[0]; 
    } else if (region.geometry.type === 'MultiPolygon') {
       // MultiPolygon: [ [ [lng, lat], ... ] ]
       // Just use first polygon
       coords = (region.geometry.coordinates as any)[0][0];
    }

    if (!coords || coords.length === 0) return null;

    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    coords.forEach(point => {
      // GeoJSON is [lng, lat]
      const lng = point[0];
      const lat = point[1];
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
  };

  // Define default style function
  const defaultStyle = (feature: any) => {
     const turnout = feature.properties.stats.turnout;
     let color = '#3b82f6'; // default blue
     if (turnout >= 60) color = '#10b981'; // green (high turnout)
     else if (turnout >= 40) color = '#f59e0b'; // orange (medium)
     else color = '#ef4444'; // red (low)

     return {
        fillColor: color,
        weight: 1,
        opacity: 0.8,
        color: '#fff',
        dashArray: '3',
        fillOpacity: 0.3
     };
  };

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize map - Center on Lebanon (approx 33.8547° N, 35.8623° E)
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([33.8938, 35.5018], 9);

      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      // Initialize cluster group
      if ((L as any).markerClusterGroup) {
        clusterGroupRef.current = (L as any).markerClusterGroup({
           showCoverageOnHover: false,
           maxClusterRadius: 50,
           spiderfyOnMaxZoom: true,
           disableClusteringAtZoom: 16
        });
        mapInstanceRef.current.addLayer(clusterGroupRef.current!);
      } else {
        console.warn("L.markerClusterGroup not available, falling back to standard markers.");
      }
    }

    // Update regions
    if (mapInstanceRef.current) {
      if (geoJsonLayerRef.current) {
        // If layer exists, clear it to rebuild or just update data. 
        // Rebuilding is safer for style resets in this simple implementation.
        geoJsonLayerRef.current.clearLayers();
      } else {
        geoJsonLayerRef.current = L.geoJSON(null, {
          style: defaultStyle,
          onEachFeature: (feature, layer) => {
              const formattedName = formatRegionName(feature.properties.name);
              
              layer.bindTooltip(`
                <div class="text-right font-sans" dir="rtl" style="min-width: 140px;">
                    <strong class="text-slate-800 text-sm border-b border-slate-200 pb-1 mb-1 block font-bold">${formattedName}</strong>
                    <div class="flex justify-between items-center mt-1">
                      <span>نسبة الاقتراع:</span>
                      <span class="font-bold ${feature.properties.stats.turnout < 40 ? 'text-red-600' : 'text-emerald-600'}">${feature.properties.stats.turnout}%</span>
                    </div>
                    <div class="flex justify-between items-center">
                       <span>حوادث:</span>
                       <span class="font-bold text-slate-700">${feature.properties.stats.incidents}</span>
                    </div>
                </div>
              `, { sticky: true, direction: 'top', className: 'custom-tooltip' });

              // Click handler for selection
              layer.on('click', () => {
                 // Use L.DomEvent.stopPropagation to prevent map click if needed
                 if (feature.properties && feature.properties.id) {
                     setSelectedRegionId(feature.properties.id);
                 }
              });
          }
        }).addTo(mapInstanceRef.current);
      }
      
      if (regions && regions.length > 0) {
         const features = regions.map(r => ({
           type: "Feature",
           properties: r,
           geometry: r.geometry
         }));
         geoJsonLayerRef.current.addData(features as any);
      }
    }

    // Update markers
    if (mapInstanceRef.current) {
      // Clear existing layers
      if (clusterGroupRef.current) {
        clusterGroupRef.current.clearLayers();
      } else {
        markersRef.current.forEach(layer => mapInstanceRef.current?.removeLayer(layer));
        markersRef.current = [];
      }

      const newMarkers: L.Layer[] = [];

      // Add report markers (Blue for general reports)
      reports.forEach(report => {
        const icon = L.divIcon({
          className: 'custom-marker-pin',
          html: `<div class="w-3 h-3 bg-blue-500 rounded-full border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
          popupAnchor: [0, -6]
        });

        const marker = L.marker([report.latitude, report.longitude], { icon })
          .bindPopup(`
            <div class="text-slate-800 min-w-[200px] text-right" dir="rtl">
              <strong class="text-blue-600">تقرير:</strong> ${report.activity_type}<br/>
              <p class="mt-1 text-sm font-sans">${report.notes}</p>
            </div>
          `);
        newMarkers.push(marker);
      });

      // Add alert markers (Red/Orange)
      alerts.filter(a => !a.resolved).forEach(alert => {
        // Default mapping logic
        let lat = 33.8938; 
        let lng = 35.5018;

        // Try to map to region
        if (regions && alert.region_id) {
          const region = regions.find(r => r.id === alert.region_id);
          if (region) {
            const center = getRegionCenter(region);
            if (center) {
              lat = center[0];
              lng = center[1];
            }
          }
        }
        
        // Add random slight offset for visualization so they don't stack perfectly
        const latOffset = (Math.random() - 0.5) * 0.005; 
        const lngOffset = (Math.random() - 0.5) * 0.005;
        
        const finalLat = lat + latOffset;
        const finalLng = lng + lngOffset;

        const colorClass = alert.severity === 'critical' ? 'bg-red-600 border-red-500 shadow-red-600/50' : 'bg-amber-500 border-amber-400 shadow-amber-500/50';

        // Choose icon based on alert type
        let iconSvg = '';
        if (alert.alert_type === 'مشاكل_أمنية') {
            // Shield Icon
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
        } else if (alert.alert_type === 'انخفاض_تصويت') {
            // Trending Down Icon
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>`;
        } else if (alert.alert_type === 'نقص_مستلزمات') {
            // Box Icon
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`;
        } else {
            // Default Alert Icon
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        }

        const icon = L.divIcon({
          className: 'custom-marker-pin',
          html: `<div class="w-8 h-8 ${colorClass} rounded-full border-2 border-white/20 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center text-white">${iconSvg}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const marker = L.marker([finalLat, finalLng], { icon })
          .bindPopup(`
            <div class="text-slate-800 min-w-[200px] text-right" dir="rtl">
              <div class="flex items-center gap-2 mb-1 justify-end">
                 <strong class="text-red-600 uppercase text-xs border border-red-200 px-1 rounded bg-red-50">${alert.alert_type.replace('_', ' ')}</strong>
              </div>
              <p class="text-sm font-sans">${alert.message}</p>
            </div>
          `);
        newMarkers.push(marker);
      });

      if (clusterGroupRef.current) {
        clusterGroupRef.current.addLayers(newMarkers);
      } else {
        newMarkers.forEach(m => m.addTo(mapInstanceRef.current!));
        markersRef.current = newMarkers;
      }
    }
  }, [reports, alerts, regions]);

  // Effect to handle selection changes
  useEffect(() => {
      if (!mapInstanceRef.current || !geoJsonLayerRef.current) return;

      if (selectedRegionId) {
          let targetLayer: L.Layer | null = null;
          
          geoJsonLayerRef.current.eachLayer((layer: any) => {
              // Reset style for all first
              geoJsonLayerRef.current?.resetStyle(layer);
              
              if (layer.feature.properties.id === selectedRegionId) {
                  targetLayer = layer;
              }
          });

          if (targetLayer) {
             const layer = targetLayer as L.Path;
             layer.setStyle({
                 weight: 3,
                 color: '#fbbf24', // Amber
                 fillOpacity: 0.5,
                 dashArray: ''
             });
             (layer as any).bringToFront();
             layer.openTooltip();
             
             // Fly to bounds
             const bounds = (layer as any).getBounds();
             mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
          }
      } else {
          // Reset all
          geoJsonLayerRef.current.eachLayer((layer: any) => {
              geoJsonLayerRef.current?.resetStyle(layer);
              layer.closeTooltip();
          });
          
          // Fit to all if exists
          if (geoJsonLayerRef.current.getLayers().length > 0) {
              mapInstanceRef.current.fitBounds(geoJsonLayerRef.current.getBounds(), { padding: [20, 20], animate: true });
          } else {
             mapInstanceRef.current.setView([33.8938, 35.5018], 9);
          }
      }
  }, [selectedRegionId]);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg relative z-0">
      <div className="absolute top-4 right-4 z-[400]">
        <div className="relative">
           <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="appearance-none bg-slate-900/90 text-slate-200 text-sm pl-4 pr-10 py-2 rounded-lg border border-slate-600 shadow-xl backdrop-blur-md outline-none cursor-pointer hover:bg-slate-800/90 transition-colors min-w-[220px]"
            dir="rtl"
          >
            <option value="">كل الدوائر (نظرة عامة)</option>
            {regions?.map(r => (
              <option key={r.id} value={r.id}>{formatRegionName(r.name)}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
      </div>
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
};

export default MapWidget;