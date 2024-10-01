import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { switchMap, tap } from 'rxjs/operators';
import { NetworkInterface } from 'app/interfaces/network-interface.interface';
import { DialogService } from 'app/services/dialog.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { WebSocketService } from 'app/services/ws.service';
import { networkInterfacesChanged } from 'app/store/network-interfaces/network-interfaces.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'app/store';

export interface InterfacesState {
  interfaces: NetworkInterface[];
  isLoading: boolean;
}

const initialState: InterfacesState = {
  interfaces: [],
  isLoading: false,
};

@Injectable()
export class InterfacesStore extends ComponentStore<InterfacesState> {
  constructor(
    private ws: WebSocketService,
    private dialogService: DialogService,
    private errorHandler: ErrorHandlerService,
    private store$: Store<AppState>,
  ) {
    super(initialState);
  }

  readonly loadInterfaces = this.effect((trigger$) => {
    return trigger$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap(() => {
        return this.ws.call('interface.query').pipe(
          tap({
            next: (interfaces) => this.patchState({ interfaces }),
            error: (error) => this.dialogService.error(this.errorHandler.parseWsError(error)),
            complete: () => this.patchState({ isLoading: false }),
          }),
        );
      }),
    );
  });

  readonly interfacesUpdated = this.effect((trigger$) => {
    return trigger$.pipe(
      tap(() => {
        this.loadInterfaces();
        this.store$.dispatch(networkInterfacesChanged());
      }),
    );
  });
}
