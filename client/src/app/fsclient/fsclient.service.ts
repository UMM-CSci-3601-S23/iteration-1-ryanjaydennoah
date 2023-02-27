import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Fsclient, FsclientRole } from './fsclient';
import { map } from 'rxjs/operators';

/**
 * Service that provides the interface for getting information
 * about `Fsclients` from the server.
 */
@Injectable({
  providedIn: `root`
})
export class FsclientService {
  // The URL for the fsclients part of the server API.
  readonly fsclientUrl: string = `${environment.apiUrl}fsclients`;

  private readonly roleKey = 'role';
  private readonly ageKey = 'age';
  private readonly companyKey = 'company';

  // The private `HttpClient` is *injected* into the service
  // by the Angular framework. This allows the system to create
  // only one `HttpClient` and share that across all services
  // that need it, and it allows us to inject a mock version
  // of `HttpClient` in the unit tests so they don't have to
  // make "real" HTTP calls to a server that might not exist or
  // might not be currently running.
  constructor(private httpClient: HttpClient) {
  }

  /**
   * Get all the fsclients from the server, filtered by the information
   * in the `filters` map.
   *
   * It would be more consistent with `FsclientListComponent` if this
   * only supported filtering on age and role, and left company to
   * just be in `filterFsclients()` below. We've included it here, though,
   * to provide some additional examples.
   *
   * @param filters a map that allows us to specify a target role, age,
   *  or company to filter by, or any combination of those
   * @returns an `Observable` of an array of `Fsclients`. Wrapping the array
   *  in an `Observable` means that other bits of of code can `subscribe` to
   *  the result (the `Observable`) and get the results that come back
   *  from the server after a possibly substantial delay (because we're
   *  contacting a remote server over the Internet).
   */
  getFsclients(filters?: { role?: FsclientRole; age?: number; company?: string }): Observable<Fsclient[]> {
    // `HttpParams` is essentially just a map used to hold key-value
    // pairs that are then encoded as "?key1=value1&key2=value2&…" in
    // the URL when we make the call to `.get()` below.
    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.role) {
        httpParams = httpParams.set(this.roleKey, filters.role);
      }
      if (filters.age) {
        httpParams = httpParams.set(this.ageKey, filters.age.toString());
      }
      if (filters.company) {
        httpParams = httpParams.set(this.companyKey, filters.company);
      }
    }
    // Send the HTTP GET request with the given URL and parameters.
    // That will return the desired `Observable<Fsclient[]>`.
    return this.httpClient.get<Fsclient[]>(this.fsclientUrl, {
      params: httpParams,
    });
  }

  /**
   * Get the `Fsclient` with the specified ID.
   *
   * @param id the ID of the desired fsclient
   * @returns an `Observable` containing the resulting fsclient.
   */
  getFsclientById(id: string): Observable<Fsclient> {
    // The input to get could also be written as (this.fsclientUrl + '/' + id)
    return this.httpClient.get<Fsclient>(`${this.fsclientUrl}/${id}`);
  }

  /**
   * A service method that filters an array of `Fsclient` using
   * the specified filters.
   *
   * Note that the filters here support partial matches. Since the
   * matching is done locally we can afford to repeatedly look for
   * partial matches instead of waiting until we have a full string
   * to match against.
   *
   * @param fsclients the array of `Fsclients` that we're filtering
   * @param filters the map of key-value pairs used for the filtering
   * @returns an array of `Fsclients` matching the given filters
   */
  filterFsclients(fsclients: Fsclient[], filters: { name?: string; company?: string }): Fsclient[] { // skipcq: JS-0105
    let filteredFsclients = fsclients;

    // Filter by name
    if (filters.name) {
      filters.name = filters.name.toLowerCase();
      filteredFsclients = filteredFsclients.filter(fsclient => fsclient.name.toLowerCase().indexOf(filters.name) !== -1);
    }

    // Filter by company
    if (filters.company) {
      filters.company = filters.company.toLowerCase();
      filteredFsclients = filteredFsclients.filter(fsclient => fsclient.company.toLowerCase().indexOf(filters.company) !== -1);
    }

    return filteredFsclients;
  }

  addFsclient(newFsclient: Partial<Fsclient>): Observable<string> {
    // Send post request to add a new fsclient with the fsclient data as the body.
    return this.httpClient.post<{id: string}>(this.fsclientUrl, newFsclient).pipe(map(res => res.id));
  }
}
