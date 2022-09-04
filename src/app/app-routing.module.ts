import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmptyComponent } from './empty/empty.component';
import { ParentComponent } from './parent/parent.component';

const routes: Routes = [
  {
    path: 'parent-child',
    component: ParentComponent,
  },
  {
    path: 'empty',
    component: EmptyComponent,
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '/parent-child',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
