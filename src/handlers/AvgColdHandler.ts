import { ClientUser, Message } from 'discord.js';
import { error, verbose as log } from 'npmlog';
import Handler from './Handler';

const regex = /.*avg.?cold.*/gi;

class AvgColdHandler extends Handler {
    handler = async (msg: Message) => {
        if (msg.partial)
            try {
                await msg.fetch();
            } catch (e) {
                error('avg-cold-handler', 'failed to fetch message ' + e);
                return;
            }
        if (msg.author.id == (this.bot.client.user as ClientUser).id) return;
        if (msg.mentions.has(this.bot.client.user as ClientUser)
            || regex.exec(msg.content)) {
            log('avg-cold-handler', `avg cold tbh... [${msg.content}]`);
            msg.channel.send("<:avgcold:962151999971950622>").catch((e) => {
                error('avg-cold-handler', 'failed to send message ' + e);
            })
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
        return (this.registered = false) == false;
    }

}

export default AvgColdHandler;