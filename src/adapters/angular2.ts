/// <reference path="../../typings/rx/rx.d.ts"/>
import { AdapterEvent } from './events';
import { Observable, Subject } from 'rx';

console.log('---<', AdapterEvent);

export const component = new Subject();
export const state = new Subject();

