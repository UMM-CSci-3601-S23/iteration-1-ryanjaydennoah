import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FsclientListComponent } from './fsclient/fsclient-list.component';
import { FsclientProfileComponent } from './fsclient/fsclient-profile.component';
import { AddFsclientComponent } from './fsclient/add-fsclient.component';

// Note that the 'fsclients/new' route needs to come before 'fsclients/:id'.
// If 'fsclients/:id' came first, it would accidentally catch requests to
// 'fsclients/new'; the router would just think that the string 'new' is a fsclient ID.
const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'fsclients', component: FsclientListComponent, title: 'Fsclients'},
  {path: 'fsclients/new', component: AddFsclientComponent, title: 'Add Fsclient'},
  {path: 'fsclients/:id', component: FsclientProfileComponent, title: 'Fsclient Profile'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
