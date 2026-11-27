export const apiNumber = new class ApiNumber {
    clamp(value, min, max) {
        return Math.max(Math.min(value, max), min);
    }
};
