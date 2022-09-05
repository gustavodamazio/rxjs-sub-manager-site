import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { uniqueId } from 'lodash';
import { BehaviorSubject, interval, map } from 'rxjs';
import { SubscriptionManager } from 'rxjs-sub-manager';
import { SnackbarService } from 'src/shared/snackbar.service';

import { SubOptions } from '../models/sub-options';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChildrenComponent implements OnInit, OnDestroy {
  private readonly subscriptionManager = new SubscriptionManager<string>({
    prefixId: 'ChildrenComponent-',
  });
  public readonly activeSubsKeys$ = new BehaviorSubject<SubOptions[]>([]);
  public readonly emitCount$ = new BehaviorSubject(0);

  constructor(private snackbarService: SnackbarService) {}
  // -----------------------------------------------------------------------------------------------------
  // @ Ganchos do ciclo de vida
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.openActiveSubs();
  }
  ngOnDestroy(): void {
    this.subscriptionManager.destroy();
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Métodos privados
  // -----------------------------------------------------------------------------------------------------
  private openActiveSubs(): void {
    if (!this.subscriptionManager.hasActive('activeSubs$')) {
      const sub = this.subscriptionManager.activeSubs$.subscribe(
        (activeSubs) => {
          const keys = Array.from(activeSubs.keys()).map((key) => ({
            value: key,
            label: key,
          }));
          if (keys.length > 0) {
            this.activeSubsKeys$.next(
              [{ value: null, label: '* Close all subs' } as SubOptions].concat(
                keys
              )
            );
          } else {
            this.activeSubsKeys$.next([]);
          }
        }
      );
      this.subscriptionManager.add({ ref: 'activeSubs$', sub });
    }
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Métodos públicos
  // -----------------------------------------------------------------------------------------------------
  public closeSub(value: string | null): void {
    if (value === null) {
      this.subscriptionManager.closeAll();
      this.activeSubsKeys$.next([]);
    } else if (value === 'activeSubs$') {
      this.subscriptionManager.close(value);
      const activeSubs = this.activeSubsKeys$
        .getValue()
        .filter((item) => item.value !== value);
      this.activeSubsKeys$.next(activeSubs.length > 1 ? activeSubs : []);
    } else {
      this.subscriptionManager.close(value);
    }
  }
  public openNewSub(): void {
    if (this.subscriptionManager.hasActive('activeSubs$')) {
      if (this.subscriptionManager.activeSubsValue.size < 10) {
        const counterId = uniqueId('counterId_');
        const sub = interval(2000).subscribe((count) => {
          console.warn(`${counterId} - emit count:${count + 1}`);
          this.emitCount$.next(this.emitCount$.getValue() + 1);
        });
        this.subscriptionManager.add({ ref: counterId, sub });
      } else {
        this.snackbarService.queueSnackBar(
          'You can only have 10 active subscriptions in component',
          {
            duration: 1000,
            panelClass: 'mat-snack-bar-custom',
            verticalPosition: 'top',
            horizontalPosition: 'right',
          }
        );
      }
    } else {
      this.openActiveSubs();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Getters
  // -----------------------------------------------------------------------------------------------------
  public get subscriptionManagerActiveSubsLength$() {
    return this.subscriptionManager.activeSubs$.pipe(map((subs) => subs.size));
  }
  public get subscriptionManagerClosedSubsLength$() {
    return this.subscriptionManager.closedSubs$.pipe(map((subs) => subs.size));
  }
}
