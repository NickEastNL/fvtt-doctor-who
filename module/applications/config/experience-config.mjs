export default class ExperienceConfig extends FormApplication {
	constructor(actor, options) {
		super(actor, options);
		this.actor = actor;
		this.actor.apps[this.appId] = this;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 500,
			height: 500,
			classes: [SYSTEM.id, 'sheet', 'experience'],
			template: `systems/${SYSTEM.id}/templates/config/experience-config.hbs`,
			resizable: false,
			submitOnChange: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		return game.i18n.format('DIALOGS.ConfigExperienceTitle', { actor: this.actor.name });
	}

	getData() {
		const data = foundry.utils.deepClone(this.actor.system.experience);
		const potentialXp = this.actor.system.derivedPoints.potentialXp;
		const availableXp = this.actor.system.derivedPoints.availableXp;

		let unspent = [];
		let spent = [];
		data.entries.forEach((ex) => {
			if (!ex.hasSpent) unspent.push(ex);
			else spent.push(ex);
		});

		const result = {
			isLocked: this.actor.system.isLocked,
			potentialXp,
			availableXp,
			xpSpent: data.xpSpent,
			unspent,
			spent,
		};

		if (availableXp > data.xpSpent) result.canIncrease = true;
		if (data.xpSpent > 0) result.canDecrease = true;

		return result;
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find('[data-action]').click((event) => {
			event.preventDefault();
			const b = event.currentTarget;

			switch (b.dataset.action) {
				case 'spendExperience': {
					const index = b.closest('.experience').dataset.index;
					return this.actor.editExperience('spend', index);
				}
				case 'editExperience': {
					const index = b.closest('.experience').dataset.index;
					return this.actor.editExperience('edit', index);
				}
				case 'deleteExperience': {
					const index = b.closest('.experience').dataset.index;
					return this.actor.editExperience('delete', index);
				}
				case 'spendXp':
					return this.actor.spendXp(1);
				case 'refundXp':
					return this.actor.spendXp(-1);
			}
		});
	}
}
