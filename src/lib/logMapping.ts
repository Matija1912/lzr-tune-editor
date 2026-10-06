/**
 * Linearly interpolate `value` into a (possibly non-monotonic, but typically monotonic) axis.
 * Returns a fractional index in [0, axis.length - 1], clamped. Null if axis empty or no bracket found.
 */
export function fractionalIndex(axis: number[], value: number): number | null {
    if (axis.length === 0) return null;
    if (axis.length === 1) return 0;
    const ascending = axis[axis.length - 1] >= axis[0];
    if (ascending) {
        if (value <= axis[0]) return 0;
        if (value >= axis[axis.length - 1]) return axis.length - 1;
    } else {
        if (value >= axis[0]) return 0;
        if (value <= axis[axis.length - 1]) return axis.length - 1;
    }
    for (let i = 0; i < axis.length - 1; i++) {
        const a = axis[i];
        const b = axis[i + 1];
        const lo = Math.min(a, b);
        const hi = Math.max(a, b);
        if (value >= lo && value <= hi) {
            if (a === b) return i;
            return i + (value - a) / (b - a);
        }
    }
    return null;
}
