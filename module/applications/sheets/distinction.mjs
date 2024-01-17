export default class DistinctionSheet extends ItemSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;

		return Object.assign(options, {
			width: 500,
			height: 300,
			classes: [SYSTEM.id, 'sheet', 'item', this.itemType],
			template: `systems/${SYSTEM.id}/templates/sheets/distinction.hbs`,
			tabs: [
				{
					navSelector: '.tabs',
					contentSelector: 'form',
					initial: 'description',
				},
			],
			resizable: false,
		});
	}

	async getData(options = {}) {
		const context = super.getData(options);
		const item = this.object.toObject();

		context.description = item.system.description;
		context.options = item.system.options;
		console.log(context);

		return context;
	}
}
