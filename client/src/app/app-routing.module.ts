import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FsclientListComponent } from './fsclient/fsclient-list.component';
import { FsclientProfileComponent } from './fsclient/fsclient-profile.component';
import { AddFsclientComponent } from './fsclient/add-fsclient.component';
import { RequestFormComponent } from './request-form/request-form.component';
import { DonatorCardComponent } from './donator/donator-card.component';
import { VolunteerCardComponent } from './volunteer/volunteer-card.component';

// Note that the 'fsclients/new' route needs to come before 'fsclients/:id'.
// If 'fsclients/:id' came first, it would accidentally catch requests to
// 'fsclients/new'; the router would just think that the string 'new' is a fsclient ID.
const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'fsclients', component: FsclientListComponent, title: 'Fsclients'},
  {path: 'fsclients/new', component: AddFsclientComponent, title: 'Add Fsclient'},
  {path: 'fsclients/:id', component: FsclientProfileComponent, title: 'Fsclient Profile'},
  {path: 'request-forms', component: RequestFormComponent, title: 'Request Form'},
  {path: 'donators', component: DonatorCardComponent, title: 'Donators'},
  {path: 'volunteers', component: VolunteerCardComponent, title: 'Volunteers'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
