export const id = 'doctor-who';

export const GENERAL_RULES = Object.freeze({
	FOCUS_INTENSITY: ['Normal', 'Strong', 'Intense'],
});

export const STORY_POINTS = Object.freeze({
	BASE: 12,
	DISTINCTION_COST: 2,
	GADGET_COST: 1,
});

export const ATTRIBUTE_RULES = Object.freeze({
	DEFAULT_CAP: 6,
	MAX_CAP: 10,
	DEFAULT_POINTS: 18,
});

export const SKILL_RULES = Object.freeze({
	DEFAULT_CAP: 5,
	MAX_CAP: 10,
	DEFAULT_POINTS: 18,
});

export const ATTRIBUTES = Object.freeze({
	awareness: {
		id: 'awareness',
		label: 'ATTRIBUTES.Awareness',
	},
	coordination: {
		id: 'coordination',
		label: 'ATTRIBUTES.Coordination',
	},
	ingenuity: {
		id: 'ingenuity',
		label: 'ATTRIBUTES.Ingenuity',
	},
	presence: {
		id: 'presence',
		label: 'ATTRIBUTES.Presence',
	},
	resolve: {
		id: 'resolve',
		label: 'ATTRIBUTES.Resolve',
	},
	strength: {
		id: 'strength',
		label: 'ATTRIBUTES.Strength',
	},
});

export const SKILLS = Object.freeze({
	athletics: {
		id: 'athletics',
		label: 'SKILLS.Athletics',
	},
	conflict: {
		id: 'conflict',
		label: 'SKILLS.Conflict',
	},
	convince: {
		id: 'convince',
		label: 'SKILLS.Convince',
	},
	craft: {
		id: 'craft',
		label: 'SKILLS.Craft',
	},
	intuition: {
		id: 'intuition',
		label: 'SKILLS.Intuition',
	},
	knowledge: {
		id: 'knowledge',
		label: 'SKILLS.Knowledge',
	},
	medicine: {
		id: 'medicine',
		label: 'SKILLS.Medicine',
	},
	science: {
		id: 'science',
		label: 'SKILLS.Science',
	},
	subterfuge: {
		id: 'subterfuge',
		label: 'SKILLS.Subterfuge',
	},
	survival: {
		id: 'survival',
		label: 'SKILLS.Survival',
	},
	technology: {
		id: 'technology',
		label: 'SKILLS.Technology',
	},
	transport: {
		id: 'transport',
		label: 'SKILLS.Transport',
	},
});

export const WEAPON_TYPES = Object.freeze({
	amount: 'DAMAGE.Amount',
	stun: 'DAMAGE.Stun',
	lethal: 'DAMAGE.Lethal',
});

// export const DISTINCTION_MODIFIERS = Object.freeze({
// 	attribute_points: {
// 		type: 'number',
// 		label: 'Attribute Points',
// 	},
// 	skill_points: {
// 		type: 'number',
// 		label: 'Skill Points',
// 	},
// 	attribute_cap: {
// 		type: 'boolean',
// 		label: 'Disable Attribute Cap',
// 	},
// 	skill_cap: {
// 		type: 'boolean',
// 		label: 'Disable Skill Cap',
// 	},
// 	resistance: {
// 		type: 'number',
// 		label: 'Damage Resistance',
// 	},
// 	roll_bonus: {
// 		type: 'number',
// 		label: 'Roll Bonus',
// 	},
// 	dice_bonus: {
// 		type: 'number',
// 		label: 'Dice Bonus',
// 	},
// });

export const SYSTEM = {
	id,
	GENERAL_RULES,
	STORY_POINTS,
	ATTRIBUTE_RULES,
	SKILL_RULES,
	ATTRIBUTES,
	SKILLS,
	WEAPON_TYPES,
	DISTINCTION_MODIFIERS,
};
