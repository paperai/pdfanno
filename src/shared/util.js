/**
 * Utility.
 */

export function anyOf(target, candidates) {
    return candidates.filter(c => c === target).length > 0;
}
