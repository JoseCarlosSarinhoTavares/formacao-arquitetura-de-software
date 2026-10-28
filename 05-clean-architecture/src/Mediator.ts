export default class Mediator {
    handlers: { event: string, callback: Function }[] = [];

    Register(event: string, callback: Function): void {
        this.handlers.push({ event, callback });
    }

    async NotifyAll(event: string, data: any) {
        for (const handler of this.handlers) {
            if (handler.event === event) {
                await handler.callback(data);
            }
        }
    }
}