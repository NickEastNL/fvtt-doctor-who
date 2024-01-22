export default class DistinctionModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};

		schema.description = new fields.HTMLField();
		// schema.modifiers = new fields.ArrayField(
		// 	new fields.SchemaField({
		// 		id: new fields.StringField({ required: true }),
		// 		type: new fields.StringField({ required: true }),
		// 		value: new fields.NumberField({ initial: 0 }),
		// 	})
		// );

		return schema;
	}
}
