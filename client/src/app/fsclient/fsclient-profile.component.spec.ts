import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRouteStub } from '../../testing/activated-route-stub';
import { MockFsclientService } from '../../testing/fsclient.service.mock';
import { Fsclient } from './fsclient';
import { FsclientCardComponent } from './fsclient-card.component';
import { FsclientProfileComponent } from './fsclient-profile.component';
import { FsclientService } from './fsclient.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('FsclientProfileComponent', () => {
  let component: FsclientProfileComponent;
  let fixture: ComponentFixture<FsclientProfileComponent>;
  const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub({
    // Using the constructor here lets us try that branch in `activated-route-stub.ts`
    // and then we can choose a new parameter map in the tests if we choose
    id : 'chris_id'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatCardModule,
        MatSnackBarModule
      ],
      declarations: [FsclientProfileComponent, FsclientCardComponent],
      providers: [
        { provide: FsclientService, useValue: new MockFsclientService() },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsclientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to a specific fsclient profile', () => {
    const expectedFsclient: Fsclient = MockFsclientService.testFsclients[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `FsclientProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedFsclient._id });
    expect(component.fsclient).toEqual(expectedFsclient);
  });

  it('should navigate to correct fsclient when the id parameter changes', () => {
    let expectedFsclient: Fsclient = MockFsclientService.testFsclients[0];
    // Setting this should cause anyone subscribing to the paramMap
    // to update. Our `FsclientProfileComponent` subscribes to that, so
    // it should update right away.
    activatedRoute.setParamMap({ id: expectedFsclient._id });
    expect(component.fsclient).toEqual(expectedFsclient);

    // Changing the paramMap should update the displayed fsclient profile.
    expectedFsclient = MockFsclientService.testFsclients[1];
    activatedRoute.setParamMap({ id: expectedFsclient._id });
    expect(component.fsclient).toEqual(expectedFsclient);
  });

  it('should have `null` for the fsclient for a bad ID', () => {
    activatedRoute.setParamMap({ id: 'badID' });

    // If the given ID doesn't map to a fsclient, we expect the service
    // to return `null`, so we would expect the component's fsclient
    // to also be `null`.
    expect(component.fsclient).toBeNull();
  });
});
