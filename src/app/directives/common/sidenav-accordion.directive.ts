import {
  Directive, ElementRef, Input, Output, HostBinding, HostListener, EventEmitter, OnInit,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import * as domHelper from '../../helpers/dom.helper';

@Directive({ selector: '[sideNavAccordion]' })
export class SideNavAccordionDirective implements OnInit {
  constructor(private el: ElementRef) {
  }
  ngOnInit() {
    const self = this;
    var subMenu = this.el.nativeElement.querySelector('.mat-list-item-content > mat-nav-list');
    const isCollapsed = domHelper.hasClass(document.body, 'collapsed-menu');
    if (subMenu) { this.el.nativeElement.className += ' has-submenu'; }

    // remove open class that is added my router
    if (isCollapsed) {
      setTimeout(() => {
        domHelper.removeClass(self.el.nativeElement, 'open');
      });
    }
  }

  @HostListener('click', ['$event'])
  onClick($event) {
    var parentLi = domHelper.findClosest($event.target, 'mat-list-item');
    domHelper.addClass($event.target.parentElement, 'highlight');
    setTimeout(() => { domHelper.removeClass($event.target.parentElement, 'highlight'); }, 100);
    if (!domHelper.hasClass(parentLi, 'has-submenu')) {
      // PREVENTS CLOSING PARENT ITEM
      return;
    }
    this.toggleOpen();
  }

  // For collapsed sidebar
  @HostListener('mouseenter', ['$event'])
  onMouseEnter($event) {
    const elem = this.el.nativeElement;
    const isCollapsed = domHelper.hasClass(document.body, 'collapsed-menu');
    if (!isCollapsed) { return; }
    domHelper.addClass(elem, 'open');
  }
  @HostListener('mouseleave', ['$event'])
  onMouseLeave($event) {
    const elem = this.el.nativeElement;
    const isCollapsed = domHelper.hasClass(document.body, 'collapsed-menu');
    if (!isCollapsed) { return; }
    domHelper.removeClass(elem, 'open');
  }

  private toggleOpen() {
    var elem = this.el.nativeElement;
    var parenMenuItems = document.getElementsByClassName('has-submenu');

    if (domHelper.hasClass(elem, 'open')) {
      domHelper.removeClass(parenMenuItems, 'open');
    } else {
      domHelper.removeClass(parenMenuItems, 'open');
      domHelper.addClass(elem, 'open');
    }
  }
}
