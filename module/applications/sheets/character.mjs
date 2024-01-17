import { DistinctionsConfig } from '../_module.mjs';

export default class CharacterSheet extends ActorSheet {
	attributes = this.attributes;
	skills = this.skills;

	static get defaultOptions() {
		const options = super.defaultOptions;

		return Object.assign(options, {
			width: 800,
			height: 750,
			classes: [SYSTEM.id, 'sheet', 'actor', this.actorType],
			template: `systems/${SYSTEM.id}/templates/sheets/character.hbs`,
			resizable: false,
			tabs: [
				{
					navSelector: '.tabs',
					contentSelector: '.sheet-tabs',
					initial: 'attributes',
				},
			],
			scrollY: [],
		});
	}

	async getData(options) {
		const context = super.getData(options);
		const actor = (context.actor = context.document);

		context.focus = foundry.utils.deepClone(actor.system.focus);
		context.focus.intensity =
			SYSTEM.GENERAL_RULES.FOCUS_INTENSITY[context.focus.intensity];

		context.storyPoints = this.#formatStoryPoints(actor.storyPoints);

		// context.attributes = this.#formatAttributes(actor.attributes);
		// context.skills = this.#formatSkills(actor.skills);

		context.distinctions = this.#formatDistinctions(actor.distinctions);

		context.conditions = actor.system.conditions;

		console.log(this);

		return context;
	}

	#formatStoryPoints(storyPoints) {
		const points = foundry.utils.deepClone(storyPoints);

		if (points.points > 1) points.canDecrease = true;
		if (points.points > points.base) points.overLimit = true;

		return points;
	}

	#formatAttributes(source) {
		const attributes = foundry.utils.deepClone(source);
		let availablePoints = attributes.values.reduce((points, attribute) => {
			return points - attribute.base;
		}, attributes.maxPoints);

		const hasPoints = availablePoints > 0;

		attributes.hasPoints = hasPoints;
		attributes.availablePoints = availablePoints;
		attributes.values = Object.values(attributes.values).map((attribute) => {
			if (attribute.base < attributes.cap && hasPoints) attribute.canIncreaseBase = true;
			if (attribute.base > 1) attribute.canDecreaseBase = true;

			if (attribute.current < attribute.base) attribute.canIncreaseCur = true;
			if (attribute.current > 0) attribute.canDecreaseCur = true;

			attribute.down = attribute.current === 0;

			attribute.pips = Array.fromRange(10).map((v, i) => {
				if (i < attribute.base && i < attribute.current) {
					return 'full';
				} else if (i < attribute.base) {
					return 'damage';
				}

				return null;
			});
			return attribute;
		});

		return attributes;
	}

	// TODO: Spare Attribute Points must be deducted when spending on Skills
	#formatSkills(source) {
		const skills = foundry.utils.deepClone(source);
		const availablePoints = skills.values.reduce((points, skill) => {
			return points - skill.base;
		}, skills.maxPoints);
		const hasPoints = availablePoints > 0;

		skills.hasPoints = hasPoints;
		skills.availablePoints = availablePoints;
		skills.values = Object.values(skills.values).map((skill) => {
			if (skill.base < skills.cap && hasPoints) skill.canIncrease = true;
			if (skill.base > 0) skill.canDecrease = true;

			return skill;
		});

		return skills;
	}

	#formatDistinctions(distinctions) {
		return Object.values(distinctions).map((src) => {
			const distinction = foundry.utils.deepClone(src);
			const options = distinction.system.options;

			distinction.modifier = Object.values(options).some((value) => value > 0);

			return distinction;
		});
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find('[data-action]').click(this._onClickControl.bind(this));
	}

	async _onClickControl(event) {
		event.preventDefault();
		const b = event.currentTarget;
		switch (b.dataset.action) {
			case 'storyPointsIncrease':
				return this.actor.updateStoryPoints(1);
			case 'storyPointsDecrease':
				return this.actor.updateStoryPoints(-1);
			case 'transferAttrPoints':
				return this.#transferAttrPoints();
			case 'restoreAttrPoints':
				return this.#restoreAttrPoints();
			case 'attributeIncreaseBase':
				return this.actor.updateAttribute(b.closest('.attribute').dataset.attribute, 1);
			case 'attributeDecreaseBase':
				return this.actor.updateAttribute(b.closest('.attribute').dataset.attribute, -1);
			case 'attributeIncreaseCur':
				return this.actor.updateAttribute(
					b.closest('.attribute').dataset.attribute,
					1,
					false
				);
			case 'attributeDecreaseCur':
				return this.actor.updateAttribute(
					b.closest('.attribute').dataset.attribute,
					-1,
					false
				);
			case 'skillIncrease':
				return this.actor.updateSkill(b.closest('.skill').dataset.skill, 1);
			case 'skillDecrease':
				return this.actor.updateSkill(b.closest('.skill').dataset.skill, -1);
			case 'editSpecialisations':
				return this.actor.editSpecialisations(b.closest('.skill').dataset.skill, 'edit');
			case 'editDistinctions':
				return new DistinctionsConfig(this.actor).render(true);
			case 'addDistinction':
				return this.#editDistinction();
			case 'editDistinction':
				return this.#editDistinction('edit', b);
			case 'deleteDistinction':
				return this.#editDistinction('delete', b);
			case 'addCondition':
				return this.actor.editCondition();
			case 'editCondition':
				return this.actor.editCondition(
					'edit',
					b.closest('.stat-list-item').dataset.index
				);
			case 'removeCondition':
				return this.actor.editCondition(
					'remove',
					b.closest('.stat-list-item').dataset.index
				);
		}
	}

	#transferAttrPoints() {
		if (this.attributes.availablePoints > 0) {
			this.skills.attrPoints = this.attributes.availablePoints;
			this.actor.setFlag(SYSTEM.id, 'transferAttrPoints', true);
		}
	}

	#restoreAttrPoints() {
		if (this.skills.availablePoints >= this.skill.attrPoints) {
			this.attributes.availablePoints += this.skills.attrPoints;
			this.actor.setFlag(SYSTEM.id, 'transferAttrPoints', false);
		}
	}

	async #editDistinction(action = 'add', button = null) {
		const itemId = button?.closest('.stat-list-item').dataset.itemId;
		const item = this.actor.items.get(itemId);
		const name = game.i18n.format('DOCUMENT.New', {
			type: game.i18n.format('TYPES.Item.distinction'),
		});

		switch (action) {
			case 'add':
				Item.create(
					{ name, type: 'distinction' },
					{ parent: this.actor, renderSheet: true }
				);
				return;
			case 'edit':
				item?.sheet.render(true);
				return;
			case 'delete':
				item?.deleteDialog();
		}
	}
}
