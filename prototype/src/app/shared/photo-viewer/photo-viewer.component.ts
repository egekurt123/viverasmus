import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

/** Full-screen photo viewer: big photo on top, arrows and thumbnails to click through. */
@Component({
  selector: 'app-photo-viewer', standalone: true,
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.scss'
})
export class PhotoViewerComponent implements OnInit {
  @Input({ required: true }) photos: string[] = [];
  @Input() start = 0;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();
  index = 0;

  ngOnInit(): void { this.index = Math.min(Math.max(this.start, 0), Math.max(this.photos.length - 1, 0)); }
  step(delta: number): void { this.index = (this.index + delta + this.photos.length) % this.photos.length; }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.step(1);
    else if (event.key === 'ArrowLeft') this.step(-1);
    else if (event.key === 'Escape') this.closed.emit();
  }
}
