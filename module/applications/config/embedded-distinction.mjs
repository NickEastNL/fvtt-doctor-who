import EmbeddedObjectConfig from './embedded-object.mjs';
import { ModifierConfig } from '../_module.mjs';

export default class EmbeddedDistinctionConfig extends EmbeddedObjectConfig {
	constructor(data, options) {
		super(data, options);
		this.sheet = data.sheet;
		this.item = data.object;
	}

	getData(options) {
		const data = super.getData(options);

		data.isGM = game.user.isGM;
		data.modifiers = Object.values(this.object.modifiers).map((modifier) => {
			return {
				...modifier,
				label: SYSTEM.DISTINCTION_MODIFIERS[modifier.id].label,
				isNumber: modifier.type === 'number',
			};
		});

		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find('[data-action]').click((event) => {
			event.preventDefault();
			const b = event.currentTarget;
			switch (b.dataset.action) {
				case 'addModifier':
					return ModifierConfig.createDialog(this);
				case 'deleteModifier': {
					const index = b.closest('.modifier').dataset.index;
					return this.editModifier('delete', null, index);
				}
			}
		});

		html.find('.modifier').find('input').change(this.#updateModifier.bind(this));
	}

	async editModifier(action = 'add', type = null, idx = null) {
		const modifiers = this.object.modifiers;
		const types = SYSTEM.DISTINCTION_MODIFIERS;

		switch (action) {
			case 'add': {
				const modifier = types[type];

				modifiers.push({
					id: type,
					type: modifier.type,
					value: 0,
				});
				break;
			}
			case 'delete':
				modifiers.splice(idx, 1);
				break;
		}

		this.sheet.updateModifiers(this.objectId, modifiers);
	}

	#updateModifier(event) {
		event.preventDefault();
		const input = event.currentTarget;
		const modifiers = this.object.modifiers;

		if (input.type === 'number') {
			modifiers[input.name].value = input.valueAsNumber;
		}

		this.sheet.updateModifiers(this.objectId, modifiers);
	}
}
