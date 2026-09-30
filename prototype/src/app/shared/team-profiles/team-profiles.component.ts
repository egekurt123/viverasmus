import { Component, Input } from '@angular/core';
import { OFFICE, TEAM } from '../../core/config/team';
import { flagFor } from '../../core/config/countries';

/** The viverasmus office team, so students know who they are talking to. */
@Component({
  selector: 'app-team-profiles', standalone: true,
  templateUrl: './team-profiles.component.html',
  styleUrl: './team-profiles.component.scss'
})
export class TeamProfilesComponent {
  /** Smaller avatars side by side, for sidebars and cards. */
  @Input() compact = false;
  team = TEAM; office = OFFICE; flagFor = flagFor;
}
