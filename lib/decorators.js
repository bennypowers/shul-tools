export function observes(key) {
    return function (original, context) {
        context.addInitializer(function () {
            // @ts-expect-error: i know its wrong but i don't mind
            const { willUpdate } = this;
            this.willUpdate = async function (changed) {
                await willUpdate?.call(this, changed);
                if (changed.has(key))
                    original.call(this, changed.get(key));
            };
        });
        return () => void 0;
    };
}
//# sourceMappingURL=decorators.js.map