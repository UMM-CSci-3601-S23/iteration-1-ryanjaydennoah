import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Fsclient } from './fsclient';
import { FsclientService } from './fsclient.service';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fsclient-profile',
  templateUrl: './fsclient-profile.component.html',
  styleUrls: ['./fsclient-profile.component.scss']
})
export class FsclientProfileComponent implements OnInit, OnDestroy {
  fsclient: Fsclient;

  // This `Subject` will only ever emit one (empty) value when
  // `ngOnDestroy()` is called, i.e., when this component is
  // destroyed. That can be used ot tell any subscriptions to
  // terminate, allowing the system to free up their resources (like memory).
  private ngUnsubscribe = new Subject<void>();

  constructor(private snackBar: MatSnackBar, private route: ActivatedRoute, private fsclientService: FsclientService) { }

  ngOnInit(): void {
    // The `map`, `switchMap`, and `takeUntil` are all RXJS operators, and
    // each represents a step in the pipeline built using the RXJS `pipe`
    // operator.
    // The map step takes the `ParamMap` from the `ActivatedRoute`, which
    // is typically the URL in the browser bar.
    // The result from the map step is the `id` string for the requested
    // `Fsclient`.
    // That ID string gets passed (by `pipe`) to `switchMap`, which transforms
    // it into an Observable<Fsclient>, i.e., all the (zero or one) `Fsclient`s
    // that have that ID.
    // The `takeUntil` operator allows this pipeline to continue to emit values
    // until `this.ngUnsubscribe` emits a value, saying to shut the pipeline
    // down and clean up any associated resources (like memory).
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      // Maps the `id` string into the Observable<Fsclient>,
      // which will emit zero or one values depending on whether there is a
      // `Fsclient` with that ID.
      switchMap((id: string) => this.fsclientService.getFsclientById(id)),
      // Allow the pipeline to continue to emit values until `this.ngUnsubscribe`
      // returns a value, which only happens when this component is destroyed.
      // At that point we shut down the pipeline, allowed any
      // associated resources (like memory) are cleaned up.
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      next: fsclient => {
        this.fsclient = fsclient;
        return fsclient;
      },
      error: _err => {
        this.snackBar.open('Problem loading the fsclient – try again', 'OK', {
          duration: 5000,
        });
      }
      /*
       * You can uncomment the line that starts with `complete` below to use that console message
       * as a way of verifying that this subscription is completing.
       * We removed it since we were not doing anything interesting on completion
       * and didn't want to clutter the console log
       */
      // complete: () => console.log('We got a new fsclient, and we are done!'),
    });
  }

  ngOnDestroy() {
    // When the component is destroyed, we'll emit an empty
    // value as a way of saying that any active subscriptions should
    // shut themselves down so the system can free up any associated
    // resources, like memory.
    this.ngUnsubscribe.next();
    // Calling `complete()` says that this `Subject` is done and will
    // never send any further values.
    this.ngUnsubscribe.complete();
  }
}
