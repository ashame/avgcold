import DesuRatHandler from './DesuRatHandler';
import { EventEmitter } from 'events';

describe('DesuRatHandler', () => {
    let handler: DesuRatHandler;
    let bot: any;

    beforeEach(() => {
        bot = {};
        bot.client = new EventEmitter();
        bot.config = {
            desuId: '712532570486865931'
        };
        handler = new DesuRatHandler(bot);
    });

    it('should return true on register', () => {
        expect(handler.register()).toBe(true);
    });

    it('should return false on register the second time it\'s called', () => {
        expect(handler.register()).toBe(true);
        expect(handler.register()).toBe(false);
    });

    it('should return false on deregister if register isn\'t called first', () => {
        expect(handler.deregister()).toBe(false);
    });

    it('should return true on deregister if register is called first', () => {
        expect(handler.register()).toBe(true);
        expect(handler.deregister()).toBe(true);
    });

    it('should attempt to fetch full message upon receiving a partial', () => {
        const msg: any = {};
        msg.partial = true;
        msg.author = {};
        msg.fetch = jest.fn(async () => Promise.resolve());

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.fetch).toHaveBeenCalled();
    });

    it('should catch an error if fetch fails', () => {
        const msg: any = {};
        msg.partial = true;
        msg.author = {};
        msg.fetch = jest.fn(async () => Promise.reject(false));

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.fetch).rejects.not.toThrowError();
    });

    it('should do nothing if the emitted message\'s author ID doesn\'t match Desu\'s', () => {
        const msg: any = {};
        msg.author = {};
        msg.react = jest.fn();

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.react).not.toBeCalled();
    });

    it('should react to the message if the emitted message\'s author ID matches Desu\'s', () => {
        const msg: any = {};
        msg.author = {};
        msg.author.id = '712532570486865931';
        msg.content = 'desu is a rat';
        msg.react = jest.fn(() => new Promise(resolve => resolve(true)));
        Math.random = jest.fn().mockReturnValue(0.1);
        console.log({ __dirname });

        handler.register();
        bot.client.emit('message', msg);
        expect(msg.react).toBeCalledWith('🐀');
    });

    it('should catch an error if the message\'s react fails', () => {
        const msg: any = {};
        msg.author = {};
        msg.author.id = '712532570486865931';
        msg.content = 'desu is a rat';
        msg.react = jest.fn(() => new Promise((_resolve, reject) => reject(false)));

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.react).rejects.not.toThrowError();
    });
});