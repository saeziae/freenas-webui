import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import helptext from 'app/helptext/network/interfaces/interfaces-list';
import { untilDestroyed } from '@ngneat/until-destroy';
import { lastValueFrom, Observable, switchMap } from 'rxjs';
import {
  interfaceChangesCheckedIn, interfaceCheckinCancelled,
  networkInterfacesChanged, testingInterfaceChanges
} from 'app/store/network-interfaces/network-interfaces.actions';
import { WebSocketService } from 'app/services/ws.service';
import { filter, tap } from 'rxjs/operators';
import { DialogService } from 'app/services/dialog.service';
import { AppLoaderService } from 'app/modules/loader/app-loader.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { InterfacesStore } from 'app/pages/network/stores/interfaces.store';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { Router } from '@angular/router';
import { WINDOW } from 'app/helpers/window.helper';
import { Interval } from 'app/interfaces/timeout.interface';
import { Actions, ofType } from '@ngrx/effects';
import { ServiceRestartedOnNetworkSync } from 'app/interfaces/network-interface.interface';
import { selectHasPendingNetworkChanges } from 'app/store/network-interfaces/network-interfaces.selectors';

@Component({
  selector: 'ix-pending-changes',
  templateUrl: './pending-changes.component.html',
  styleUrls: ['./pending-changes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingChangesComponent implements OnInit {
  @Input() isHaEnabled = false;

  readonly hasPendingChanges$ = this.store$.select(selectHasPendingNetworkChanges);

  checkinWaiting = false;
  checkinRemaining: number = null;
  checkinInterval: Interval;

  checkinTimeout = 60;
  checkinTimeoutPattern = /\d+/;

  protected readonly helptext = helptext;

  private uniqueIps: string[] = [];
  private affectedServices: string[] = [];

  constructor(
    private ws: WebSocketService,
    private dialogService: DialogService,
    private loader: AppLoaderService,
    private errorHandler: ErrorHandlerService,
    private interfacesStore: InterfacesStore,
    private store$: Store<AppState>,
    private translate: TranslateService,
    private snackbar: SnackbarService,
    private actions$: Actions,
    private cdr: ChangeDetectorRef,
    @Inject(WINDOW) private window: Window,
  ) {}

  ngOnInit(): void {
    this.loadCheckinStatus();

    this.actions$.pipe(
      ofType(interfaceCheckinCancelled, interfaceChangesCheckedIn),
      untilDestroyed(this),
    )
      .subscribe(() => {
        this.checkinRemaining = null;
        this.checkinWaiting = false;
        if (this.checkinInterval) {
          clearInterval(this.checkinInterval);
        }
        this.cdr.markForCheck();
      });
  }

  async loadCheckinStatus(): Promise<void> {
    this.handleWaitingCheckin(await this.getCheckinWaitingSeconds());
  }

  // TODO
  async loadCheckinStatusAfterChange(): Promise<void> {
    let hasPendingChanges = await this.getPendingChanges();
    let checkinWaitingSeconds = await this.getCheckinWaitingSeconds();

    // This handles scenario where user made one change, clicked Test and then made another change.
    // TODO: Backend should be deciding to reset timer.
    if (hasPendingChanges && checkinWaitingSeconds > 0) {
      await this.cancelCommit();
      hasPendingChanges = await this.getPendingChanges();
      checkinWaitingSeconds = await this.getCheckinWaitingSeconds();
    }

    this.handleWaitingCheckin(checkinWaitingSeconds);
  }

  private getCheckinWaitingSeconds(): Promise<number> {
    return lastValueFrom(
      this.ws.call('interface.checkin_waiting'),
    );
  }

  private async cancelCommit(): Promise<void> {
    await lastValueFrom(
      this.ws.call('interface.cancel_rollback'),
    );
  }

  testChanges(): void {
    this.ws
      .call('interface.services_restarted_on_sync')
      .pipe(
        switchMap((services) => {
          this.parseServices(services);
          return this.dialogService.confirm({
            title: helptext.commit_changes_title,
            message: helptext.commit_changes_warning,
            buttonText: helptext.commit_button,
          });
        }),
        filter(Boolean),
        switchMap(() => {
          return this.ws
            .call('interface.commit', [{ checkin_timeout: this.checkinTimeout }])
            .pipe(
              this.loader.withLoader(),
              this.errorHandler.catchError(),
              switchMap(() => this.getCheckinWaitingSeconds()),
            );
        }),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.store$.dispatch(testingInterfaceChanges());
        this.interfacesStore.loadInterfaces();
      });
  }

  checkInNow(): void {
    let dialog$: Observable<boolean>;
    if (this.affectedServices.length > 0) {
      dialog$ = this.dialogService
        .confirm({
          title: helptext.services_restarted.title,
          message: this.translate.instant(helptext.services_restarted.message, {
            uniqueIPs: this.uniqueIps.join(', '),
            affectedServices: this.affectedServices.join(', '),
          }),
          hideCheckbox: true,
          buttonText: helptext.services_restarted.button,
        });
    } else {
      dialog$ = this.dialogService
        .confirm({
          title: helptext.checkin_title,
          message: helptext.checkin_message,
          hideCheckbox: true,
          buttonText: helptext.checkin_button,
        });
    }

    dialog$
      .pipe(filter(Boolean), untilDestroyed(this))
      .subscribe(() => {
        this.makeCheckinRequest();
      });
  }

  makeCheckinRequest(): void {
    this.ws
      .call('interface.checkin')
      .pipe(
        this.loader.withLoader(),
        this.errorHandler.catchError(),
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.store$.dispatch(interfaceChangesCheckedIn());

        this.snackbar.success(this.translate.instant(helptext.checkin_complete_message));
        this.checkinWaiting = false;
        clearInterval(this.checkinInterval);
        this.checkinRemaining = null;

        this.cdr.markForCheck();
      });
  }

  rollbackPendingChanges(): void {
    this.dialogService
      .confirm({
        title: helptext.rollback_changes_title,
        message: helptext.rollback_changes_warning,
        buttonText: helptext.rollback_button,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          return this.ws
            .call('interface.rollback')
            .pipe(
              this.loader.withLoader(),
              this.errorHandler.catchError(),
              tap(() => {
                this.store$.dispatch(interfaceCheckinCancelled());
                this.interfacesStore.loadInterfaces();
                this.checkinWaiting = false;
                this.snackbar.success(this.translate.instant(helptext.changes_rolled_back));
              }),
            );
        }),
        untilDestroyed(this))
      .subscribe();
  }

  private handleWaitingCheckin(seconds: number): void {
    if (seconds !== null) {
      if (seconds > 0 && this.checkinRemaining === null) {
        this.checkinRemaining = Math.round(seconds);
        this.checkinInterval = setInterval(() => {
          if (this.checkinRemaining > 0) {
            this.checkinRemaining -= 1;
          } else {
            this.checkinRemaining = null;
            this.checkinWaiting = false;
            clearInterval(this.checkinInterval);
            this.window.location.reload(); // should just refresh after the timer goes off
          }
        }, 1000);
      }
      this.checkinWaiting = true;
    } else {
      this.checkinWaiting = false;
      this.checkinRemaining = null;
      if (this.checkinInterval) {
        clearInterval(this.checkinInterval);
      }
    }
  }

  private parseServices(services: ServiceRestartedOnNetworkSync[]): void {
    this.uniqueIps = [];
    this.affectedServices = [];

    if (!services.length) {
      return;
    }

    const ips: string[] = [];
    services.forEach((item) => {
      // TODO: Check if `system-service` can actually be returned.
      const systemService = (item as unknown as { 'system-service': string })['system-service'];
      if (systemService) {
        this.affectedServices.push(systemService);
      }
      if (item.service) {
        this.affectedServices.push(item.service);
      }
      item.ips.forEach((ip) => {
        ips.push(ip);
      });
    });

    ips.forEach((ip) => {
      if (!this.uniqueIps.includes(ip)) {
        this.uniqueIps.push(ip);
      }
    });
  }
}
