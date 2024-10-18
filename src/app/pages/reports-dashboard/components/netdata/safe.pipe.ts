/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import {
  DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl,
} from '@angular/platform-browser';

enum ValueType {
  Html = 'html',
  Style = 'style',
  Script = 'script',
  Url = 'url',
  ResourceUrl = 'resourceUrl',
}

@Pipe({
  name: 'safe',
  standalone: true,
})
export class SafePipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}

  transform(
    value: unknown,
    type: ValueType,
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl | never {
    switch (type) {
      case ValueType.Html: return this.sanitizer.sanitize(SecurityContext.HTML, value);
      case ValueType.Style: return this.sanitizer.sanitize(SecurityContext.STYLE, value);
      case ValueType.Script: return this.sanitizer.sanitize(SecurityContext.SCRIPT, value);
      case ValueType.Url: return this.sanitizer.sanitize(SecurityContext.URL, value);
      case ValueType.ResourceUrl: return this.sanitizer.bypassSecurityTrustResourceUrl(String(value));
      default: {
        console.error(new Error(`Invalid safe type specified: ${type}`));
        return null;
      }
    }
  }
}
