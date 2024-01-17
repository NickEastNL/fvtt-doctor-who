import { StatListDialog } from '../applications/_module.mjs';
import { SYSTEM } from '../config.mjs';

export default class CharacterActor extends Actor {
	storyPoints = this.storyPoints;

	attributes = this.attributes;

	distinctions = this.distinctions;

	gadgets = this.gadgets;

	prepareEmbeddedDocuments() {
		super.prepareEmbeddedDocuments();
		const items = this.itemTypes;

		this.distinctions = items.distinction;
		this.gadgets = items.gadget;
	}

	prepareDerivedData() {
		this.storyPoints = this._prepareStoryPoints();
		// this.attributes = this._prepareAttributes();
		// this.skills = this._prepareSkills();
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

	_prepareAttributes() {
		const defaultCap = SYSTEM.ATTRIBUTE_RULES.DEFAULT_CAP;
		const defaultPoints = SYSTEM.ATTRIBUTE_RULES.DEFAULT_POINTS;

		const expDistinctions = this.distinctions.reduce(
			(result, d) => {
				const options = d.system.options;
				return {
					modAttrPoints: result.modAttrPoints + options.modAttrPoints,
					modAttrCap: result.modAttrCap + options.modAttrCap,
				};
			},
			{
				modAttrPoints: 0,
				modAttrCap: 0,
			}
		);

		const values = Object.values(SYSTEM.ATTRIBUTES).map((cfg) => {
			const attribute = foundry.utils.deepClone(cfg);
			attribute.base = this.system.attributes[attribute.id].base;
			attribute.mod = attribute.base;
			attribute.current = this.system.attributes[attribute.id].current;
			return attribute;
		});

		return {
			maxPoints: defaultPoints + expDistinctions.modAttrPoints,
			cap: defaultCap + expDistinctions.modAttrCap,
			values,
		};
	}

	_prepareSkills() {
		const defaultCap = SYSTEM.SKILL_RULES.DEFAULT_CAP;
		const defaultPoints = SYSTEM.SKILL_RULES.DEFAULT_POINTS;

		const expDistinctions = this.distinctions.reduce(
			(result, d) => {
				const options = d.system.options;
				return {
					modSkillPoints: result.modSkillPoints + options.modSkillPoints,
					modSkillCap: result.modSkillCap + options.modSkillCap,
				};
			},
			{
				modSkillPoints: 0,
				modSkillCap: 0,
			}
		);

		const values = Object.values(SYSTEM.SKILLS).map((cfg) => {
			const skill = foundry.utils.deepClone(cfg);
			skill.base = this.system.skills[skill.id].base;
			skill.mod = skill.base;
			skill.specialisations = this.system.skills[skill.id].specialisations;
			return skill;
		});

		return {
			maxPoints: defaultPoints + expDistinctions.modSkillPoints,
			cap: defaultCap + expDistinctions.modSkillCap,
			values,
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
