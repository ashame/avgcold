interface BotOptions {
    [key: string]: unknown;
};

export const defaults: BotOptions = Object.freeze({
    avgcold: '<:avgcold:962151999971950622>',
    desuId: '712532570486865931',
});

export default BotOptions;