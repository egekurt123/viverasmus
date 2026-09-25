import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PropertiesComponent } from './pages/properties/properties.component';
import { PropertyDetailComponent } from './pages/property-detail/property-detail.component';
import { AuthComponent } from './pages/auth/auth.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  { path:'', component:HomeComponent, title:'viverasmus | Find your home in Sevilla' },
  { path:'properties', component:PropertiesComponent, title:'Student rentals in Sevilla | viverasmus' },
  { path:'properties/:id', component:PropertyDetailComponent, title:'Home details | viverasmus' },
  { path:'contact', component:ContactComponent, title:'Contact viverasmus' },
  { path:'about', component:AboutComponent, title:'About the viverasmus team' },
  { path:'login', component:AuthComponent, data:{mode:'login'}, title:'Log in | viverasmus' },
  { path:'**', redirectTo:'' }
];
