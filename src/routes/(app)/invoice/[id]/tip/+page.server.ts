import invoice from "$lib/invoice";
import getRates from "$lib/rates";
import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
	const rates = await getRates();
	const { invoice, user } = await parent();
	if (!invoice.amount) redirect(307, `/invoice/${invoice.id}`);

	const rate = rates[user.currency];
	const invoiceRate = rates[invoice.currency];
	return { rate, invoiceRate };
}

export const actions = {
	default: invoice,
};
