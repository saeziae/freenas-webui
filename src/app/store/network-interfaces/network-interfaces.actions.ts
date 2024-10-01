import { createAction, props } from '@ngrx/store';

export const networkInterfacesChanged = createAction('[Network Interfaces] Changed');
export const testingInterfaceChanges = createAction('[Network Interfaces] Testing Interface Changes');
export const interfaceChangesCheckedIn = createAction('[Network Interfaces] Interface Changes Checked In');
export const interfaceCheckinCancelled = createAction('[Network Interfaces] Interface Checkin Cancelled');

export const networkInterfacesCheckinLoaded = createAction(
  '[Network Interfaces] Checkin Loaded',
  props<{ hasPendingChanges: boolean; checkinWaiting: number }>(),
);

export const checkinIndicatorPressed = createAction(
  '[Network Interfaces] Checkin Indicator Pressed',
);
