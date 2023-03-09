import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RequestForm } from './request-form';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestFormService {

  readonly requestFormUrl: string = `${environment.apiUrl}requestform`;

  private readonly foodKey = 'value';

  constructor(private httpClient: HttpClient) {
  }


getRequestForm(filters?: { value?: number }): Observable<RequestForm[]> {
  let httpParams: HttpParams = new HttpParams();
  if (filters){
    if (filters.value) {
      httpParams = httpParams.set(this.foodKey, filters.value);
    }
  }
  return this.httpClient.get<RequestForm[]>(this.requestFormUrl, {
    params: httpParams,
  });
}

addRequestForm(newRequestForm: RequestForm): Observable<string> {
  // Send post request to add a new todo with the todo data as the body.
  return this.httpClient.post<{id: string}>(this.requestFormUrl, newRequestForm).pipe(map(res => res.id));
}
}
