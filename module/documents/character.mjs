import { SYSTEM } from '../config.mjs';

export default class CharacterDW extends Actor {
	static getDefaultArtwork(actorData) {
		let icon = `systems/${SYSTEM.id}/icons/${actorData.type}.svg`;
		return { img: icon };
	}

	prepareEmbeddedDocuments() {
		super.prepareEmbeddedDocuments();
		const items = this.itemTypes;

		this.distinctions = items.distinction;
		this.equipment = {
			gadgets: items.gadget,
			weapons: items.weapon,
		};
	}

	prepareDerivedData() {
		this.storyPoints = this._prepareStoryPoints();
		this.equipment.equipment = this.system.equipment;
	}

	_prepareStoryPoints() {
		const points = this.system.storyPoints;
		const distinctionCost =
			this.distinctions.length * SYSTEM.STORY_POINTS.DISTINCTION_COST;

		let gadgetCost = 0;
		this.equipment.gadgets.forEach((g) => {
			gadgetCost = g.system.distinctions.length;
		});

		const totalCost = distinctionCost + gadgetCost;

		return {
			points,
			base: SYSTEM.STORY_POINTS.BASE - totalCost,
		};
	}

	async updateStoryPoints(delta = 1) {
		delta = Math.sign(delta);
		const p = this.system.storyPoints;

		if (!delta) return;
		this.update({
			'system.storyPoints': p + delta,
		});
	}

	async updateAttribute(attribute, delta = 1, base = true) {
		delta = Math.sign(delta);
		const a = this.system.attributes[attribute];

		if (!a || !delta) return;

		// Check whether to update the base or current value
		if (base) {
			const newBase = a.base + delta;

			// If the current value is greater than the new base value
			// clamp the current value to the same
			if (a.current > newBase)
				this.update({
					[`system.attributes.${attribute}.current`]: newBase,
				});

			this.update({
				[`system.attributes.${attribute}.base`]: newBase,
			});
		} else {
			this.update({
				[`system.attributes.${attribute}.current`]: a.current + delta,
			});
		}
	}

	async updateSkill(skill, delta = 1) {
		delta = Math.sign(delta);
		const s = this.system.skills[skill];

		if (!s || !delta) return;

		this.update({
			[`system.skills.${skill}.base`]: s.base + delta,
		});
	}

	async editSpecialisations(skill) {
		let s = this.system.skills[skill].specialisations;

		const options = {
			name: this.name,
			type: 'Specialisations',
			action: 'edit',
			skill: SYSTEM.SKILLS[skill].label,
			tooltip: 'Separate each Specialisation by comma.',
			value: s.join(', '),
		};

		const response = await StatListDialog.prompt({
			title: options.name,
			options,
		});

		if (response?.value) s = response.value.split(',');
		else s = [];

		this.update({ [`system.skills.${skill}.specialisations`]: s });
	}

	async editExperience(action = 'add', idx = 0) {
		const experiences = foundry.utils.deepClone(this.system.experience.entries);

		switch (action) {
			case 'add':
			case 'edit': {
				let title = '';

				if (action === 'add') {
					title = game.i18n.format('DIALOGS.AddExperience');
				} else {
					title = game.i18n.format('DIALOGS.EditExperience');
				}

				const html = await renderTemplate(
					`systems/${SYSTEM.id}/templates/dialogs/edit-entry-dialog.hbs`,
					{
						title,
						value: action === 'edit' ? experiences[idx].label : '',
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
						classes: [SYSTEM.id, 'sheet', 'dialog'],
					},
				});

				if (action === 'edit') {
					if (response) experiences[idx].label = response;
				} else {
					if (response)
						experiences.push({
							label: response,
						});
				}
				break;
			}
			case 'delete':
				experiences.splice(idx, 1);
				break;
			case 'recall': {
				const hasRecalled = experiences[idx].hasRecalled;
				experiences[idx].hasRecalled = !hasRecalled;
				break;
			}
			case 'spend': {
				const hasSpent = experiences[idx].hasSpent;
				experiences[idx].hasSpent = !hasSpent;
				break;
			}
		}

		this.update({ 'system.experience.entries': experiences });
	}

	async spendXp(delta = 1) {
		delta = Math.sign(delta);
		const xp = this.system.experience.xpSpent;

		if (!delta) return;
		this.update({ 'system.experience.xpSpent': xp + delta });
	}

	async editCondition(action = 'add', idx = 0) {
		const conditions = foundry.utils.deepClone(this.system.conditions);

		if (action === 'delete') {
			conditions.splice(idx, 1);
		} else {
			let title = '';

			if (action === 'add') {
				title = game.i18n.format('DIALOGS.AddCondition');
			} else {
				title = game.i18n.format('DIALOGS.EditCondition');
			}

			const html = await renderTemplate(
				`systems/${SYSTEM.id}/templates/dialogs/edit-entry-dialog.hbs`,
				{
					title,
					value: action === 'edit' ? conditions[idx] : '',
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
					classes: [SYSTEM.id, 'sheet', 'dialog'],
				},
			});

			if (action === 'edit') {
				if (response) conditions[idx] = response;
			} else {
				if (response) conditions.push(response);
			}
		}

		this.update({ 'system.conditions': conditions });
	}
}
