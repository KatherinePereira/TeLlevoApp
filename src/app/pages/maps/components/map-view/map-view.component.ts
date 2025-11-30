import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MapService, PlacesService } from '../../services';
import { Map } from 'mapbox-gl';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent  implements AfterViewInit {

  @ViewChild('mapDiv')
  mapDivElement!: ElementRef

  constructor(private placesService: PlacesService,
              private mapService: MapService
  ) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100); 
    if( !this.placesService.userLocation )throw Error('No hay placesServices.userLocation');

    const map = new Map({
      container: this.mapDivElement.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: this.placesService.userLocation,
      zoom: 14,
    });

    this.mapService.setMap( map );
      
  }
}
