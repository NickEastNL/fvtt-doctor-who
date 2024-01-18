import { SkillConfig } from '../_module.mjs';

export default class CharacterSheet extends ActorSheet {
	static get defaultOptions() {
		const options = super.defaultOptions;

		return Object.assign(options, {
			width: 800,
			height: 750,
			classes: [SYSTEM.id, 'sheet', 'actor', 'character'],
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

		context.storyPoints = this.#formatStoryPoints();

		// TODO: Add modifiers from XP spends.
		context.attributes = this.#formatAttributes(actor.system.attributes);
		context.skills = this.#formatSkills(actor.system.skills);

		context.distinctions = this.#formatDistinctions(actor.distinctions);

		context.conditions = actor.system.conditions;

		console.debug(context);

		return context;
	}

	#formatStoryPoints() {
		const storyPoints = this.actor.system.storyPoints;
		const basePoints = this.actor.system.derivedPoints.storyPoints;
		const points = {
			base: basePoints,
			current: storyPoints,
		};

		if (points.current > 0) points.canDecrease = true;
		if (points.current > points.base) points.overLimit = true;

		return points;
	}

	#formatAttributes(source) {
		const derivedPoints = this.actor.system.derivedPoints;
		const availablePoints = derivedPoints.attributes.available;
		const hasPoints = availablePoints > 0;

		const result = {};
		result.hasPoints = hasPoints;
		result.availablePoints = availablePoints;
		result.transferredPoints = this.actor.system.transferredPoints;
		result.values = Object.values(SYSTEM.ATTRIBUTES).map((cfg) => {
			const attribute = foundry.utils.deepClone(cfg);
			attribute.base = source[attribute.id].base;
			attribute.current = source[attribute.id].current;

			if (attribute.base < derivedPoints.attributes.cap && hasPoints)
				attribute.canIncreaseBase = true;
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

		return result;
	}

	#formatSkills(source) {
		const derivedPoints = this.actor.system.derivedPoints.skills;
		const availablePoints = derivedPoints.available;
		const hasPoints = availablePoints > 0;

		const result = {};
		result.hasPoints = hasPoints;
		result.availablePoints = availablePoints;
		result.canTransfer = this.actor.system.transferredPoints > 0 && hasPoints;
		result.values = Object.values(SYSTEM.SKILLS).map((cfg) => {
			const skill = foundry.utils.deepClone(cfg);
			skill.base = source[skill.id].base;
			skill.specialisations = source[skill.id].specialisations;

			if (skill.base < derivedPoints.cap && hasPoints) skill.canIncrease = true;
			if (skill.base > 0) skill.canDecrease = true;

			return skill;
		});

		return result;
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
			// Adjust Story Points
			case 'storyPointsIncrease':
				return this.actor.updateStoryPoints(1);
			case 'storyPointsDecrease':
				return this.actor.updateStoryPoints(-1);

			// Transfer Attribute Points
			case 'transferAttrPoints':
				return this.#transferAttrPoints(1);
			case 'restoreAttrPoints':
				return this.#transferAttrPoints(-1);

			// Adjust Attribute
			case 'attributeIncreaseBase': {
				const attribute = b.closest('.attribute').dataset.attribute;
				return this.actor.updateAttribute(attribute, 1);
			}
			case 'attributeDecreaseBase': {
				const attribute = b.closest('.attribute').dataset.attribute;
				return this.actor.updateAttribute(attribute, -1);
			}
			case 'attributeIncreaseCur': {
				const attribute = b.closest('.attribute').dataset.attribute;
				return this.actor.updateAttribute(attribute, 1, false);
			}
			case 'attributeDecreaseCur': {
				const attribute = b.closest('.attribute').dataset.attribute;
				return this.actor.updateAttribute(attribute, -1, false);
			}

			// Adjust Skills
			case 'skillIncrease':
				return this.actor.updateSkill(b.closest('.skill').dataset.skill, 1);
			case 'skillDecrease':
				return this.actor.updateSkill(b.closest('.skill').dataset.skill, -1);
			case 'skillConfig': {
				const skillId = b.closest('.skill').dataset.skill;
				return new SkillConfig(this.actor, skillId).render(true);
			}

			// Modify Distinctions
			case 'addDistinction': {
				return this.#editDistinction();
			}
			case 'editDistinction': {
				const itemId = b.closest('.distinction').dataset.itemId;
				return this.#editDistinction('edit', itemId);
			}
			case 'deleteDistinction': {
				const itemId = b.closest('.distinction').dataset.itemId;
				return this.#editDistinction('delete', itemId);
			}

			// Modify Conditions
			case 'addCondition':
				return this.actor.editCondition();
			case 'editCondition': {
				const index = b.closest('.condition').dataset.index;
				return this.actor.editCondition('edit', index);
			}
			case 'deleteCondition': {
				const index = b.closest('.condition').dataset.index;
				return this.actor.editCondition('delete', index);
			}
		}
	}

	async #transferAttrPoints(delta = 1) {
		delta = Math.sign(delta);
		const current = this.actor.system.transferredPoints;

		if (!delta) return;

		this.actor.update({ 'system.transferredPoints': current + delta });
	}

	async #editDistinction(action = 'add', itemId = null) {
		const item = this.actor.items.get(itemId);
		const name = game.i18n.format('DOCUMENT.New', {
			type: game.i18n.format('TYPES.Item.distinction'),
		});

		switch (action) {
			case 'add':
				return Item.create(
					{ name, type: 'distinction' },
					{ parent: this.actor, renderSheet: true }
				);
			case 'edit':
				return item?.sheet.render(true);
			case 'delete':
				return item?.deleteDialog();
		}
	}
}
