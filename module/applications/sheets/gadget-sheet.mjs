import { EmbeddedObjectConfig } from '../_module.mjs';

export default class GadgetSheet extends ItemSheet {
	static get defaultOptions() {
		return Object.assign(super.defaultOptions, {
			width: 500,
			height: 400,
			classes: [SYSTEM.id, 'sheet', 'item', 'gadget'],
			template: `systems/${SYSTEM.id}/templates/sheets/gadget-sheet.hbs`,
			resizable: false,
		});
	}

	async getData(options = {}) {
		const data = super.getData(options);
		const item = this.item;

		data.item = item;
		data.description = item.system.description;
		data.storyPoints = this.#formatStoryPoints();
		data.distinctions = item.system.distinctions;

		return data;
	}

	#formatStoryPoints() {
		const storyPoints = this.item.system.storyPoints;
		const points = {
			points: storyPoints,
		};

		if (points.points > 0) points.canDecrease = true;

		return points;
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find('[data-action]').click((event) => {
			event.preventDefault();
			const b = event.currentTarget;
			switch (b.dataset.action) {
				// Adjust Story Points
				case 'storyPointsIncrease':
					return this.#updateStoryPoints(1);
				case 'storyPointsDecrease':
					return this.#updateStoryPoints(-1);

				// Modify Distinctions
				case 'addDistinction':
					return this.#editDistinction();
				case 'editDistinction': {
					const index = b.closest('.distinction').dataset.index;
					return this.#editDistinction('edit', index);
				}
				case 'deleteDistinction': {
					const index = b.closest('.distinction').dataset.index;
					return this.#editDistinction('delete', index);
				}
			}
		});
	}

	async #updateStoryPoints(delta = 1) {
		delta = Math.sign(delta);
		const p = this.item.system.storyPoints;

		if (!delta) return;
		this.item.update({ 'system.storyPoints': p + delta });
	}

	async #editDistinction(action = 'add', idx = 0) {
		const distinctions = foundry.utils.deepClone(this.item.system.distinctions);
		const newDistinction = {
			name: 'New Distinction',
			description: '',
		};

		switch (action) {
			case 'add': {
				const newLength = distinctions.push(newDistinction);
				this.#showDistinctionConfig(newDistinction, newLength - 1);
				break;
			}
			case 'edit': {
				const distinction = distinctions[idx];
				return this.#showDistinctionConfig(distinction, idx);
			}
			case 'delete': {
				const response = await Dialog.confirm({
					title: 'Delete Distinction',
					content:
						'<p>Are You Sure?</p><p>This Distinction will be permanently deleted and cannot be recovered.</p>',
					defaultYes: false,
					yes: () => {},
					options: {
						classes: [SYSTEM.id, 'sheet', 'dialog'],
					},
				});

				if (response) {
					distinctions.splice(idx, 1);
					break;
				} else {
					return;
				}
			}
		}

		this.item.update({
			'system.distinctions': distinctions,
			'system.storyPoints': distinctions.length,
		});
	}

	async #showDistinctionConfig(distinction, idx) {
		const sheetData = {
			sheet: this,
			parent: this.item,
			type: 'distinction',
			collection: 'distinctions',
			objectId: idx,
			object: distinction,
		};
		const sheet = new EmbeddedObjectConfig(sheetData);
		sheet.render(true);
	}
}
