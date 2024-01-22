export default class GadgetModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};

		schema.description = new fields.HTMLField();
		schema.storyPoints = new fields.NumberField({
			required: true,
			nullable: false,
			integer: true,
			initial: 0,
			min: 0,
		});
		schema.distinctions = new fields.ArrayField(
			new fields.SchemaField({
				name: new fields.StringField({
					initial: 'New Gadget Distinction',
					required: true,
					nullable: false,
				}),
				description: new fields.HTMLField({ initial: '' }),
				// modifiers: new fields.ArrayField(
				// 	new fields.SchemaField({
				// 		id: new fields.StringField({ required: true }),
				// 		type: new fields.StringField({ required: true }),
				// 		value: new fields.NumberField({ initial: 0 }),
				// 	})
				// ),
			})
		);

		return schema;
	}

	prepareBaseData() {
		this.maxStoryPoints = this.distinctions.length;
	}
}
