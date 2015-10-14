/**
 * Adapter for Angular2
 *
 * An adapter hooks into the live application and broadcasts events related to
 * the state of the components (e.g. mount ops/locations, state changes,
 * performance profile, etc...).
 *
 * For more information, see the Base Adapater (./base.ts).
 *
 * NOTE: This is (definitely) a work in progress. Currently, for the adapter to
 *       function properly, the root of the application must be bound to a
 *       DebugElementViewListener.
 *
 * We infer the root element of our application by finding the first DOM element
 * with an `ngid` attribute (put there by DebugElementViewListener). Component
 * events are indicated by DOM mutations.
 *
 * Supports up to 2.0.0-alpha.40
 */
import {
  DebugElement,
  inspectNativeElement
} from '../../node_modules/angular2/ts/angular2';
import { BaseAdapter } from './base';


export class angular2Adapter extends BaseAdapter {

  setup(): void {
    const roots = this._findRoots();

    roots.forEach(root => this._traverseTree(inspectNativeElement(root),
                                             this._emitNativeElement),
                                             true);
  }

  cleanup(): void {
  }

  _findRoots(): Element[] {
    // Taken from debug_element_view_listener.ts
    const NG_ID_PROPERTY = 'ngid';
    const NG_ID_SEPARATOR = '#';


    const ROOT_SELECTOR = `[data-${ NG_ID_PROPERTY }$='${ NG_ID_SEPARATOR }0']`;
    const roots = document.body.querySelectorAll(ROOT_SELECTOR);

    return Array.prototype.slice.call(roots);
  }

  _traverseTree(compEl: DebugElement, cb?: Function, isRoot?: boolean): void {
    cb(compEl, isRoot);

    const children = this._getComponentChildren(compEl);

    if (!children.length) return;

    children.forEach((child: DebugElement) => {
      this._traverseTree(child, cb);
    });
  }

  _getComponentChildren(compEl: DebugElement) {
    return compEl.componentViewChildren;
  }

  _emitNativeElement(compEl: DebugElement, isRoot?: boolean): void {
    if (isRoot) return this.addRoot(this._getNativeElement(compEl));

    this.addChild(this._getNativeElement(compEl));
  }

  _getNativeElement(compEl: DebugElement): Element {
    return compEl.nativeElement;
  }
}