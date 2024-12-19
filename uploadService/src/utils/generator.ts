const MAX_LEN = 50;

export function generate() {
	const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
	const length = MAX_LEN;
	let id = "";
	for (let i = 0; i < length; i++) {
		id += subset[Math.floor(Math.random() * subset.length)];
	}
	return id;
}