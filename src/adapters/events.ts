// FIXME(bertrandk): There doesn't seem to be much better ways of creating
// string-based enums until https://github.com/Microsoft/TypeScript/issues/3192
enum Events {
  ROOT,
  ADD,
  CHANGE,
  REMOVE,
}

export class AdapterEvent {
  // FIXME(bertrandk): Not really private in JS but inaccesible in TypeScript at
  // least. Since it's not spec compliant to begin with (see section 8.2.1), we
  // could find another way.
  private static _get(key: string) {
    return Events[Events[key]];
  };

  static get ROOT() {
    return AdapterEvent._get('ROOT');
  };

  static get ADD() {
    return AdapterEvent._get('ADD');
  };

  static get CHANGE() {
    return AdapterEvent._get('CHANGE');
  };

  static get REMOVE() {
    return AdapterEvent._get('REMOVE');
  };
}

