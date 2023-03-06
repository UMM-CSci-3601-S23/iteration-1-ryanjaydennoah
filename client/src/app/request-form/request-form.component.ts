import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { RequestFormService} from './request-form.service';

@Component({
  selector: 'app-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit, OnDestroy {

  /*public items: some kind of array;
  put other variables here;*/

  private ngUnsubscribe = new Subject<void>();

  constructor(private requestFormService: RequestFormService, private snackBar: MatSnackBar) {
  }

    doSomething(): void {

    }
    /*getFsclientsFromServer(): void {
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
    }*/

    /**
     * Called when the filtering information is changed in the GUI so we can
     * get an updated list of `filteredFsclients`.
     */
    /*public updateFilter(): void {
      this.filteredFsclients = this.fsclientService.filterFsclients(
        this.serverFilteredFsclients, { name: this.fsclientName, company: this.fsclientCompany });
    }*/

    /**
     * Starts an asynchronous operation to update the fsclients list
     *
     */
    ngOnInit(): void {
      //this.getFsclientsFromServer();
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
