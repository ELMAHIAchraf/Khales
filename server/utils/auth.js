export function isValidDate(dateStr) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return false;
    if (date > new Date()) return false;
    return true;
}

export function generatePassword() {
    const length = Math.floor(Math.random() * 9) + 8;
    const specials = '!@#$%^&*()_+-=';
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const all = specials + lowers + uppers + numbers;
    let password = [
        specials[Math.floor(Math.random() * specials.length)],
        lowers[Math.floor(Math.random() * lowers.length)],
        uppers[Math.floor(Math.random() * uppers.length)],
        numbers[Math.floor(Math.random() * numbers.length)]
    ];
    for (let i = password.length; i < length; i++) {
        password.push(all[Math.floor(Math.random() * all.length)]);
    }
    password = password.sort(() => Math.random() - 0.5).join('');
    return password;
}

export function generateUsername(firstName, lastName, dateOfBirth, users) {
    const base = (
        (firstName[0] || '').toLowerCase() +
        (lastName[0] || '').toLowerCase() +
        dateOfBirth.replace(/\D/g, '').slice(0, 4)+dateOfBirth.replace(/\D/g, '').slice(6, 8)
    );
    let username = base;
    let suffix = 1;
    while (users.some(u => u.username === username)) {
        username = base + suffix;
        suffix++;
    }
    return username;
}

