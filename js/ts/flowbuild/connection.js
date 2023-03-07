export class connection_t {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get id() {
        return this.from.id * 2 + this.to.id;
    }
}
//# sourceMappingURL=connection.js.map