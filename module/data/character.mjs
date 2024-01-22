import { SYSTEM } from '../config.mjs';

export default class CharacterModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};
		const requiredInteger = {
			required: true,
			nullable: false,
			integer: true,
		};

		schema.isUnlocked = new fields.BooleanField({
			initial: false,
		});

		schema.storyPoints = new fields.NumberField({
			...requiredInteger,
			initial: 12,
			min: 0,
		});

		schema.techLevel = new fields.NumberField({
			...requiredInteger,
			initial: 1,
			min: 1,
			max: 12,
			step: 1,
		});

		schema.goals = new fields.SchemaField({
			short: new fields.StringField(),
			long: new fields.StringField(),
		});

		schema.transferredPoints = new fields.NumberField({
			...requiredInteger,
			initial: 0,
			min: 0,
		});

		schema.attributes = new fields.SchemaField(
			Object.values(SYSTEM.ATTRIBUTES).reduce((obj, attribute) => {
				obj[attribute.id] = new fields.SchemaField(
					{
						base: new fields.NumberField({
							...requiredInteger,
							initial: 1,
							min: 1,
							max: 10,
							positive: true,
						}),
						current: new fields.NumberField({
							...requiredInteger,
							initial: 1,
							min: 0,
							max: 10,
						}),
					},
					{ label: attribute.label }
				);
				return obj;
			}, {})
		);

		schema.skills = new fields.SchemaField(
			Object.values(SYSTEM.SKILLS).reduce((obj, skill) => {
				obj[skill.id] = new fields.SchemaField({
					base: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
						max: 10,
					}),
					specialisations: new fields.ArrayField(new fields.StringField()),
				});
				return obj;
			}, {})
		);

		schema.concept = new fields.StringField();
		schema.focus = new fields.SchemaField({
			name: new fields.StringField(),
			intensity: new fields.NumberField({
				...requiredInteger,
				initial: 0,
				min: 0,
				max: 2,
			}),
		});

		schema.homeworld = new fields.StringField();
		schema.conditions = new fields.ArrayField(new fields.StringField());

		schema.equipment = new fields.ArrayField(
			new fields.SchemaField({
				name: new fields.StringField({ initial: '', required: true, nullable: false }),
				description: new fields.StringField(),
			})
		);

		return schema;
	}

	derivedPoints;

	prepareBaseData() {
		const parent = this.parent;
		const finalMods = {
			attribute_points: 0,
			skill_points: 0,
			attribute_cap: SYSTEM.ATTRIBUTE_RULES.DEFAULT_CAP,
			skill_cap: SYSTEM.SKILL_RULES.DEFAULT_CAP,
		};

		const distinctionCost =
			parent.itemTypes.distinction.length * SYSTEM.STORY_POINTS.DISTINCTION_COST;
		let gadgetCost = 0;
		Object.values(parent.itemTypes.gadget).forEach((g) => {
			gadgetCost = g.system.distinctions.length;
		});
		const totalCost = distinctionCost + gadgetCost;

		// Object.values(parent.itemTypes.distinction).forEach((d) => {
		// 	const modifiers = d.system.modifiers;
		// 	const types = ['attribute_points', 'skill_points', 'attribute_cap', 'skill_cap'];

		// 	for (const mod of modifiers) {
		// 		if (!types.includes(mod.id)) return;

		// 		if (mod.id === 'attribute_cap') {
		// 			finalMods[mod.id] = SYSTEM.ATTRIBUTE_RULES.MAX_CAP;
		// 		}

		// 		if (mod.id === 'skill_cap') {
		// 			finalMods[mod.id] = SYSTEM.SKILL_RULES.MAX_CAP;
		// 		}

		// 		if (mod.value > 0) {
		// 			finalMods[mod.id] += mod.value;
		// 		}
		// 	}
		// });

		let attributePointsSpent = 0;
		Object.values(this.attributes).forEach((a) => {
			attributePointsSpent += a.base;
		});

		let skillPointsSpent = 0;
		Object.values(this.skills).forEach((s) => {
			skillPointsSpent += s.base;
			skillPointsSpent += s.specialisations.length;
		});

		this.derivedPoints = {
			storyPoints: SYSTEM.STORY_POINTS.BASE - totalCost,
			attributes: {
				cap: finalMods.attribute_cap,
				pool: SYSTEM.ATTRIBUTE_RULES.DEFAULT_POINTS + finalMods.attribute_points,
			},
			skills: {
				cap: finalMods.skill_cap,
				pool: SYSTEM.SKILL_RULES.DEFAULT_POINTS + finalMods.skill_points,
			},
		};

		this.derivedPoints.attributes.available =
			this.derivedPoints.attributes.pool - attributePointsSpent;
		this.derivedPoints.skills.available =
			this.derivedPoints.skills.pool - skillPointsSpent;

		// If true, transfer the available attribute points to skill points
		if (
			this.transferredPoints > 0 &&
			this.derivedPoints.attributes.available >= this.transferredPoints
		) {
			this.derivedPoints.skills.available += this.transferredPoints;
			this.derivedPoints.attributes.available -= this.transferredPoints;
		}
	}
}
