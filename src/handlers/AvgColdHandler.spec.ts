import AvgColdHandler from './AvgColdHandler';
import { EventEmitter } from 'events';

describe('AvgColdHandler', () => {
    let handler: AvgColdHandler;
    let bot: any;

    beforeEach(() => {
        bot = {};
        bot.client = new EventEmitter();
        bot.client.user = {};
        bot.client.user.id = '12345';
        handler = new AvgColdHandler(bot);
    })

    it('should return true on register', () => {
        expect(handler.register()).toBe(true);
    })

    it('should return false on register the second time it\'s called', () => {
        expect(handler.register()).toBe(true);
        expect(handler.register()).toBe(false);
    })

    it('should return false on deregister if register isn\'t called first', () => {
        expect(handler.deregister()).toBe(false);
    })

    it('should return true on deregister if register is called first', () => {
        expect(handler.register()).toBe(true);
        expect(handler.deregister()).toBe(true);
    })

    it('should attempt to fetch full message upon receiving a partial', () => {
        const msg: any = {};
        msg.partial = true;
        msg.author = {};
        msg.channel = {};
        msg.mentions = {};
        msg.mentions.has = jest.fn();
        msg.channel.send = jest.fn(async () => Promise.resolve());
        msg.fetch = jest.fn(async () => Promise.resolve());

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.fetch).toHaveBeenCalled();
    })

    it('should catch an error if fetch fails', () => {
        const msg: any = {};
        msg.partial = true;
        msg.author = {};
        msg.fetch = jest.fn(async () => Promise.reject(false));

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.fetch).rejects.not.toThrowError();
    });

    it('should do nothing if the message is from the bot', () => {
        const msg: any = {};
        msg.author = {};
        msg.author.id = '12345';
        msg.channel = {};
        msg.mentions = {};
        msg.mentions.has = jest.fn();
        msg.channel.send = jest.fn(async () => Promise.resolve());

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.channel.send).not.toHaveBeenCalled();
    })

    it('should do nothing if the message isn\'t from the bot, doesn\'t mention the bot, and doesn\'t match the regex', () => {
        const msg: any = {};
        msg.author = {};
        msg.content = 'something';
        msg.channel = {};
        msg.mentions = {};
        msg.mentions.has = jest.fn();
        msg.channel.send = jest.fn(async () => Promise.resolve());

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.channel.send).not.toHaveBeenCalled();
    });

    it('should send a message if the message mentions the bot', () => {
        const msg: any = {};
        msg.author = {};
        msg.content = 'something';
        msg.channel = {};
        msg.mentions = {};
        msg.channel.send = jest.fn(async () => Promise.resolve());
        msg.mentions.has = jest.fn(e => e.id === '12345');

        handler.register();
        bot.client.emit('message', msg);

        expect(msg.channel.send).toHaveBeenCalledWith('<:avgcold:962151999971950622>');
    });

    it('should send a message if the message matches the regex', () => {
        const msg: any = {};
        msg.author = {};
        msg.content = 'avgcold';
        msg.channel = {};
        msg.mentions = {};
        msg.channel.send = jest.fn(async () => Promise.resolve());
        msg.mentions.has = jest.fn();

        handler.register();

        for (const content of ['avgcold', 'avg cold', 'avg.cold', 'Avgcold']) {
            msg.content = content;
            bot.client.emit('message', msg);
            expect(msg.channel.send).toHaveBeenCalledWith('<:avgcold:962151999971950622>');
        }
    });

    it('should catch an error if send fails', () => {
        const msg: any = {};
        msg.author = {};
        msg.content = 'avgcold';
        msg.channel = {};
        msg.mentions = {};
        msg.channel.send = jest.fn(async () => Promise.reject(false));
        msg.mentions.has = jest.fn();

        handler.register();

        bot.client.emit('message', msg);

        expect(msg.channel.send).rejects.not.toThrowError();
    });
})
