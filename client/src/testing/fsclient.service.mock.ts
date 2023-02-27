import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Fsclient, FsclientRole } from '../app/fsclient/fsclient';
import { FsclientService } from '../app/fsclient/fsclient.service';

/**
 * A "mock" version of the `FsclientService` that can be used to test components
 * without having to create an actual service. It needs to be `Injectable` since
 * that's how services are typically provided to components.
 */
@Injectable({
  providedIn: AppComponent
})
export class MockFsclientService extends FsclientService {
  static testFsclients: Fsclient[] = [
    {
      _id: 'chris_id',
      name: 'Chris',
      age: 25,
      company: 'UMM',
      email: 'chris@this.that',
      role: 'admin',
      avatar: 'https://gravatar.com/avatar/8c9616d6cc5de638ea6920fb5d65fc6c?d=identicon'
    },
    {
      _id: 'pat_id',
      name: 'Pat',
      age: 37,
      company: 'IBM',
      email: 'pat@something.com',
      role: 'editor',
      avatar: 'https://gravatar.com/avatar/b42a11826c3bde672bce7e06ad729d44?d=identicon'
    },
    {
      _id: 'jamie_id',
      name: 'Jamie',
      age: 37,
      company: 'Frogs, Inc.',
      email: 'jamie@frogs.com',
      role: 'viewer',
      avatar: 'https://gravatar.com/avatar/d4a6c71dd9470ad4cf58f78c100258bf?d=identicon'
    }
  ];

  constructor() {
    super(null);
  }

  // skipcq: JS-0105
  getFsclients(_filters: { role?: FsclientRole; age?: number; company?: string }): Observable<Fsclient[]> {
    // Our goal here isn't to test (and thus rewrite) the service, so we'll
    // keep it simple and just return the test fsclients regardless of what
    // filters are passed in.
    //
    // The `of()` function converts a regular object or value into an
    // `Observable` of that object or value.
    return of(MockFsclientService.testFsclients);
  }

  // skipcq: JS-0105
  getFsclientById(id: string): Observable<Fsclient> {
    // If the specified ID is for one of the first two test fsclients,
    // return that fsclient, otherwise return `null` so
    // we can test illegal fsclient requests.
    // If you need more, just add those in too.
    if (id === MockFsclientService.testFsclients[0]._id) {
      return of(MockFsclientService.testFsclients[0]);
    } else if (id === MockFsclientService.testFsclients[1]._id) {
      return of(MockFsclientService.testFsclients[1]);
    } else {
      return of(null);
    }
  }
}
