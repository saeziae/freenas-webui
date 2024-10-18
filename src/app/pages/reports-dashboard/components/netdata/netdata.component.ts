import {
  ChangeDetectionStrategy, Component, signal, OnInit,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { environment } from 'environments/environment';
import {
  combineLatest, Observable, tap,
} from 'rxjs';
import { AppLoaderService } from 'app/modules/loader/app-loader.service';
import { SafePipe } from 'app/pages/reports-dashboard/components/netdata/safe.pipe';
import { ReportsService } from 'app/pages/reports-dashboard/reports.service';
import { AuthService } from 'app/services/auth/auth.service';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { WebSocketService } from 'app/services/ws.service';

@UntilDestroy()
@Component({
  selector: 'ix-netdata-dashboard',
  templateUrl: 'netdata.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    SafePipe,
  ],
})
export class NetdataComponent implements OnInit {
  url = signal('');

  constructor(
    private ws: WebSocketService,
    private reportsService: ReportsService,
    private loader: AppLoaderService,
    private errorHandler: ErrorHandlerService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    // this.authService.user$.pipe(
    //   filter(Boolean),
    //   take(1),
    //   switchMap((user) => {
    //     const url = new URL(this.window.location.href);
    //     url.username = user.pw_name;
    //     url.password = password;
    //     url.pathname = '/netdata/';

    //     return this.http.get(url.toString(), { responseType: 'text' }).pipe(
    //       tap(() => this.window.open(url.pathname)),
    //     );
    //   }),
    //   this.errorHandler.catchError(),
    // ).subscribe();
    combineLatest([
      this.generatePassword(),
      this.auth.user$,
    ]).pipe(
      tap(([password, userData]) => {
        const url = new URL(`http://${environment.remote.toString()}`);
        url.username = userData.pw_name;
        url.password = password;
        url.pathname = '/netdata/';
        this.url.set(url.toString());
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  protected onGeneratePasswordPressed(): void {
    this.generatePassword()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  private generatePassword(): Observable<string> {
    return this.ws.call('reporting.netdataweb_generate_password')
      .pipe(
        this.loader.withLoader(),
        this.errorHandler.catchError(),
      );
  }
}
