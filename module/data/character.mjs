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

		schema.isLocked = new fields.BooleanField({
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

		schema.experience = new fields.SchemaField({
			xpSpent: new fields.NumberField({
				...requiredInteger,
				initial: 0,
				min: 0,
			}),
			entries: new fields.ArrayField(
				new fields.SchemaField({
					label: new fields.StringField({ required: true, initial: '' }),
					hasRecalled: new fields.BooleanField(),
					hasSpent: new fields.BooleanField(),
				})
			),
		});

		return schema;
	}

	derivedPoints;

	prepareBaseData() {
		const parent = this.parent;

		const distinctionCost =
			parent.itemTypes.distinction.length * SYSTEM.STORY_POINTS.DISTINCTION_COST;
		let gadgetCost = 0;
		Object.values(parent.itemTypes.gadget).forEach((g) => {
			gadgetCost = g.system.distinctions.length;
		});
		const totalCost = distinctionCost + gadgetCost;

		let attributePointsSpent = 0;
		Object.values(this.attributes).forEach((a) => {
			attributePointsSpent += a.base;
		});

		let skillPointsSpent = 0;
		Object.values(this.skills).forEach((s) => {
			skillPointsSpent += s.base;
			skillPointsSpent += s.specialisations.length;
		});

		let potentialXp = 0;
		for (const ex of this.experience.entries) {
			if (ex.hasSpent) continue;
			potentialXp += ex.hasRecalled ? 2 : 1;
		}

		let availableXp = 0;
		for (const ex of this.experience.entries) {
			if (ex.hasSpent) availableXp++;
		}

		this.derivedPoints = {
			storyPoints: SYSTEM.STORY_POINTS.BASE - totalCost,
			attributes: {
				cap: SYSTEM.ATTRIBUTE_RULES.MAX_CAP,
				pool: SYSTEM.ATTRIBUTE_RULES.DEFAULT_POINTS,
			},
			skills: {
				cap: SYSTEM.SKILL_RULES.MAX_CAP,
				pool: SYSTEM.SKILL_RULES.DEFAULT_POINTS,
			},
			potentialXp,
			availableXp: availableXp - this.experience.xpSpent,
		};

		this.derivedPoints.attributes.spent = attributePointsSpent;
		this.derivedPoints.skills.spent = skillPointsSpent;
	}
}
