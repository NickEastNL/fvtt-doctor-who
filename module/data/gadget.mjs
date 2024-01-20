export default class GadgetModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};

		schema.description = new fields.HTMLField();
		schema.distinctions = new fields.ArrayField(
			new fields.SchemaField({
				name: new fields.StringField({
					initial: 'New Gadget Distinction',
					required: true,
					nullable: false,
				}),
				description: new fields.HTMLField({ initial: '' }),
			})
		);

		return schema;
	}

	prepareDerivedData() {
		this.storyPoints = this.distinctions.length;
	}
}
