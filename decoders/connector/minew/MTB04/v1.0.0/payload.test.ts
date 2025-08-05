describe("Shall not be parsed", () => {
    beforeEach(() => {
        payload = [{ variable: "shallnotpass", value: "04096113950292"}];
        (globalThis as any).payload = payload;
    });
    
    test("Output Result", () => {
        eval(transpiled);
        expect(Array.isArray(payload)).toBe(true);
    });
    
    test("Not parsed Result", () => {
        expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
    });
});