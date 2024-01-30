export default class SkillConfig extends FormApplication {
	constructor(actor, skillId, options) {
		super(actor, options);
		this.actor = actor;
		this.skillId = skillId;
		this.config = SYSTEM.SKILLS[skillId];
		this.actor.apps[this.appId] = this;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 350,
			height: 300,
			classes: [SYSTEM.id, 'sheet', 'skill'],
			template: `systems/${SYSTEM.id}/templates/config/skill-config.hbs`,
			resizable: false,
			submitOnChange: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		return game.i18n.format('DIALOGS.EditSkillTitle', {
			actor: this.actor.name,
			skill: this.config.label,
		});
	}

	getData() {
		const isLocked = this.actor.system.isLocked;
		const skill = this.actor.system.skills[this.skillId];
		const data = {
			skill,
			isLocked,
			hasMinimumScore: skill.base >= 3,
			config: this.config,
		};

		data.canAddSpecs = !isLocked && data.hasMinimumScore;

		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find('[data-action]').click((event) => {
			event.preventDefault();
			const b = event.currentTarget;
			switch (b.dataset.action) {
				case 'addSpecialisation':
					return this.#editSpecialisation();
				case 'editSpecialisation': {
					const index = b.closest('.specialisation').dataset.index;
					return this.#editSpecialisation('edit', index);
				}
				case 'deleteSpecialisation': {
					const index = b.closest('.specialisation').dataset.index;
					return this.#editSpecialisation('delete', index);
				}
			}
		});
	}

	async #editSpecialisation(action = 'add', idx = 0) {
		const skill = this.actor.skills[this.skillId];
		const specialisations = foundry.utils.deepClone(skill.specialisations);

		if (action === 'delete') {
			specialisations.splice(idx, 1);
		} else {
			let title = '';

			if (action === 'add') {
				title = game.i18n.format('DIALOGS.AddSpecialisation');
			} else {
				title = game.i18n.format('DIALOGS.EditSpecialisation');
			}

			const html = await renderTemplate(
				`systems/${SYSTEM.id}/templates/dialogs/edit-entry-dialog.hbs`,
				{
					title,
					value: action === 'edit' ? specialisations[idx] : '',
				}
			);

			const response = await Dialog.prompt({
				title: `[${this.name}] ${title}`,
				content: html,
				label: 'Confirm',
				rejectClose: false,
				callback: (html) => {
					const form = html[0].querySelector('form');
					const fd = new FormDataExtended(form);

					return fd.object.value;
				},
				options: {
					classes: ['doctor-who', 'sheet', 'dialog'],
				},
			});

			if (action === 'edit') {
				if (response) specialisations[idx] = response;
			} else {
				if (response) specialisations.push(response);
			}
		}

		this.actor.update({
			[`system.skills.${this.skillId}.specialisations`]: specialisations,
		});
	}
}
