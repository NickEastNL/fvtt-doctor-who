export default class DistinctionModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};
		const integer = {
			initial: 0,
			integer: true,
		};

		schema.description = new fields.HTMLField();
		schema.options = new fields.SchemaField({
			modAttrPoints: new fields.NumberField(integer),
			modSkillPoints: new fields.NumberField(integer),
			modAttrCap: new fields.NumberField(integer),
			modSkillCap: new fields.NumberField(integer),
			modDamage: new fields.NumberField(integer),
		});

		return schema;
	}
}
