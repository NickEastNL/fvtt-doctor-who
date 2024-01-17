export default class StatListDialog extends Dialog {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: `systems/${SYSTEM.id}/templates/dialogs/stat-list-dialog.hbs`,
			classes: ['doctor-who', 'sheet', 'dialog'],
			submitOnChange: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		const name = this.options.name;
		const action = this.options.action;
		let type = '';

		if (action === 'add') {
			type = game.i18n.format(`DIALOGS.Add${this.options.type}`);
		} else {
			type = game.i18n.format(`DIALOGS.Edit${this.options.type}`);
		}

		if (this.options.type === 'Specialisations')
			return `[${name}] ${type} (${this.options.skill})`;

		return `[${name}] ${type}`;
	}

	async getData() {
		const action = this.options.action;
		let type = '';

		if (action === 'add') {
			type = game.i18n.format(`DIALOGS.Add${this.options.type}`);
		} else {
			type = game.i18n.format(`DIALOGS.Edit${this.options.type}`);
		}

		return {
			type,
			tooltip: this.options.tooltip,
			value: this.options.value,
		};
	}

	static async prompt(config = {}) {
		config.callback = this.prototype._onSubmit;
		config.options.jQuery = false;
		config.rejectClose = false;
		return super.prompt(config);
	}

	_onSubmit(html) {
		const form = html.querySelector('form');
		const fd = new FormDataExtended(form);

		return fd.object;
	}
}
