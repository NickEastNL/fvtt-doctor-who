export default class ModifierConfig extends Dialog {
	constructor(distinction, dialogData = {}, options = {}) {
		super(dialogData, options);

		this.distinction = distinction;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 300,
			height: 'auto',
			classes: [SYSTEM.id, 'sheet', 'dialog', 'modifier'],
			template: `systems/${SYSTEM.id}/templates/config/modifier-selection.hbs`,
			title: 'DIALOGS.ModifierConfigTitle',
		});
	}

	getData() {
		const context = {
			types: {},
		};

		for (const [name, modifier] of Object.entries(SYSTEM.DISTINCTION_MODIFIERS)) {
			context.types[name] = {
				label: modifier.label,
			};
		}

		return context;
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.on('change', 'input', () => {
			const submit = this.element[0].querySelector('button[data-button="submit"]');
			submit.disabled = !this.element[0].querySelector('input[name="type"]:checked');
		});
	}

	static async createDialog(distinction, { rejectClose = false, options = {} } = {}) {
		return new Promise((resolve, reject) => {
			const dialog = new this(
				distinction,
				{
					title: `${game.i18n.localize('DIALOGS.ModifierConfigTitle')}: ${
						distinction.item.name
					}`,
					buttons: {
						submit: {
							callback: (html) => {
								const formData = new FormDataExtended(html.querySelector('form'));
								const type = formData.get('type');
								resolve(distinction.editModifier('add', type));
							},
						},
					},
					close: () => {
						if (rejectClose) reject('No modifier type was selected');
						resolve(null);
					},
				},
				foundry.utils.mergeObject(options, { jQuery: false })
			);
			dialog.render(true);
		});
	}
}
