import { get, auth } from "$lib/utils";
import { json } from "@sveltejs/kit";

export async function GET({ cookies, params }) {
	const parts = params.page.split("/");

	let start;
	let end;
	if (parts.length === 1) [start] = parts;
	if (parts.length === 2) [start, end] = parts;

	if (!start) start = Date.now() / 1000 - 24 * 60 * 60;

	let url = `/payments?start=${start * 1000}`;
	if (end) url += `&end=${end * 1000}`;

	const { payments } = await get(url, auth(cookies));
	return json({ payments });
}
