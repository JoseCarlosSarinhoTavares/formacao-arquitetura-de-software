export function validateName(name: string) {
    if (!name) return false;
    return !! name.match(/\p{L}+ \p{L}+/u);
}