export default class DistinctionsConfig extends FormApplication {
	constructor(actor, options) {
		super(actor, options);
		this.actor = actor;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 350,
			classes: ['doctor-who', 'sheet'],
			template: `systems/${SYSTEM.id}/templates/config/distinctions.hbs`,
			resizable: false,
			submitOnChange: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		return game.i18n.format('DIALOGS.SpecialDistinctionsTitle', {
			actor: this.object.name,
		});
	}

	async getData(options) {
		const context = {
			experienced: this.actor.distinctions.experienced,
		};

		return context;
	}

	async _updateObject(event, formData) {
		return this.actor.update(formData);
	}
}
