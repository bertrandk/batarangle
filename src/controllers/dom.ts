/**
 * DOM Controller
 *
 * A controller runs within the application context and mediates between the
 * framework adapter and the developer tools.
 *
 * First, it is charged with setting up the backend. It does so by detecting
 * and instantiating the appropriate adapter given the version of the framework
 * on the page. Once done, it listens to events from the adapter and the
 * developer tools (front end) and mediates communication between the two.
 *
 * Communications occur over the channels.
 *
 * The DOM controller manages the backend mediation for the browser DOM.
 */
import { AdapterEventType as EventType } from '../adapters/event_types';
import { AdapterEvent } from '../adapters/base';
import { Angular2Adapter } from '../adapters/angular2';
import { BaseController } from './base';


export class DomController extends BaseController {
  private adapter: any;
  private channel: any;
  private model: Array<any>;

  static detectFramework(): Angular2Adapter {
    return new Angular2Adapter;
  }

  static detectChannel(): any {
    return null;
  }

  constructor(adapter: any, channel: any) {
    super();

    this.adapter = adapter;
    this.channel = channel;
  }

  hookIntoBackend(): void {
    this.adapter.subscribe((e: AdapterEvent) => {
      this._onViewChange(e, this.channel);
    });
  }

  _onViewChange(evt: AdapterEvent, ch?: any): void {
    switch(evt.type) {
      case EventType.ROOT:
        this._handleRootAdd(evt.node);
        break;
      case EventType.ADD:
        this._handleChildAdd(evt.node);
        break;
      case EventType.CHANGE:
        this._handleComponentChanges(evt.node);
        break
      case EventType.REMOVE:
        this._handleRemovals(evt.node);
        break;
      default:
        throw Error('Unknown adapter event.');
    }

    if (ch) {
      ch.sendMessage({ type: 'model_change', payload: this.model});
    }
  }

  _handleRootAdd(node: Node) {
    const rootNode = this.adapter.serializeComponent(node);

    this.model.push(rootNode);
  }

  _handleChildAdd(node: Node) {
    const childNode = this.adapter.serializeComponent(node);
    const idxParts = childNode.id.split('.');
    const rootIdx = idxParts[0];
    const childIdx = idxParts[1];

    this.model[rootIdx].children = this.model[rootIdx].children || [];
    this.model[rootIdx].children[childIdx] = childNode;
  }

  _handleComponentChanges(node: Node) {
    const componentNode = this.adapter.serializeComponent(node);
    const idxParts = componentNode.id.split('.');
    const rootIdx = idxParts[0];
    const childIdx = idxParts[1];

    if (!childIdx) {
      const oldChildren = this.model[rootIdx].children || [];

      this.model[rootIdx] = componentNode;
      this.model[rootIdx].children = oldChildren;

      return;
    }

    this.model[rootIdx].children = this.model[rootIdx].children || [];
    const oldChildren = this.model[rootIdx].children || [];

    this.model[rootIdx].children[childIdx] = componentNode;
    this.model[rootIdx].children[childIdx].children = oldChildren;
  }

  _handleRemovals(node: Node) {
    const componentNode = this.adapter.serializeComponent(node);
    const idxParts = componentNode.id.split('.');
    const rootIdx = idxParts[0];
    const childIdx = idxParts[1];

    if (!childIdx) {
      this.model.splice(rootIdx, 1);
    }

    this.model[rootIdx].childrens.splice(childIdx, 1);
  }
}