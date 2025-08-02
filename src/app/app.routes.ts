import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationFormComponent } from './components/reservation-form/reservation-form';
import { Confirmation } from './components/confirmation/confirmation';

export const routes: Routes = [
  { path: '', component: ReservationFormComponent },
  { path: 'confirmation', component: Confirmation }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
