import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EmptyComponent implements OnInit {
  public isLoading$ = new BehaviorSubject(true);
  constructor() { }

  ngOnInit(): void {
  }

}
