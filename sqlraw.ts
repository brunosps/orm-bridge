export class RawSQL {
  rawSQL(): string {
    throw Error('Not Implemented');
  }

  static getSQL(): string {
    const instance = new this();
    return instance.rawSQL().replace(/[\r\n\t]/gm, '');
  }
}
