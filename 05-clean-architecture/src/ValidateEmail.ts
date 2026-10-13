export function ValidateEmail(email: string) {
    if (!email) return false;
    return !!email.match(/.+@.+\..+/)
}