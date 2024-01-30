// import { ModifierConfig } from '../_module.mjs';

export default class DistinctionSheet extends ItemSheet {
	static get defaultOptions() {
		return Object.assign(super.defaultOptions, {
			width: 500,
			height: 300,
			classes: [SYSTEM.id, 'sheet', 'item', 'distinction'],
			template: `systems/${SYSTEM.id}/templates/sheets/distinction-sheet.hbs`,
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

		data.isGM = game.user.isGM;
		data.description = item.system.description;

		return data;
	}
}
