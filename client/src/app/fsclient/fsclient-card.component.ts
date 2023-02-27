import { Component, Input } from '@angular/core';
import { Fsclient } from './fsclient';

@Component({
  selector: 'app-fsclient-card',
  templateUrl: './fsclient-card.component.html',
  styleUrls: ['./fsclient-card.component.scss']
})
export class FsclientCardComponent {

  @Input() fsclient: Fsclient;
  @Input() simple?: boolean = false;

}
