const { Tokenizer, Value } = require('liquidjs');
module.exports = function (gettext) {
    return function () {
        this.registerTag('t', {
            parse: function (token, remainTokens) {
                const tokenizer = new Tokenizer(token.args, this.liquid.options.operatorsTrie);
                this.msgid = tokenizer.readValue().getText();
                this.remaining = tokenizer.remaining();
            },
            render: function * (ctx, emitter) {
                const msgid = this.liquid.evalValueSync(this.msgid, ctx);

                const msgstr = gettext.gettext(msgid);

                const v = new Value(JSON.stringify(msgstr) + this.remaining, this.liquid);
                const result = yield v.value(ctx, this.liquid.options.lenientIf);
                emitter.write(result);
            }
        });

        this.registerTag('tn', {
            parse: function (token, remainTokens) {
                const tokenizer = new Tokenizer(token.args, this.liquid.options.operatorsTrie);
                this.msgid = tokenizer.readValue().getText();
                this.msgid_plural = tokenizer.readValue().getText();
                this.count = tokenizer.readValue().getText();
                this.remaining = tokenizer.remaining();
            },
            render: function * (ctx, emitter) {
                const msgid = this.liquid.evalValueSync(this.msgid, ctx);
                const msgid_plural = this.liquid.evalValueSync(this.msgid_plural, ctx);
                const count = this.liquid.evalValueSync(this.count, ctx);

                const msgstr = gettext.ngettext(msgid, msgid_plural, count);

                const v = new Value(JSON.stringify(msgstr) + this.remaining, this.liquid);
                const result = yield v.value(ctx, this.liquid.options.lenientIf);
                emitter.write(result);
            }
        });
    };
};
