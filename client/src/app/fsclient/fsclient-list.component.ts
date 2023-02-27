import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { Fsclient, FsclientRole } from './fsclient';
import { FsclientService } from './fsclient.service';

/**
 * A component that displays a list of fsclients, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by name and/or company,
 * and remote filtering (i.e., filtering by the server) by
 * role and/or age. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
  selector: 'app-fsclient-list-component',
  templateUrl: 'fsclient-list.component.html',
  styleUrls: ['./fsclient-list.component.scss'],
  providers: []
})

export class FsclientListComponent implements OnInit, OnDestroy  {
  // These are public so that tests can reference them (.spec.ts)
  public serverFilteredFsclients: Fsclient[];
  public filteredFsclients: Fsclient[];

  public fsclientName: string;
  public fsclientAge: number;
  public fsclientRole: FsclientRole;
  public fsclientCompany: string;
  public viewType: 'card' | 'list' = 'card';

  private ngUnsubscribe = new Subject<void>();


  /**
   * This constructor injects both an instance of `FsclientService`
   * and an instance of `MatSnackBar` into this component.
   * `FsclientService` lets us interact with the server.
   *
   * @param fsclientService the `FsclientService` used to get fsclients from the server
   * @param snackBar the `MatSnackBar` used to display feedback
   */
  constructor(private fsclientService: FsclientService, private snackBar: MatSnackBar) {
    // Nothing here – everything is in the injection parameters.
  }

  /**
   * Get the fsclients from the server, filtered by the role and age specified
   * in the GUI.
   */
  getFsclientsFromServer(): void {
    // A fsclient-list-component is paying attention to fsclientService.getFsclients
    // (which is an Observable<Fsclient[]>)
    // (for more on Observable, see: https://reactivex.io/documentation/observable.html)
    // and we are specifically watching for role and age whenever the Fsclient[] gets updated
    this.fsclientService.getFsclients({
      role: this.fsclientRole,
      age: this.fsclientAge
    }).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      // Next time we see a change in the Observable<Fsclient[]>,
      // refer to that Fsclient[] as returnedFsclients here and do the steps in the {}
      next: (returnedFsclients) => {
        // First, update the array of serverFilteredFsclients to be the Fsclient[] in the observable
        this.serverFilteredFsclients = returnedFsclients;
        // Then update the filters for our client-side filtering as described in this method
        this.updateFilter();
      },
      // If we observe an error in that Observable, put that message in a snackbar so we can learn more
      error: (err) => {
        let message = '';
        if (err.error instanceof ErrorEvent) {
          message = `Problem in the client – Error: ${err.error.message}`;
        } else {
          message = `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`;
        }
        this.snackBar.open(
          message,
          'OK',
          // The message will disappear after 6 seconds.
          { duration: 6000 });
      },
      // Once the observable has completed successfully
      // complete: () => console.log('Fsclients were filtered on the server')
    });
  }

  /**
   * Called when the filtering information is changed in the GUI so we can
   * get an updated list of `filteredFsclients`.
   */
  public updateFilter(): void {
    this.filteredFsclients = this.fsclientService.filterFsclients(
      this.serverFilteredFsclients, { name: this.fsclientName, company: this.fsclientCompany });
  }

  /**
   * Starts an asynchronous operation to update the fsclients list
   *
   */
  ngOnInit(): void {
    this.getFsclientsFromServer();
  }

  /**
   * When this component is destroyed, we should unsubscribe to any
   * outstanding requests.
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
