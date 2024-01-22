import { EmbeddedObjectConfig, SkillConfig } from '../_module.mjs';

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
		const data = super.getData(options);
		const actor = (data.actor = data.document);

		data.isGM = game.user.isGM;
		data.isUnlocked = actor.system.isUnlocked;
		data.focus = foundry.utils.deepClone(actor.system.focus);
		data.focus.intensity = SYSTEM.GENERAL_RULES.FOCUS_INTENSITY[data.focus.intensity];

		data.storyPoints = this.#formatStoryPoints();

		// TODO: Add modifiers from XP spends.
		data.attributes = this.#formatAttributes(actor.system.attributes);
		data.skills = this.#formatSkills(actor.system.skills);

		data.distinctions = this.#formatDistinctions(actor.distinctions);
		data.maxDistinctions = data.distinctions.length >= 2 && !data.isUnlocked;

		data.equipment = actor.equipment;
		data.conditions = actor.system.conditions;

		return data;
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
		const isUnlocked = this.actor.system.isUnlocked;
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

			if (
				(isUnlocked && attribute.base < 10) ||
				(attribute.base < derivedPoints.attributes.cap && hasPoints)
			)
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
		const isUnlocked = this.actor.system.isUnlocked;
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

			if (isUnlocked || (skill.base < derivedPoints.cap && hasPoints))
				skill.canIncrease = true;
			if (skill.base > 0) skill.canDecrease = true;

			return skill;
		});

		return result;
	}

	#formatDistinctions(distinctions) {
		return Object.values(distinctions).map((src) => {
			const distinction = foundry.utils.deepClone(src);
			// const modifiers = distinction.system.modifiers;

			// distinction.modifier = Object.values(modifiers).some(
			// 	(mod) => mod.value > 0 || ['attribute_cap', 'skill_cap'].includes(mod.id)
			// );

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
			case 'unlockLimits': {
				const isUnlocked = this.actor.system.isUnlocked;
				return this.actor.update({ 'system.isUnlocked': !isUnlocked });
			}

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

			// Modify Equipment
			case 'addEquipment': {
				return this.#editEquipment('add');
			}
			case 'editEquipment': {
				const dataset = b.closest('.list-item').dataset;
				const itemId = dataset.itemId;
				const type = dataset.type;
				return this.#editEquipment('edit', type, itemId);
			}
			case 'deleteEquipment': {
				const dataset = b.closest('.list-item').dataset;
				const itemId = dataset.itemId;
				const type = dataset.type;
				return this.#editEquipment('delete', type, itemId);
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

	async #editEquipment(action = 'add', type = 'equipment', itemId = null) {
		const equipment = foundry.utils.deepClone(this.actor.system.equipment);
		const item = this.actor.items.get(itemId);

		const createEquipment = async () => {
			const newEquipment = {
				name: 'New Equipment',
			};

			const newLength = equipment.push(newEquipment);

			await this.actor.update({ 'system.equipment': equipment });
			this.#showEquipmenConfig(newEquipment, newLength - 1);
		};

		const createItem = (newType) => {
			const name = game.i18n.format('DOCUMENT.New', {
				type: game.i18n.format(`TYPES.Item.${newType}`),
			});

			return Item.create(
				{
					name,
					type: newType,
				},
				{
					parent: this.actor,
					renderSheet: true,
				}
			);
		};

		switch (action) {
			case 'add': {
				const d = new Dialog(
					{
						title: 'Create Equipment',
						buttons: {
							equipment: {
								icon: '<i class="fas fa-backpack"></i>',
								label: game.i18n.localize('TYPES.Item.equipment'),
								callback: () => createEquipment(),
							},
							gadget: {
								icon: '<i class="fas fa-wrench"></i>',
								label: game.i18n.localize('TYPES.Item.gadget'),
								callback: () => createItem('gadget'),
							},
							weapon: {
								icon: '<i class="fas fa-raygun"></i>',
								label: game.i18n.localize('TYPES.Item.weapon'),
								callback: () => createItem('weapon'),
							},
						},
					},
					{ classes: [SYSTEM.id, 'sheet', 'dialog'], rejectClose: false }
				);
				d.render(true);
				return;
			}
			case 'edit':
				if (type !== 'equipment') {
					return item?.sheet.render(true);
				} else {
					const object = equipment[itemId];
					return this.#showEquipmenConfig(object, itemId);
				}
			case 'delete': {
				if (type !== 'equipment') {
					return item?.deleteDialog();
				} else {
					const response = await Dialog.confirm({
						title: 'Delete Equipment',
						content:
							'<p>Are You Sure?</p><p>This Equipment will be permanently deleted and cannot be recovered.</p>',
						defaultYes: false,
						yes: () => {},
						options: {
							classes: [SYSTEM.id, 'sheet', 'dialog'],
						},
					});

					if (response) {
						equipment.splice(itemId, 1);
						return this.actor.update({ 'system.equipment': equipment });
					} else {
						return;
					}
				}
			}
		}
	}

	async #showEquipmenConfig(equipment, idx) {
		const sheetData = {
			parent: this.actor,
			type: 'equipment',
			collection: 'equipment',
			objectId: idx,
			object: equipment,
		};
		const sheet = new EmbeddedObjectConfig(sheetData);
		sheet.render(true);
	}
}
