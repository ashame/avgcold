import { Client, Intents } from 'discord.js';
import fs from 'fs';
import { join } from 'path';
import EventEmitter from 'events';
import { verbose as log, error, info, warn } from 'npmlog';
import Handler from './handlers/Handler';
import BotOptions, { defaults as DEFAULT_CONFIG } from './BotOptions';

interface Events {
    ready: () => void;
}

declare interface Bot {
    on<U extends keyof Events>(event: U, listener: Events[U]): this;
    once<U extends keyof Events>(event: U, listener: Events[U]): this;
    emit<U extends keyof Events>(event: U, ...args: Parameters<Events[U]>): boolean;
}

class Bot extends EventEmitter {
    private _initStage = 1;
    private loggedIn = false;
    private readonly handlers: Handler[];
    private readonly token: string;
    readonly config: BotOptions;
    readonly client: Client;

    constructor(token: string, options?: BotOptions) {
        super();
        this.client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            ],
            partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER'],
        });
        this.handlers = [];
        this.client.once('ready', this.initialize);

        this.token = token;
        this.config = Object.assign({}, DEFAULT_CONFIG, options);
        log('bot', `${options ? 'Custom' : 'Default'} config options loaded`);

        process.on('SIGINT', this.destructor);
        process.on('exit', this.destructor);
    }

    destructor = () => {
        let handler;
        while ((handler = this.handlers.pop())) {
            if (handler.deregister())
                log('bot', `deregistered handler ${handler.constructor.name}`);
            else
                log('bot', `failed to deregister handler ${handler.constructor.name}`);
        }
        process.off('SIGINT', this.destructor);
        process.off('exit', this.destructor);
        process.exit(0);
    };

    loadHandlers = async () => {
        const handlerFiles = fs
            .readdirSync(join(__dirname, './handlers'))
            .filter(f => (f.endsWith('.js') || f.endsWith('.ts')) && !f.startsWith('Handler') && !f.includes('.spec.') && !f.includes('.test.'));
        log('bot', `attempting to load ${handlerFiles.length} handlers`);

        for (const fileName of handlerFiles) {
            try {
                const handlerClass = await import(join(__dirname, `./handlers/${fileName}`));
                const handler = new handlerClass.default(this);
                if (handler instanceof Handler && handler.register()) {
                    this.handlers.push(handler);
                    log('bot', `loaded handler ${handler.constructor.name}`);
                }
            } catch (err) {
                error('bot', `error loading handler for file ${fileName}: ${err}`);
            }
        }
        log('bot', `loaded ${this.handlers.length} handlers`);
        info('bot', `loaded handlers: ${this.handlers.map(h => h.constructor.name).join(', ')}`);
    };

    initialize = async () => {
        if (--this._initStage > 0) return;
        if (this._initStage < 0) {
            warn('bot', `initialization stage mismatch - current: ${this._initStage}, expected: >= 0`);
            return;
        }
        try {
            await this.loadHandlers();
            this.emit('ready');
        } catch (e) {
            error('bot', `error initializing bot: ${e}`);
            process.exit(1);
        }
    };

    login = async () => {
        if (this.loggedIn) return true;
        try {
            await this.client.login(this.token);
        } catch {
            return false;
        }
        return (this.loggedIn = true);
    };
}

export default Bot;