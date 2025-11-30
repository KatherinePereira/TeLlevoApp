import { Component, EventEmitter, Output} from '@angular/core';
import { MapService, PlacesService } from '../../services';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Output() locationSelected = new EventEmitter<[number, number]>(); 

  private debounceTimer?: NodeJS.Timeout;
  public showResults: boolean = false; 
  public query: string = '';
  public previousQuery: string = '';

  constructor(private placesService: PlacesService, private mapService: MapService) { }

  onQueryChanged(query: string = '') {
    this.query = query;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      if (query) {
        this.showResults = true;
        this.placesService.getPlacesByQuery(query);
        this.previousQuery = query;
      } else {
        this.showResults = false;
        this.mapService.clearMarkers();
        this.mapService.clearRoute();
      }
    }, 500);
  }

  closeSearch() {
    this.showResults = false;
  }

  openSearch() {
    if (this.query === '') {
      this.mapService.clearMarkers();
      this.mapService.clearRoute();
      this.showResults = false;
    } else {
      this.previousQuery = this.query;
      this.showResults = true;
      this.onQueryChanged(this.query);
    }
  }

}
