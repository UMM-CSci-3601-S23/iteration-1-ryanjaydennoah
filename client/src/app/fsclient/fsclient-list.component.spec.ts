import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { MockFsclientService } from '../../testing/fsclient.service.mock';
import { Fsclient } from './fsclient';
import { FsclientCardComponent } from './fsclient-card.component';
import { FsclientListComponent } from './fsclient-list.component';
import { FsclientService } from './fsclient.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const COMMON_IMPORTS: unknown[] = [
  FormsModule,
  MatCardModule,
  MatFormFieldModule,
  MatSelectModule,
  MatOptionModule,
  MatButtonModule,
  MatInputModule,
  MatExpansionModule,
  MatTooltipModule,
  MatListModule,
  MatDividerModule,
  MatRadioModule,
  MatIconModule,
  MatSnackBarModule,
  BrowserAnimationsModule,
  RouterTestingModule,
];

describe('Fsclient list', () => {

  let fsclientList: FsclientListComponent;
  let fixture: ComponentFixture<FsclientListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [FsclientListComponent, FsclientCardComponent],
      // providers:    [ FsclientService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: FsclientService, useValue: new MockFsclientService() }]
    });
  });

  // This constructs the `fsclientList` (declared
  // above) that will be used throughout the tests.
  beforeEach(waitForAsync(() => {
  // Compile all the components in the test bed
  // so that everything's ready to go.
    TestBed.compileComponents().then(() => {
      /* Create a fixture of the FsclientListComponent. That
       * allows us to get an instance of the component
       * (fsclientList, below) that we can control in
       * the tests.
       */
      fixture = TestBed.createComponent(FsclientListComponent);
      fsclientList = fixture.componentInstance;
      /* Tells Angular to sync the data bindings between
       * the model and the DOM. This ensures, e.g., that the
       * `fsclientList` component actually requests the list
       * of fsclients from the `MockFsclientService` so that it's
       * up to date before we start running tests on it.
       */
      fixture.detectChanges();
    });
  }));

  it('contains all the fsclients', () => {
    expect(fsclientList.serverFilteredFsclients.length).toBe(3);
  });

  it('contains a fsclient named \'Chris\'', () => {
    expect(fsclientList.serverFilteredFsclients.some((fsclient: Fsclient) => fsclient.name === 'Chris')).toBe(true);
  });

  it('contain a fsclient named \'Jamie\'', () => {
    expect(fsclientList.serverFilteredFsclients.some((fsclient: Fsclient) => fsclient.name === 'Jamie')).toBe(true);
  });

  it('doesn\'t contain a fsclient named \'Santa\'', () => {
    expect(fsclientList.serverFilteredFsclients.some((fsclient: Fsclient) => fsclient.name === 'Santa')).toBe(false);
  });

  it('has two fsclients that are 37 years old', () => {
    expect(fsclientList.serverFilteredFsclients.filter((fsclient: Fsclient) => fsclient.age === 37).length).toBe(2);
  });
});

/*
 * This test is a little odd, but illustrates how we can use stubs
 * to create mock objects (a service in this case) that be used for
 * testing. Here we set up the mock FsclientService (fsclientServiceStub) so that
 * _always_ fails (throws an exception) when you request a set of fsclients.
 */
describe('Misbehaving Fsclient List', () => {
  let fsclientList: FsclientListComponent;
  let fixture: ComponentFixture<FsclientListComponent>;

  let fsclientServiceStub: {
    getFsclients: () => Observable<Fsclient[]>;
    getFsclientsFiltered: () => Observable<Fsclient[]>;
  };

  beforeEach(() => {
    // stub FsclientService for test purposes
    fsclientServiceStub = {
      getFsclients: () => new Observable(observer => {
        observer.error('getFsclients() Observer generates an error');
      }),
      getFsclientsFiltered: () => new Observable(observer => {
        observer.error('getFsclientsFiltered() Observer generates an error');
      })
    };

    TestBed.configureTestingModule({
      imports: [COMMON_IMPORTS],
      declarations: [FsclientListComponent],
      // providers:    [ FsclientService ]  // NO! Don't provide the real service!
      // Provide a test-double instead
      providers: [{ provide: FsclientService, useValue: fsclientServiceStub }]
    });
  });

  // Construct the `fsclientList` used for the testing in the `it` statement
  // below.
  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(FsclientListComponent);
      fsclientList = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('generates an error if we don\'t set up a FsclientListService', () => {
    // Since calling either getFsclients() or getFsclientsFiltered() return
    // Observables that then throw exceptions, we don't expect the component
    // to be able to get a list of fsclients, and serverFilteredFsclients should
    // be undefined.
    expect(fsclientList.serverFilteredFsclients).toBeUndefined();
  });
});
