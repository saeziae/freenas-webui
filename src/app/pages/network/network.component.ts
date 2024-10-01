import {
  Component, Inject, OnDestroy, OnInit,
} from '@angular/core';
import { Navigation, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import {
  combineLatest, lastValueFrom, Subject, switchMap,
} from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ProductType } from 'app/enums/product-type.enum';
import { WINDOW } from 'app/helpers/window.helper';
import { CoreEvent } from 'app/interfaces/events';
import { Interval } from 'app/interfaces/timeout.interface';
import { IxSlideInRef } from 'app/modules/ix-forms/components/ix-slide-in/ix-slide-in-ref';
import { AppLoaderService } from 'app/modules/loader/app-loader.service';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { InterfaceFormComponent } from 'app/pages/network/components/interface-form/interface-form.component';
import { InterfacesStore } from 'app/pages/network/stores/interfaces.store';
import { DialogService } from 'app/services/dialog.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { IxSlideInService } from 'app/services/ix-slide-in.service';
import { SystemGeneralService } from 'app/services/system-general.service';
import { WebSocketService } from 'app/services/ws.service';
import { selectHaStatus, selectIsHaLicensed } from 'app/store/ha-info/ha-info.selectors';
import { AppState } from 'app/store/index';
import { networkInterfacesChanged } from 'app/store/network-interfaces/network-interfaces.actions';

@UntilDestroy()
@Component({
  selector: 'ix-interfaces-list',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss'],
})
export class NetworkComponent implements OnInit {

  isHaEnabled$ = combineLatest([
    this.store$.select(selectIsHaLicensed),
    this.store$.select(selectHaStatus).pipe(filter(Boolean)),
  ]).pipe(
    map(([isHa, { hasHa }]) => isHa && hasHa),
  );

  private navigation: Navigation;

  constructor(
    private ws: WebSocketService,
    private router: Router,
    private loader: AppLoaderService,
    private slideInService: IxSlideInService,
    private store$: Store<AppState>,
    private errorHandler: ErrorHandlerService,
    private interfacesStore: InterfacesStore,
  ) {
    this.navigation = this.router.getCurrentNavigation();
  }

  ngOnInit(): void {
    this.openInterfaceForEditFromRoute();
  }

  private openInterfaceForEditFromRoute(): void {
    const state = this.navigation?.extras?.state as { editInterface: string };
    if (!state?.editInterface) {
      return;
    }

    this.ws.call('interface.query', [[['id', '=', state.editInterface]]])
      .pipe(
        this.loader.withLoader(),
        this.errorHandler.catchError(),
        untilDestroyed(this),
      )
      .subscribe((interfaces) => {
        if (!interfaces[0]) {
          return;
        }

        this.slideInService
          .open(InterfaceFormComponent, { data: interfaces[0] })
          .slideInClosed$
          .pipe(filter(Boolean), untilDestroyed(this))
          .subscribe(() => {
            this.interfacesStore.interfacesUpdated();
          });
      });
  }
}
