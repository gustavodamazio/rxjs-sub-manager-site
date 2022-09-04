import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  firstValueFrom,
  map,
} from 'rxjs';
import {
  SubscriptionManager,
  SubscriptionManagerPublicContext,
} from 'rxjs-sub-manager';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly subscriptionManager = new SubscriptionManager({
    prefixId: 'AppComponent-',
  });
  public readonly rootSubsSize$ = new BehaviorSubject<number>(0);
  constructor(private router: Router) {}
  // -----------------------------------------------------------------------------------------------------
  // @ Ganchos do ciclo de vida
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    const sub =
      SubscriptionManagerPublicContext.subscriptionManagerInstances.subscribe(
        (instances) => {
          this.subscriptionManager.close('rootSubsSize$');
          const sub = combineLatest(
            Array.from(instances.values()).map((v) => v.activeSubs$)
          )
            .pipe(debounceTime(100))
            .subscribe((v) => {
              const size = v.reduce((acc, sm) => {
                return acc + sm.size;
              }, 0);
              this.rootSubsSize$.next(size);
            });
          this.subscriptionManager.add({ ref: 'rootSubsSize$', sub });
        }
      );
    this.subscriptionManager.add({ ref: 'subscriptionManagerInstances$', sub });
  }
  ngOnDestroy(): void {
    this.subscriptionManager.destroy();
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Métodos públicos
  // -----------------------------------------------------------------------------------------------------
  public async changeRoute(): Promise<void> {
    if (this.router.url === '/parent-child') {
      this.router.navigate(['empty']);
    } else {
      this.router.navigate(['parent-child']);
    }
  }
  public get subscriptionManagerInstancesInApp$() {
    return SubscriptionManagerPublicContext.subscriptionManagerInstances.pipe(
      map((instances) => instances.size)
    );
  }
  public get subscriptionManagerActiveSubsInApp$() {
    return SubscriptionManagerPublicContext.subscriptionManagerInstances.pipe(
      map((instances) =>
        Array.from(instances.values()).reduce((acc, sm) => {
          return acc + sm.activeSubsValue.size;
        }, 0)
      )
    );
  }
  public get subscriptionManagerActiveSubsNamesInApp$() {
    return SubscriptionManagerPublicContext.subscriptionManagerInstances.pipe(
      map((instances) =>
        Array.from(instances.values()).reduce((acc, sm) => {
          return acc.concat(sm.instanceId);
        }, [] as string[])
      )
    );
  }
}
