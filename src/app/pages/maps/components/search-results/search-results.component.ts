import { Component } from '@angular/core';
import { MapService, PlacesService } from '../../services';
import { Feature } from 'src/app/interfaces/places';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
})
export class SearchResultsComponent {

  public selectedId: string = '';

  constructor(private placesService: PlacesService, private mapService: MapService) { }

  get isLoadingPlaces(): boolean{
    return this.placesService.isLoadingPlaces;
  }

  get places(): Feature[] {
    return this.placesService.places;
  }

  flyTo( place: Feature ){
    this.selectedId = place.id;

    const [ lng, lat ] = place.center;

    this.mapService.flyto( [lng, lat] );
  }

  getDirections(place: Feature) {
    if (!this.placesService.userLocation) throw Error('No hay userLocation');

    this.mapService.clearRoute();
    this.placesService.deletePlaces();

    const start = this.placesService.userLocation;
    const end = place.center as [number, number];

    this.mapService.setStartPoint(start);
    this.mapService.setEndPoint(end);

    this.mapService.getRouteBetweenPoints(start, end);
  }
}
