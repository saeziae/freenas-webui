import { MatDialog } from '@angular/material/dialog';
import {
  byText, createComponentFactory, Spectator, mockProvider,
} from '@ngneat/spectator/jest';
import { of } from 'rxjs';
import { mockAuth } from 'app/core/testing/utils/mock-auth.utils';
import { mockCall, mockWebSocket } from 'app/core/testing/utils/mock-websocket.utils';
import { HasRoleDirective } from 'app/directives/has-role/has-role.directive';
import { Disk } from 'app/interfaces/disk.interface';
import { TopologyDisk } from 'app/interfaces/storage.interface';
import {
  ManageDiskSedDialogComponent,
} from 'app/pages/storage/modules/devices/components/hardware-disk-encryption/manage-disk-sed-dialog/manage-disk-sed-dialog.component';
import { WebSocketService } from 'app/services/api.service';
import { HardwareDiskEncryptionComponent } from './hardware-disk-encryption.component';

describe('HardwareDiskEncryptionComponent', () => {
  let spectator: Spectator<HardwareDiskEncryptionComponent>;
  const createComponent = createComponentFactory({
    component: HardwareDiskEncryptionComponent,
    imports: [
      HasRoleDirective,
    ],
    providers: [
      mockWebSocket([
        mockCall('disk.query', [{ passwd: '' } as Disk]),
        mockCall('system.advanced.sed_global_password_is_set', true),
      ]),
      mockProvider(MatDialog, {
        open: jest.fn(() => ({
          afterClosed: () => of(),
        })),
      }),
      mockAuth(),
    ],
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        topologyDisk: {
          disk: 'sda',
        } as TopologyDisk,
      },
    });
  });

  it('loads and shows whether password is set for the current disk', () => {
    expect(spectator.inject(WebSocketService).call)
      .toHaveBeenCalledWith('disk.query', [[['devname', '=', 'sda']], { extra: { passwords: true } }]);

    const detailsItem = spectator.query(byText('SED Password:', { exact: true }));
    expect(detailsItem.nextElementSibling).toHaveText('Password is not set');
  });

  it('loads and shows whether SED password is set globally', () => {
    expect(spectator.inject(WebSocketService).call).toHaveBeenCalledWith('system.advanced.sed_global_password_is_set');

    const detailsItem = spectator.query(byText('Global SED Password:', { exact: true }));
    expect(detailsItem.nextElementSibling).toHaveText('Password is set');
  });

  it('opens a ManageDiskSedDialogComponent when user clicks on Manage SED Password', () => {
    spectator.click(spectator.query(byText('Manage SED Password')));

    expect(spectator.inject(MatDialog).open).toHaveBeenCalledWith(ManageDiskSedDialogComponent, { data: 'sda' });
  });

  it('shows a link to manage global SED password', () => {
    const link = spectator.query(byText('Manage Global SED Password'));
    expect(link).toHaveAttribute('href', '/system/advanced');
  });
});
