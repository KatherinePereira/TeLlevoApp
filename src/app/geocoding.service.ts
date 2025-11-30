import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// Define la interfaz Location
export interface Location {
  display_name: string;
  lat: string;
  lon: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private baseUrl: string = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  // Método para geocodificar
  geocode(query: string): Observable<Location[]> {
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=CL&accept-language=es`;
    return this.http.get<any[]>(url).pipe(
      tap(response => console.log('Respuesta de Nominatim:', response)),
      map((results: any[]) => results.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
      })))
    );
  }

  // Método para buscar ubicaciones
  searchLocations(query: string): Observable<Location[]> {
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=CL&accept-language=es`;
    return this.http.get<any[]>(url).pipe(
      tap(response => console.log('Respuesta de Nominatim (search):', response)),
      map((results: any[]) => results.map((item: any) => ({
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon
      })))
    );
  }
}
