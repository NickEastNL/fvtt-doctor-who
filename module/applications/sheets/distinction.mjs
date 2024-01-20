export default class DistinctionSheet extends ItemSheet {
	static get defaultOptions() {
		return Object.assign(super.defaultOptions, {
			width: 500,
			height: 300,
			classes: [SYSTEM.id, 'sheet', 'item', 'distinction'],
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
		const data = super.getData(options);
		const item = this.object.toObject();

		data.description = item.system.description;
		data.options = item.system.options;
		data.isGM = game.user.isGM;

		return data;
	}
}
