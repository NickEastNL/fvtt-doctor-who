// import { ModifierConfig } from '../_module.mjs';

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

		data.isGM = game.user.isGM;
		data.description = item.system.description;
		// data.modifiers = Object.values(item.system.modifiers).map((modifier) => {
		// 	return {
		// 		...modifier,
		// 		label: SYSTEM.DISTINCTION_MODIFIERS[modifier.id].label,
		// 		isNumber: modifier.type === 'number',
		// 	};
		// });

		return data;
	}

	// activateListeners(html) {
	// 	super.activateListeners(html);
	// 	html.find('[data-action]').click((event) => {
	// 		event.preventDefault();
	// 		const b = event.currentTarget;
	// 		switch (b.dataset.action) {
	// 			case 'addModifier':
	// 				return ModifierConfig.createDialog(this);
	// 			case 'deleteModifier': {
	// 				const index = b.closest('.modifier').dataset.index;
	// 				return this.editModifier('delete', null, index);
	// 			}
	// 		}
	// 	});

	// 	html.find('.modifier').find('input').change(this.#updateModifier.bind(this));
	// }

	// async editModifier(action = 'add', type = null, idx = null) {
	// 	const modifiers = foundry.utils.deepClone(this.item.system.modifiers);
	// 	const types = SYSTEM.DISTINCTION_MODIFIERS;

	// 	switch (action) {
	// 		case 'add': {
	// 			const modifier = types[type];

	// 			modifiers.push({
	// 				id: type,
	// 				type: modifier.type,
	// 			});
	// 			break;
	// 		}
	// 		case 'delete':
	// 			modifiers.splice(idx, 1);
	// 			break;
	// 	}

	// 	this.item.update({ 'system.modifiers': modifiers });
	// }

	// #updateModifier(event) {
	// 	event.preventDefault();
	// 	const input = event.currentTarget;
	// 	const modifiers = foundry.utils.deepClone(this.item.system.modifiers);

	// 	if (input.type === 'number') {
	// 		modifiers[input.name].value = input.valueAsNumber;
	// 	}

	// 	this.item.update({ 'system.modifiers': modifiers });
	// }
}
