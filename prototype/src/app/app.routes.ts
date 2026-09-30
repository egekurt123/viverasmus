import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { AdminComponent } from './pages/admin/admin.component';
import { NewFlatComponent } from './pages/new-flat/new-flat.component';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path:'', component:HomeComponent, title:'viverasmus | Find your home in Sevilla' },
  { path:'properties', component:PropertiesComponent, title:'Student rentals in Sevilla | viverasmus' },
  { path:'properties/:id', component:PropertyDetailComponent, title:'Home details | viverasmus' },
  { path:'properties/:id/rooms/:roomId', component:PropertyDetailComponent, title:'Room details | viverasmus' },
  { path:'contact', component:ContactComponent, title:'Contact viverasmus' },
  { path:'about', component:AboutComponent, title:'About the viverasmus team' },
  { path:'login', component:AuthComponent, data:{mode:'login'}, title:'Log in | viverasmus' },
  { path:'admin', component:AdminComponent, canActivate:[adminGuard], title:'Rooms & bookings | viverasmus' },
  { path:'admin/new-flat', component:NewFlatComponent, canActivate:[adminGuard], title:'Add a flat | viverasmus' },
  { path:'**', redirectTo:'' }
];
