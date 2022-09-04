import { Injectable, OnDestroy } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig, MatSnackBarDismiss, } from "@angular/material/snack-bar";
import { BehaviorSubject, filter, map, Observable, Subject } from "rxjs";
import { tap, takeUntil, delay, take } from "rxjs/operators";

export interface SnackBarQueueItem {
  message: string;
  beingDispatched: boolean;
  configParams?: MatSnackBarConfig;
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService implements OnDestroy {

  private readonly snackBarQueue = new BehaviorSubject<SnackBarQueueItem[]>([]);
  private readonly snackBarQueue$ = this.snackBarQueue.asObservable();
  private readonly ngDestroy = new Subject<void>();


  constructor(
    private matSnackBar: MatSnackBar,
  ) {
    /* Dispatches all queued snack bars one by one */
    this.snackBarQueue$
      .pipe(
        filter(queue => queue.length > 0 && !queue[0].beingDispatched),
        tap(() => {
          const updatedQueue = this.snackBarQueue.value;
          updatedQueue[0].beingDispatched = true;
          this.snackBarQueue.next(updatedQueue);
        }),
        map(queue => queue[0]),
        takeUntil(this.ngDestroy))
      .subscribe(snackBarItem => this.showSnackbar(snackBarItem.message, snackBarItem.configParams));
  }

  public ngOnDestroy() {
    this.snackBarQueue.next([]);
    this.snackBarQueue.complete();
    this.ngDestroy.next();
    this.ngDestroy.complete();
  }

  public queueSnackBar(message: string, configParams?: MatSnackBarConfig) {
    this.snackBarQueue.next(
      this.snackBarQueue.value.concat([{ message, configParams, beingDispatched: false }]),
    );
  }

  private showSnackbar(message: string, configParams?: MatSnackBarConfig) {
    this.removeDismissedSnackBar(
      this.matSnackBar.open(message, 'OK', configParams).afterDismissed(),
    );
  }

  private removeDismissedSnackBar(dismissed: Observable<MatSnackBarDismiss>) {
    dismissed
      .pipe(
        delay(20),
        take(1))
      .subscribe(() => {
        const updatedQueue = this.snackBarQueue.value;
        if (updatedQueue[0].beingDispatched) updatedQueue.shift();
        this.snackBarQueue.next(updatedQueue);
      });
  }
}
