import DwRoll from '../roll.mjs';

/**
 * @param {ChatMessage} msg
 * @param {JQuery} html
 */
export default async function standardRoll(msg, html) {
	const rollMessage = html.find('.dice-roll');
	if (!rollMessage.length) return;

	const flags = foundry.utils.deepClone(msg.flags[SYSTEM.id]) || {};
	const actor = fromUuidSync(flags.source);
	const roll = msg.rolls[0];

	const templateData = _prepareChatData(roll, flags);

	const template = await renderTemplate(
		`systems/${SYSTEM.id}/templates/chat/roll-message.hbs`,
		templateData
	);

	rollMessage.replaceWith(template);

	html.find('[data-action]').on('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		const b = event.currentTarget;

		switch (b.dataset.action) {
			case 'spendPoint': {
				msg.setFlag(SYSTEM.id, 'points', flags.points - 1);
				actor.updateStoryPoints(-1);
				break;
			}
			case 'earnPoint':
				msg.setFlag(SYSTEM.id, 'points', flags.points + 1);
				actor.updateStoryPoints(1);
				break;
		}
	});
}

/**
 * @param {DwRoll} roll
 */
function _prepareChatData(roll, flags) {
	const chatData = {
		isGM: game.user.isGM,
		css: [SYSTEM.id, 'roll-check'],
		data: roll.data,
		formula: roll.formula,
		attribute: game.i18n.localize(SYSTEM.ATTRIBUTES[roll.data.attribute].label),
		skill: game.i18n.localize(SYSTEM.SKILLS[roll.data.skill].label),
		pool: roll.dice[0].results.sort((d) => !d.active && -1),

		bonusDice: roll.dice[1]?.results,
		hasModifier: roll.data.bonusModifier > 0,
		diceTotal: roll.dice.reduce((t, d) => t + d.total, 0),

		total: roll.total,
		outcome: 'None',

		spentPoints: Math.abs(flags.points) > 0,
		points: flags.points,
	};

	const results = SYSTEM.SUCCESS_RESULTS;

	chatData.pool = chatData.pool.map((d) => ({
		...d,
		isOne: d.result === 1,
		isSix: d.result === 6,
	}));

	let outcome = 0;
	if (roll.isSuccess) {
		outcome = 4;
		if (roll.hasOne && !roll.hasSix) {
			outcome = 3;
		}
		if (roll.hasSix && !roll.hasOne) {
			outcome = 5;
		}
	} else {
		outcome = 1;
		if (roll.hasSix && !roll.hasOne) {
			outcome = 2;
		}
		if (roll.hasOne && !roll.hasSix) {
			outcome = 0;
		}
	}

	if (roll.isAllSixes) {
		outcome = 5;
		cardData.css.push('boxcars');
	}
	if (roll.isAllOnes) {
		outcome = 0;
		cardData.css.push('snake-eyes');
	}

	outcome -= chatData.points;
	chatData.outcome = results[outcome].label;
	chatData.css.push(results[outcome].id);
	chatData.isMinResult = outcome === 0;
	chatData.isMaxResult = outcome >= 3 && chatData.points <= 0;

	if (!roll.data.isReaction) chatData.cssClass = chatData.css.join(' ');
	else chatData.cssClass = chatData.css.slice(0, 2).join(' ');
	return chatData;
}
