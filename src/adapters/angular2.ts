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
 * Interface:
 * - setup
 * - cleanup
 * - subscribe
 * - serialize
 *
 * Supports up to 2.0.0-alpha.40
 */
import {
  DebugElement,
  inspectNativeElement
} from '../../node_modules/angular2/ts/angular2';
import { BaseAdapter } from './base';


export class Angular2Adapter extends BaseAdapter {
  private _observer: MutationObserver;

  setup(): void {
    const roots = this._findRoots();

    roots.forEach(root => this._traverseTree(inspectNativeElement(root),
                                             this._emitNativeElement),
                                             true);
    roots.forEach(root => this._trackChanges(root));
  }

  cleanup(): void {
    this._removeAllListeners();
    this.unsubscribe();
  }

  _rootSelector(): string {
    // Taken from debug_element_view_listener.ts
    const NG_ID_PROPERTY = 'ngid';
    const NG_ID_SEPARATOR = '#';


    return `[data-${ NG_ID_PROPERTY }$='${ NG_ID_SEPARATOR }0']`;
  }

  _findRoots(): Element[] {
    const roots = document.body.querySelectorAll(this._rootSelector());

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

  _getComponentChildren(compEl: DebugElement): DebugElement[] {
    return compEl.componentViewChildren;
  }

  _emitNativeElement(compEl: DebugElement, isRoot?: boolean): void {
    if (isRoot) return this.addRoot(this._getNativeElement(compEl));

    this.addChild(this._getNativeElement(compEl));
  }

  _getNativeElement(compEl: DebugElement): Element {
    return compEl.nativeElement;
  }

  _removeAllListeners(): void {
    this._observer.disconnect();
  }

  _trackChanges(el: Element): void {

    this._observer = new MutationObserver(this._handleChanges);

    this._observer.observe(el, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  _handleChanges(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
      switch(mutation.type) {
        case 'attributes':
          this.changeComponent(<Element>mutation.target);

          break;
        case 'childList':
          const additions = Array.prototype.slice.call(mutation.addedNodes);
          const removals = Array.prototype.slice.call(mutation.removedNodes);

          additions.forEach(this._handleNodeAddition);
          removals.forEach(this._handleNodeRemoval);

          break;
        case 'characterData':
        default:
          return;
      }
    });
  }

  _handleNodeAddition(node: Node): void {
    const el = <Element>node;

    if (this._isRootNode(el)) return this.addRoot(el);

    this.addChild(el);
  }

  _handleNodeRemoval(node: Node): void {
    const el = <Element>node;

    if (this._isRootNode(el)) return this.removeRoot(el);

    this.removeChild(el);
  }

  _isRootNode(el: Element): boolean {
    var id = el.getAttribute('ngid');

    if (!id) return false;

    return this._selectorMatches(el, this._rootSelector());
  }

  _selectorMatches(el: Element, selector: string): boolean {
    function genericMatch(s: string): boolean {
      return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    }

    const p = Element.prototype;
    const f = p.matches ||
              p.webkitMatchesSelector ||
              p.mozMatchesSelector ||
              p.msMatchesSelector ||
              genericMatch;
    };

    return f.call(el, selector);
  }
}