import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TeamProfilesComponent } from '../../shared/team-profiles/team-profiles.component';

@Component({
  standalone: true,
  imports: [RouterLink, TeamProfilesComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {}
