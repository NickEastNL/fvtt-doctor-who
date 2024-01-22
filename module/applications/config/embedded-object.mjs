export default class EmbeddedObjectConfig extends FormApplication {
	constructor(data, options) {
		super(options);
		this.parent = data.parent;
		this.objectCollection = data.collection;
		this.objectId = data.objectId;
		this.object = data.object;
		this.parent.apps[this.appId] = this;

		this.options.classes = [...this.options.classes, data.type];
		this.options.template = `systems/${SYSTEM.id}/templates/sheets/${data.type}.hbs`;
		this.options.tabs = data.tabs;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 500,
			height: 300,
			classes: [SYSTEM.id, 'sheet', 'item'],
			sheetConfig: true,
			resizable: false,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
			tabs: [
				{
					navSelector: '.tabs',
					contentSelector: 'form',
					initial: 'description',
				},
			],
		});
	}

	get title() {
		return this.object.name;
	}

	getData(options = {}) {
		const data = super.getData(options);

		data.isConfig = true;
		data.item = this.object;
		data.description = this.object.description;
		return data;
	}

	_updateObject(event, formData) {
		const objects = foundry.utils.deepClone(this.parent.system[this.objectCollection]);

		if (formData.name) this.object.name = formData.name;
		if (formData.description !== undefined)
			this.object.description = formData.description;

		objects[this.objectId] = this.object;
		this.parent.update({ [`system.${this.objectCollection}`]: objects });
	}
}
