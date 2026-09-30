import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Office-only: pick which photo is shown first. The first photo in the list is the current cover. */
@Component({
  selector: 'app-cover-picker', standalone: true,
  templateUrl: './cover-picker.component.html',
  styleUrl: './cover-picker.component.scss'
})
export class CoverPickerComponent {
  @Input({ required: true }) photos: string[] = [];
  @Input() label = 'PHOTOS';
  @Input() hint = 'Choose the photo shown first.';
  @Output() cover = new EventEmitter<string>();
}
