export default class WeaponModel extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = {};

		schema.description = new fields.HTMLField();
		schema.baseDamage = new fields.NumberField({
			initial: 1,
			min: 1,
			required: true,
			nullable: false,
			positive: true,
		});
		schema.damageType = new fields.StringField({
			initial: 'amount',
			required: true,
			nullable: false,
		});

		return schema;
	}

	prepareDerivedData() {
		if (this.damageType === 'amount') {
			this.damage = {
				low: Math.floor(this.baseDamage / 2),
				normal: this.baseDamage,
				high: Math.floor(this.baseDamage * 1.5),
			};
		}

		if (this.damageType === 'stun') {
			this.damage = {
				low: 'S',
				normal: 'S',
				high: 'S',
			};
		}

		if (this.damageType === 'lethal') {
			this.damage = {
				low: this.baseDamage,
				normal: 'L',
				high: 'L',
			};
		}

		this.damageLabel = `
		<span class="damage-low">${this.damage.low}</span>
/
<span class="damage-normal">${this.damage.normal}</span>
/
<span class="damage-high">${this.damage.high}</span>`.trim();
	}
}
