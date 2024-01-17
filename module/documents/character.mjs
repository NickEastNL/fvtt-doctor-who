import { StatListDialog } from '../applications/_module.mjs';
import { SYSTEM } from '../config.mjs';

export default class CharacterActor extends Actor {
	distinctions = this.distinctions;

	gadgets = this.gadgets;

	get skills() {
		return this.system.skills;
	}

	prepareEmbeddedDocuments() {
		super.prepareEmbeddedDocuments();
		const items = this.itemTypes;

		this.distinctions = items.distinction;
		this.gadgets = items.gadget;
	}

	prepareDerivedData() {
		this.storyPoints = this._prepareStoryPoints();
	}

	_prepareStoryPoints() {
		const points = this.system.storyPoints;
		const distinctionCost =
			this.distinctions.length * SYSTEM.STORY_POINTS.DISTINCTION_COST;

		let gadgetCost = 0;
		this.gadgets.forEach((g) => {
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

	async transferAttrPoints(transfer = true) {
		this.update({ 'system.transferPoints': transfer });
	}

	async editCondition(action = 'add', idx = 0) {
		const conditions = this.system.conditions;
		await this.#editStatItem(conditions, 'Condition', action, idx);
		this.update({ 'system.conditions': conditions });
	}

	async #editStatItem(items, type = '', action = 'add', idx = 0) {
		if (action === 'remove') {
			items.splice(idx, 1);
		} else {
			const options = {
				name: this.name,
				type,
				action,
				value: action === 'edit' ? items[idx] : '',
			};

			const response = await StatListDialog.prompt({
				title: options.name,
				options,
			});

			if (action === 'edit') {
				if (response?.value) items[idx] = response.value;
			} else {
				if (response?.value) items.push(response.value);
			}
		}
	}
}
