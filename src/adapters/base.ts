/**
 * Base Adapter
 *
 * An adapter hooks into the live application and broadcasts events related to
 * the state of the components (e.g. mount ops/locations, state changes,
 * performance profile, etc...).
 *
 * For more information, see the Angular2 Adapater (./angular2.ts).
 *
 * The adapter works in two phases:
 * 1) Setup phase: The initial bootstrap of the extension. After angular
 *                 bootstraps and the DOM content has loaded, we walk the DOM
 *                 tree once and broadcast the addition of the initial
 *                 components into the view.
 * 2) Tracking phase: After setup, we listen to changes in the application and
 *                    broadcast component changes and removal as well as new
 *                    additions into the view after the intial load.
 *
 * These broadcasts are sent to the channel (./channel.ts).
 */
/// <reference path="../../typings/rx/rx.all.d.ts"/>
import { Subject } from 'rx';
import { AdapterEventType as EventType } from './event_types';


export interface AdapterEvent {
  type: string,
  node: Node,
}

// TSFIXME(bertrandk): This would be much nicer if we could actually extend
// 'Subject'.
 export  class BaseAdapter {
   private _stream: Subject<any> = new Subject();

   subscribe(next?: Function, err?: Function, done?: Function): void {
     this._stream.subscribe.call(this._stream, next, err, done);
   }

   addRoot(rootEl: Element): void {
     const rootEvt: AdapterEvent = {
       type: EventType.ROOT,
       node: rootEl,
     };

     this._stream.onNext(rootEvt);
   }

   addChild(childEl: Element): void {
     const childEvt: AdapterEvent = {
       type: EventType.ADD,
       node: childEl,
     };

     this._stream.onNext(childEvt);
   }

   changeComponent(el: Element): void {
     const childEvt: AdapterEvent = {
       type: EventType.CHANGE,
       node: el,
     };

     this._stream.onNext(childEvt);
   }

   removeComponent(el: Element): void {
     const childEvt: AdapterEvent = {
       type: EventType.REMOVE,
       node: el,
     };

     this._stream.onNext(childEvt);
   }

   // TODO(bertrandk): Make below functions abstract.
   setup(): void {
     throw new Error('Not yet implemented.');
   }

   traverseTree(): void {
     throw new Error('Not yet implemented.');
   }

   cleanup(): void {
     throw new Error('Not yet implemented.');
   }
}