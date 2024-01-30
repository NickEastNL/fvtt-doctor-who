export default class WeaponSheet extends ItemSheet {
	static get defaultOptions() {
		return Object.assign(super.defaultOptions, {
			width: 500,
			height: 400,
			classes: [SYSTEM.id, 'sheet', 'item', 'weapon'],
			template: `systems/${SYSTEM.id}/templates/sheets/weapon-sheet.hbs`,
			resizable: false,
		});
	}

	getData(options) {
		const data = super.getData(options);

		data.damageLabel = this.item.system.damageLabel;
		data.baseDamage = this.item.system.baseDamage;
		data.damageType = this.item.system.damageType;
		data.choices = SYSTEM.WEAPON_DAMAGE_TYPES;

		data.isAmount = data.damageType === 'amount' || data.damageType === 'lethal';

		return data;
	}
}
