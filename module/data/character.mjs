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

		schema.storyPoints = new fields.NumberField({
			...requiredInteger,
			initial: 12,
			min: 0,
			positive: true,
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

		schema.transferPoints = new fields.BooleanField({ initial: false });

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
		// schema.distinctions = new fields.ArrayField(new fields.StringField());
		// schema.experiences = new fields.ArrayField(new fields.StringField());
		schema.conditions = new fields.ArrayField(new fields.StringField());

		return schema;
	}

	points;

	prepareBaseData() {
		const parent = this.parent;
		const modifiers = {
			modAttrPoints: 0,
			modSkillPoints: 0,
			modAttrCap: 0,
			modSkillCap: 0,
		};

		Object.values(parent.itemTypes.distinction).forEach((d) => {
			const options = d.system.options;
			modifiers.modAttrPoints += options.modAttrPoints;
			modifiers.modSkillPoints += options.modSkillPoints;
			modifiers.modAttrCap += options.modAttrCap;
			modifiers.modSkillCap += options.modSkillCap;
		});

		let attributePointsSpent = 0;
		Object.values(this.attributes).forEach((a) => {
			attributePointsSpent += a.base;
		});

		let skillPointsSpent = 0;
		Object.values(this.skills).forEach((s) => {
			skillPointsSpent += s.base;
		});

		this.points = {
			attributes: {
				cap: SYSTEM.ATTRIBUTE_RULES.DEFAULT_CAP + modifiers.modAttrCap,
				pool: SYSTEM.ATTRIBUTE_RULES.DEFAULT_POINTS + modifiers.modAttrPoints,
			},
			skills: {
				cap: SYSTEM.SKILL_RULES.DEFAULT_CAP + modifiers.modSkillCap,
				pool: SYSTEM.SKILL_RULES.DEFAULT_POINTS + modifiers.modSkillPoints,
			},
		};

		this.points.attributes.available = this.points.attributes.pool - attributePointsSpent;
		this.points.skills.available = this.points.skills.pool - skillPointsSpent;

		// If true, transfer the available attribute points to skill points
		if (this.transferPoints && this.points.attributes.available > 0) {
			this.points.skills.available += this.points.attributes.available;
			this.points.attributes.available = 0;
		}
	}
}
