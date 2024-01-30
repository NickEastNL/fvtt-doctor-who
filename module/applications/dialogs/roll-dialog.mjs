import { DwCharacter } from '../../documents/_module.mjs';
import DwRoll from '../../roll.mjs';

export default class RollDialog extends Dialog {
	constructor(data, options) {
		super(data, options);

		const { actor, target, isReaction } = data;
		this.actor = actor;
		this.target = target;
		this.isReaction = isReaction;
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 350,
			height: 'auto',
			classes: [SYSTEM.id, 'dialog', 'roll'],
			template: `systems/${SYSTEM.id}/templates/dialogs/roll-dialog.hbs`,
			resizable: false,
			submitOnChange: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		if (this.isReaction) return `[${this.actor.name}] Reaction Roll`;
		return `[${this.actor.name}] Standard Roll`;
	}

	getData() {
		const attributes = Object.values(SYSTEM.ATTRIBUTES).reduce((obj, attr) => {
			obj[attr.id] = attr.label;
			return obj;
		}, {});

		const skills = Object.values(SYSTEM.SKILLS).reduce((obj, skill) => {
			obj[skill.id] = skill.label;
			return obj;
		}, {});

		return {
			target: !this.isReaction ? this.target?.id : null,
			attribute: 'awareness',
			skill: 'athletics',
			attributes,
			skills,
			bonusDice: 0,
			bonusModifier: 0,
			difficulty: 9,
			favor: 'none',
			favorChoices: {
				none: 'None',
				adv: 'Advantage',
				disadv: 'Disadvantage',
			},
			rollMode: game.settings.get('core', 'rollMode'),
			rollModes: CONFIG.Dice.rollModes,
		};
	}

	async _submitRoll(html, contested = false) {
		const form = html.find('form').get(0);
		const fd = new FormDataExtended(form);
		const data = fd.object;

		data.isReaction = this.isReaction;
		data.attributeScore = this.actor.system.attributes[data.attribute].current;
		data.skillScore = this.actor.system.skills[data.skill].base;

		const roll = new DwRoll(data);
		let messageData = {};

		if (contested && !this.isReaction) {
			messageData = {
				user: game.user.id,
				type: CONST.CHAT_MESSAGE_TYPES.OOC,
				content: '<div class="contested-message"></div>',
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flags: {
					[SYSTEM.id]: {
						source: this.actor.uuid,
						sourceRoll: data,
						target: this.target.actor.uuid,
						targetActorId: this.target.actor.id,
					},
				},
			};
		} else {
			let flavor = '';
			if (this.isReaction)
				flavor = `Reaction roll against <strong>${this.target.name}</strong>`;

			messageData = await roll.toMessage(
				{
					flavor,
					speaker: ChatMessage.getSpeaker({ actor: this.actor }),
					flags: {
						[SYSTEM.id]: {
							source: this.actor.uuid,
							points: 0,
						},
					},
				},
				{ create: false }
			);
		}

		const cls = getDocumentClass('ChatMessage');
		let msg = new cls(messageData);
		cls.create(msg.toObject());
		return roll;
	}

	static async show({ actor, target, isReaction = false } = {}) {
		target ??= game.user.targets.first();

		return this.wait({
			actor,
			target,
			isReaction,
			close: () => {
				return null;
			},
			buttons: {
				standard: {
					callback: async function (html) {
						return await this._submitRoll(html);
					},
				},
				contested: {
					callback: async function (html) {
						return await this._submitRoll(html, true);
					},
				},
			},
		});
	}
}
