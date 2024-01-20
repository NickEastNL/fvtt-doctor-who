export default class GadgetDistinctionConfig extends FormApplication {
	constructor(parent, object, objectId, options) {
		super(options);
		this.parent = parent;
		this.objectId = objectId;
		this.object = object;
		this.parent.apps[this.appId] = this;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 500,
			height: 300,
			classes: [SYSTEM.id, 'sheet', 'item', 'distinction'],
			template: `systems/${SYSTEM.id}/templates/sheets/distinction.hbs`,
			resizable: false,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		return this.object.name;
	}

	async getData(options = {}) {
		const data = super.getData(options);

		data.isConfig = true;
		data.item = this.object;
		data.description = this.object.description;
		return data;
	}

	_updateObject(event, formData) {
		const distinctions = foundry.utils.deepClone(this.parent.system.distinctions);

		if (formData.name) this.object.name = formData.name;
		if (formData.description) this.object.description = formData.description;

		distinctions[this.objectId] = this.object;
		this.parent.update({ 'system.distinctions': distinctions });
	}
}
