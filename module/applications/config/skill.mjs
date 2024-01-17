export default class SkillConfig extends FormApplication {
	constructor(actor, skillId, options) {
		super(actor, options);
		this.actor = actor;
		this.skillId = skillId;
		this.config = SYSTEM.SKILLS[skillId];
		this.actor.apps[this.appId] = this;

		console.log(this);
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 350,
			height: 500,
			classes: ['doctor-who', 'sheet'],
			template: `systems/${SYSTEM.id}/templates/config/skill.hbs`,
			resizable: false,
			submitOnChange: true,
			closeOnSubmit: false,
		});
	}

	get title() {
		return game.i18n.format('DIALOGS.EditSkillTitle', {
			actor: this.actor.name,
			skill: this.config.label,
		});
	}

	async getData() {
		const skill = this.actor.skills[this.skillId];
		const skillPoints = this.actor.system.derivedPoints.skills.available;
		const context = {
			skill,
			skillPoints,
			config: this.config,
		};

		console.log(context);

		return context;
	}
}
