import {
  AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild,
} from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { CoreEvent, CoreService } from 'app/core/services/core.service';
import * as Ps from 'perfect-scrollbar';
import { Subscription } from 'rxjs';
import * as domHelper from '../../../../helpers/dom.helper';
import { RestService, WebSocketService } from '../../../../services';
import { LanguageService } from '../../../../services/language.service';
import { ThemeService } from '../../../../services/theme/theme.service';
import { ConsolePanelModalDialog } from '../../dialog/consolepanel/consolepanel-dialog.component';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.template.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit, AfterViewChecked {
  private isMobile;
  screenSizeWatcher: Subscription;
  isSidenavOpen: Boolean = true;
  sidenavMode = 'over';
  isShowFooterConsole: Boolean = false;
  isSidenotOpen: Boolean = false;
  consoleMsg: String = '';
  hostname: string;
  consoleMSgList: any[] = [];
  product_type = window.localStorage['product_type'];
  logoPath = 'assets/images/light-logo.svg';
  logoTextPath = 'assets/images/light-logo-text.svg';
  currentTheme = '';
  retroLogo = false;
  // we will just have to add to this list as more languages are added

  @ViewChild(MatSidenav, { static: false }) private sideNave: MatSidenav;
  @ViewChild('footerBarScroll', { static: true }) private footerBarScroll: ElementRef;
  freenasThemes;

  get sidenavWidth() {
    return this.getSidenavWidth();
  }

  constructor(private router: Router,
    public core: CoreService,
    public cd: ChangeDetectorRef,
    public themeService: ThemeService,
    private media: MediaObserver,
    protected rest: RestService,
    protected ws: WebSocketService,
    public language: LanguageService,
    public dialog: MatDialog) {
    // detect server type
    ws.call('system.product_type').subscribe((res) => {
      this.product_type = res;
    });

    // Close sidenav after route change in mobile
    router.events.subscribe((routeChange) => {
      if (routeChange instanceof NavigationEnd && this.isMobile) {
        this.sideNave.close();
      }
    });
    // Watches screen size and open/close sidenav
    this.screenSizeWatcher = media.media$.subscribe((change: MediaChange) => {
      this.isMobile = window.innerWidth < 960;
      // this.isMobile = (change.mqAlias == 'xs') || (change.mqAlias == 'sm');
      this.updateSidenav();
      core.emit({ name: 'MediaChange', data: change, sender: this });
    });

    // Subscribe to Theme Changes
    core.register({
      observerClass: this,
      eventName: 'ThemeChanged',
      sender: themeService,
    }).subscribe((evt: CoreEvent) => {
      const theme = evt.data;
      // this.logoPath = theme.logoPath;
      // this.logoTextPath = theme.logoTextPath;
    });

    // Subscribe to Preference Changes
    core.register({
      observerClass: this,
      eventName: 'UserPreferencesChanged',
    }).subscribe((evt: CoreEvent) => {
      this.retroLogo = evt.data.retroLogo ? evt.data.retroLogo : false;
    });

    // Listen for system information changes
    core.register({
      observerClass: this,
      eventName: 'SysInfo',
    }).subscribe((evt: CoreEvent) => {
      this.hostname = evt.data.hostname;
    });

    core.register({
      observerClass: this,
      eventName: 'ForceSidenav',
    }).subscribe((evt: CoreEvent) => {
      this.updateSidenav(evt.data);
    });

    core.register({
      observerClass: this,
      eventName: 'SidenavStatus',
    }).subscribe((evt: CoreEvent) => {
      this.isSidenavOpen = evt.data.isOpen;
      this.sidenavMode = evt.data.mode;
    });
  }

  ngOnInit() {
    this.freenasThemes = this.themeService.allThemes;
    this.currentTheme = this.themeService.currentTheme().name;
    // Initialize Perfect scrollbar for sidenav
    const navigationHold = document.getElementById('scroll-area');

    // Delay needed to fix a init err with navbar vert scroll
    setTimeout(() => {
      Ps.initialize(navigationHold, {
        suppressScrollX: true,
      });
    }, 500);

    // Allows for one-page-at-a-time scrolling in sidenav on Windows
    if (window.navigator.platform.toLowerCase() === 'win32') {
      navigationHold.addEventListener('wheel', (e) => {
        // deltaY is 1 for page scrolling and 33.3 per line for regular scrolling; default is 100, or 3 lines at a time
        if (e.deltaY === 1 || e.deltaY === -1) {
          navigationHold.scrollBy(0, e.deltaY * window.innerHeight);
        }
      });
    }

    if (this.media.isActive('xs') || this.media.isActive('sm')) {
      this.isSidenavOpen = false;
    }
    this.checkIfConsoleMsgShows();

    this.core.emit({ name: 'SysInfoRequest', sender: this });
  }

  ngAfterViewChecked() {
    this.scrollToBottomOnFooterBar();
  }

  updateSidenav(force?: string) {
    if (force) {
      this.isSidenavOpen = force == 'open';
      this.isSidenotOpen = force != 'open';
      if (force == 'close') {
        domHelper.removeClass(document.body, 'collapsed-menu');
      }
      return;
    }

    this.isSidenavOpen = !this.isMobile;
    this.isSidenotOpen = false;
    this.sidenavMode = this.isMobile ? 'over' : 'side';
    if (this.isMobile) {
      domHelper.removeClass(document.body, 'collapsed-menu');
    }
    this.cd.detectChanges();
  }

  getSidenavWidth(): string {
    const iconified = domHelper.hasClass(document.body, 'collapsed-menu');
    if (this.isSidenavOpen && iconified && this.sidenavMode == 'side') {
      return '48px';
    } if (this.isSidenavOpen && !iconified && this.sidenavMode == 'side') {
      return '240px';
    }
    return '0px';
  }

  scrollToBottomOnFooterBar(): void {
    try {
      this.footerBarScroll.nativeElement.scrollTop = this.footerBarScroll.nativeElement.scrollHeight;
    } catch (err) { }
  }

  checkIfConsoleMsgShows() {
    this.ws.call('system.advanced.config', [])
      .subscribe((res) => this.onShowConsoleFooterBar(res.consolemsg));
  }

  getLogConsoleMsg() {
    const subName = 'filesystem.file_tail_follow:/var/log/messages:500';

    this.ws.sub(subName).subscribe((res) => {
      if (res && res.data && typeof res.data === 'string') {
        this.consoleMsg = this.accumulateConsoleMsg(res.data, 3);
      }
    });
  }

  accumulateConsoleMsg(msg, num) {
    let msgs = '';
    const msgarr = msg.split('\n');

    // consoleMSgList will store just 500 messages.
    for (let i = 0; i < msgarr.length; i++) {
      if (msgarr[i] !== '') {
        this.consoleMSgList.push(msgarr[i]);
      }
    }
    while (this.consoleMSgList.length > 500) {
      this.consoleMSgList.shift();
    }
    if (num > 500) {
      num = 500;
    }
    if (num > this.consoleMSgList.length) {
      num = this.consoleMSgList.length;
    }
    for (let i = this.consoleMSgList.length - 1; i >= this.consoleMSgList.length - num; --i) {
      msgs = this.consoleMSgList[i] + '\n' + msgs;
    }

    return msgs;
  }

  onShowConsoleFooterBar(data) {
    if (data && this.consoleMsg == '') {
      this.getLogConsoleMsg();
    }

    this.isShowFooterConsole = data;
  }

  onShowConsolePanel() {
    const dialogRef = this.dialog.open(ConsolePanelModalDialog, {});
    const sub = dialogRef.componentInstance.onEventEmitter.subscribe(() => {
      dialogRef.componentInstance.consoleMsg = this.accumulateConsoleMsg('', 500);
    });

    dialogRef.afterClosed().subscribe((result) => {
      clearInterval(dialogRef.componentInstance.intervalPing);
      sub.unsubscribe();
    });
  }

  onOpenNav($event) {
    this.isSidenavOpen = true;
  }

  onCloseNav($event) {
    this.isSidenavOpen = false;
  }

  onOpenNotify($event) {
    this.isSidenotOpen = true;
  }

  onCloseNotify($event) {
    this.isSidenotOpen = false;
  }

  changeState($event) {
    if ($event.transfer) {
      if (this.media.isActive('xs') || this.media.isActive('sm')) {
        this.sideNave.close();
      }
    }
  }
}
