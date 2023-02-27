import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Fsclient } from './fsclient';
import { FsclientService } from './fsclient.service';

describe('FsclientService', () => {
  // A small collection of test fsclients
  const testFsclients: Fsclient[] = [
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
  let fsclientService: FsclientService;
  // These are used to mock the HTTP requests so that we (a) don't have to
  // have the server running and (b) we can check exactly which HTTP
  // requests were made to ensure that we're making the correct requests.
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // Set up the mock handling of the HTTP requests
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    // Construct an instance of the service with the mock
    // HTTP client.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    fsclientService = new FsclientService(httpClient);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getFsclients() is called with no parameters', () => {
   /* We really don't care what `getFsclients()` returns. Since all the
    * filtering (when there is any) is happening on the server,
    * `getFsclients()` is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getFsclients()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testFsclients`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the fsclients. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls `api/fsclients`', waitForAsync(() => {
      // Mock the `httpClient.get()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFsclients));

      // Call `fsclientService.getFsclients()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getFsclients()`.
      // The `fsclients` argument in the function is the array of Fsclients returned by
      // the call to `getFsclients()`.
      fsclientService.getFsclients().subscribe(() => {
        // The mocked method (`httpClient.get()`) should have been called
        // exactly one time.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        // The mocked method should have been called with two arguments:
        //   * the appropriate URL ('/api/fsclients' defined in the `FsclientService`)
        //   * An options object containing an empty `HttpParams`
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(fsclientService.fsclientUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getFsclients() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    /*
    * As in the test of `getFsclients()` that takes in no filters in the params,
    * we really don't care what `getFsclients()` returns in the cases
    * where the filtering is happening on the server. Since all the
    * filtering is happening on the server, `getFsclients()` is really
    * just a "pass through" that returns whatever it receives, without
    * any "post processing" or manipulation. So the tests in this
    * `describe` block all confirm that the HTTP request is properly formed
    * and sent out in the world, but don't _really_ care about
    * what `getFsclients()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in each of these tests, we'll keep it simple and have
    * the (mocked) HTTP request return the entire list `testFsclients`
    * even though in "real life" we would expect the server to
    * return return a filtered subset of the fsclients. Furthermore, we
    * won't actually check what got returned (there won't be an `expect`
    * about the returned value).
    */

    it('correctly calls api/fsclients with filter parameter \'admin\'', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFsclients));

        fsclientService.getFsclients({ role: 'admin' }).subscribe(() => {
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          // The mocked method should have been called with two arguments:
          //   * the appropriate URL ('/api/fsclients' defined in the `FsclientService`)
          //   * An options object containing an `HttpParams` with the `role`:`admin`
          //     key-value pair.
          expect(mockedMethod)
            .withContext('talks to the correct endpoint')
            .toHaveBeenCalledWith(fsclientService.fsclientUrl, { params: new HttpParams().set('role', 'admin') });
        });
    });

    it('correctly calls api/fsclients with filter parameter \'age\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFsclients));

      fsclientService.getFsclients({ age: 25 }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(fsclientService.fsclientUrl, { params: new HttpParams().set('age', '25') });
      });
    });

    it('correctly calls api/fsclients with multiple filter parameters', () => {
        const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFsclients));

        fsclientService.getFsclients({ role: 'editor', company: 'IBM', age: 37 }).subscribe(() => {
          // This test checks that the call to `fsclientService.getFsclients()` does several things:
          //   * It calls the mocked method (`HttpClient#get()`) exactly once.
          //   * It calls it with the correct endpoint (`fsclientService.fsclientUrl`).
          //   * It calls it with the correct parameters:
          //      * There should be three parameters (this makes sure that there aren't extras).
          //      * There should be a "role:editor" key-value pair.
          //      * And a "company:IBM" pair.
          //      * And a "age:37" pair.

          // This gets the arguments for the first (and in this case only) call to the `mockMethod`.
          const [url, options] = mockedMethod.calls.argsFor(0);
          // Gets the `HttpParams` from the options part of the call.
          // `options.param` can return any of a broad number of types;
          // it is in fact an instance of `HttpParams`, and I need to use
          // that fact, so I'm casting it (the `as HttpParams` bit).
          const calledHttpParams: HttpParams = (options.params) as HttpParams;
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(url)
            .withContext('talks to the correct endpoint')
            .toEqual(fsclientService.fsclientUrl);
          expect(calledHttpParams.keys().length)
            .withContext('should have 3 params')
            .toEqual(3);
          expect(calledHttpParams.get('role'))
            .withContext('role of editor')
            .toEqual('editor');
          expect(calledHttpParams.get('company'))
            .withContext('company being IBM')
            .toEqual('IBM');
          expect(calledHttpParams.get('age'))
            .withContext('age being 37')
            .toEqual('37');
        });
    });
  });

  describe('When getFsclientById() is given an ID', () => {
   /* We really don't care what `getFsclientById()` returns. Since all the
    * interesting work is happening on the server, `getFsclientById()`
    * is really just a "pass through" that returns whatever it receives,
    * without any "post processing" or manipulation. The test in this
    * `describe` confirms that the HTTP request is properly formed
    * and sent out in the world, but we don't _really_ care about
    * what `getFsclientById()` returns as long as it's what the HTTP
    * request returns.
    *
    * So in this test, we'll keep it simple and have
    * the (mocked) HTTP request return the `targetFsclient`
    * Furthermore, we won't actually check what got returned (there won't be an `expect`
    * about the returned value). Since we don't use the returned value in this test,
    * It might also be fine to not bother making the mock return it.
    */
    it('calls api/fsclients/id with the correct ID', waitForAsync(() => {
      // We're just picking a Fsclient "at random" from our little
      // set of Fsclients up at the top.
      const targetFsclient: Fsclient = testFsclients[1];
      const targetId: string = targetFsclient._id;

      // Mock the `httpClient.get()` method so that instead of making an HTTP request
      // it just returns one fsclient from our test data
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetFsclient));

      // Call `fsclientService.getFsclient()` and confirm that the correct call has
      // been made with the correct arguments.
      //
      // We have to `subscribe()` to the `Observable` returned by `getFsclientById()`.
      // The `fsclient` argument in the function below is the thing of type Fsclient returned by
      // the call to `getFsclientById()`.
      fsclientService.getFsclientById(targetId).subscribe(() => {
        // The `Fsclient` returned by `getFsclientById()` should be targetFsclient, but
        // we don't bother with an `expect` here since we don't care what was returned.
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${fsclientService.fsclientUrl}/${targetId}`);
      });
    }));
  });

  describe('Filtering on the client using `filterFsclients()` (Angular/Client filtering)', () => {
    /*
     * Since `filterFsclients` actually filters "locally" (in
     * Angular instead of on the server), we do want to
     * confirm that everything it returns has the desired
     * properties. Since this doesn't make a call to the server,
     * though, we don't have to use the mock HttpClient and
     * all those complications.
     */
    it('filters by name', () => {
      const fsclientName = 'i';
      const filteredFsclients = fsclientService.filterFsclients(testFsclients, { name: fsclientName });
      // There should be two fsclients with an 'i' in their
      // name: Chris and Jamie.
      expect(filteredFsclients.length).toBe(2);
      // Every returned fsclient's name should contain an 'i'.
      filteredFsclients.forEach(fsclient => {
        expect(fsclient.name.indexOf(fsclientName)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by company', () => {
      const fsclientCompany = 'UMM';
      const filteredFsclients = fsclientService.filterFsclients(testFsclients, { company: fsclientCompany });
      // There should be just one fsclient that has UMM as their company.
      expect(filteredFsclients.length).toBe(1);
      // Every returned fsclient's company should contain 'UMM'.
      filteredFsclients.forEach(fsclient => {
        expect(fsclient.company.indexOf(fsclientCompany)).toBeGreaterThanOrEqual(0);
      });
    });

    it('filters by name and company', () => {
      // There's only one fsclient (Chris) whose name
      // contains an 'i' and whose company contains
      // an 'M'. There are two whose name contains
      // an 'i' and two whose company contains an
      // an 'M', so this should test combined filtering.
      const fsclientName = 'i';
      const fsclientCompany = 'M';
      const filters = { name: fsclientName, company: fsclientCompany };
      const filteredFsclients = fsclientService.filterFsclients(testFsclients, filters);
      // There should be just one fsclient with these properties.
      expect(filteredFsclients.length).toBe(1);
      // Every returned fsclient should have _both_ these properties.
      filteredFsclients.forEach(fsclient => {
        expect(fsclient.name.indexOf(fsclientName)).toBeGreaterThanOrEqual(0);
        expect(fsclient.company.indexOf(fsclientCompany)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Adding a fsclient using `addFsclient()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      // Mock the `httpClient.addFsclient()` method, so that instead of making an HTTP request,
      // it just returns our test data.
      const FSCLIENT_ID = 'pat_id';
      const mockedMethod = spyOn(httpClient, 'post').and.returnValue(of(FSCLIENT_ID));

      // paying attention to what is returned (undefined) didn't work well here,
      // but I'm putting something in here to remind us to look into that
      fsclientService.addFsclient(testFsclients[1]).subscribe((returnedString) => {
        console.log(`The thing returned was: ${returnedString}`);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(fsclientService.fsclientUrl, testFsclients[1]);
      });
    }));
  });
});
