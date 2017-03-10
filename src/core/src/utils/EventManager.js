import EventEmitter from 'events';

/**
 * The Wrapper of EventEmitter.
 */
export default class PdfannoEventEmitter extends EventEmitter {

    constructor() {
        this.eventEmitter = new EventEmitter();
        this.listenerMap  = new Map();
    }

}
