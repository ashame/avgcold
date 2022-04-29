import { Message } from 'discord.js';
import { error } from 'npmlog';
import Handler from './Handler';

const regex = /.*avg.?cold.*/gi;

class AvgColdHandler extends Handler {
    handler = async (msg: Message) => {
        if (msg.partial)
            try {
                await msg.fetch();
            } catch (e) {
                error('avg-cold-handler', 'failed to fetch message', e);
            }
        if (msg.author.id != this.bot.client.user?.id && msg.mentions.has(this.bot.client.user ?? '') || regex.exec(msg.content)) {
            try {
                await msg.channel.send("<:avgcold:962151999971950622>");
            } catch (e) {
                error('avg-cold-handler', 'failed to send message', e);
            }
        }
    };

    register = (): boolean => {
        if (this.registered) return false;
        this.bot.client.on('message', this.handler);
        return (this.registered = true);
    }
    deregister = (): boolean => {
        if (!this.registered) return false;
        this.bot.client.off('message', this.handler);
        return (this.registered = false);
    }

}

export default AvgColdHandler;