import { Injectable } from '@angular/core';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { Feature } from 'src/app/interfaces/places';
import { DirectionsApiClient } from '../api';
import { DirectionsResponse, Route } from 'src/app/interfaces/directions';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private map?: Map;
  private markers: Marker [] = [];
  private userMarker?: Marker;
  private currentRouteSourceId = 'RouteString';
  private startPoint?: [number, number];
  private endPoint?: [number, number];
  private routeCoordinates: [number, number][] = []; // Para almacenar las coordenadas de la ruta
  private routeGenerated: boolean = false;

  get isMapReady() {
    return !!this.map;
  }

  constructor(private directionsApi: DirectionsApiClient, private firestore: AngularFirestore) { }

  setMap( map: Map ) {
    this.map = map;
  }
  

  flyto(coords: [number, number]) {
    if (this.map) {
      this.map.flyTo({
        center: coords,
        essential: true,
        zoom: 14
      });
    } else {
      console.error('El mapa no está disponible en el servicio');
    }
  }
  

  updateUserMarker(coords: [number, number]) {
    if (!this.isMapReady) throw Error('El mapa no está inicializado');

    if (this.userMarker) {
        this.userMarker.remove();
    }

    if (this.map) {
        this.userMarker = new Marker({ color: 'red' })
            .setLngLat(coords)
            .addTo(this.map);
    }
  }

  createMarkersFromPlaces( places: Feature[], userLocation: [ number, number ] ) {

    if( !this.map ) throw Error('Mapa no inicializado');

    this.markers.forEach( marker => marker.remove() );
    this.markers = [];

    const newMarkers = [];

    for (const place of places) {
      const [ lng, lat ] = place.center;
      const popup = new Popup()
      .setHTML(`
        <h6>${ place.text }</h6>
        <span>${ place.place_name }</span>
        `);

      const newMarker = new Marker()
      .setLngLat([ lng, lat ])
      .setPopup( popup )
      .addTo( this.map );

      newMarkers.push( newMarker );
    }

    this.markers = newMarkers;

    if( places.length === 0 ) return;

    const bounds = new LngLatBounds();
    newMarkers.forEach( marker => bounds.extend( marker.getLngLat() ) );
    bounds.extend( userLocation );
    

    this.map.fitBounds( bounds, {
      padding: 80
    } );

  }

  setStartPoint(point: [number, number]) {
    this.startPoint = point;
  }

  setEndPoint(point: [number, number]) {
    this.endPoint = point;
  }

  getStartPoint(): [number, number] | undefined {
    return this.startPoint;
  }

  getEndPoint(): [number, number] | undefined {
    return this.endPoint;
  }

  get isRouteGenerated(): boolean {
    return this.routeGenerated;
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  clearRoute() {
    this.routeGenerated = false;
    if (!this.map) return;
  
    if (this.map.getSource(this.currentRouteSourceId)) {
      this.map.removeLayer(this.currentRouteSourceId);
      this.map.removeSource(this.currentRouteSourceId);
      console.log("Ruta anterior eliminada.");
    } else {
      console.log("No hay ruta para eliminar.");
    }
  }

  getRouteBetweenPoints(start: [number, number], end: [number, number]) {
    if (!this.map) throw Error('Mapa no inicializado');

    this.clearRoute();

    this.directionsApi.get<DirectionsResponse>(`/${start.join(',')};${end.join(',')}`)
      .subscribe(resp => {
        this.drawPolyline(resp.routes[0]);
        this.routeGenerated = true;

        this.storeRoute(start, end);
      });
  }

  getRouteCoordinates(): [number, number][] {
    return this.routeCoordinates;
  }

  private drawPolyline( route: Route ) {
    console.log( { kms: route.distance / 1000, duration: route.duration / 60 } );

    if( !this.map ) throw Error('Mapa no inicializado');

    const coords = route.geometry.coordinates as [number, number][];
    this.routeCoordinates = coords;

    const bounds = new LngLatBounds();

    coords.forEach( ([lng, lat]) => {
      bounds.extend([lng, lat]);
    });

    this.map?.fitBounds( bounds, {
      padding: 80
    });

    const sourceData: AnySourceData = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry:{
              type: 'LineString',
              coordinates: coords
            }
          }
        ]
      }
    }

    if( this.map.getSource('RouteString') ) {
      this.map.removeLayer('RouteString');
      this.map.removeSource('RouteString');
    };

    this.map.addSource( 'RouteString', sourceData );

    this.map.addLayer({
      id: 'RouteString',
      type: 'line',
      source: 'RouteString',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': 'black',
        'line-width': 3
      }
    });
  }


  storeRoute(start: [number, number], end: [number, number]) {
    console.log('Ruta almacenada desde', start, 'hasta', end);
    
    const routeData = {
      startCoordinates: start,
      endCoordinates: end,
      createdAt: new Date(),
    };
  }
}
