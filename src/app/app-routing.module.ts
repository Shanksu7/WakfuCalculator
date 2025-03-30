import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobsComponent } from './jobs/jobs.component';
import { SpellCardComponent } from './spell-card/spell-card.component';

const routes: Routes = [
  {
    path: '',
    component: JobsComponent
  },
  {
    path: 'damage',
    component: SpellCardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
