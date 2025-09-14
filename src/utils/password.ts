import argon2 from 'argon2';

async function checkPassword(password: string, hash: string | null) {
	if (!hash)
		return false;
	return argon2.verify(hash, password);
}
async function hashPassword(password: string) {
	return argon2.hash(password);
}

export { checkPassword, hashPassword }
