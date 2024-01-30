import { RollDialog } from '../applications/_module.mjs';
import DwRoll from '../roll.mjs';

/**
 * @param {ChatMessage} msg
 * @param {JQuery} html
 */
export default async function contestedRoll(msg, html) {
	const contested = html.find('.contested-message');
	if (!contested.length) return;

	const flags = foundry.utils.deepClone(msg.flags[SYSTEM.id]) || {};
	const sourceActor = fromUuidSync(flags.source);
	const targetActor = fromUuidSync(flags.target);
	flags.source = sourceActor.name;
	flags.target = targetActor.name;
	flags.isOwner = targetActor.isOwner;

	const template = await renderTemplate(
		`systems/${SYSTEM.id}/templates/chat/contested-message.hbs`,
		flags
	);

	contested.replaceWith(template);

	html.find('[data-action="roll"]').on('click', async (event) => {
		event.preventDefault();
		console.debug(flags);
		const targetRoll = await RollDialog.show({
			actor: targetActor,
			target: sourceActor,
			sourceRoll: flags.sourceRoll,
			isReaction: true,
		});

		if (!targetRoll) return;

		if (flags.sourceRoll.favor === targetRoll.data.favor) {
			flags.sourceRoll.favor = 'none';
		}

		flags.sourceRoll.difficulty = targetRoll.total;
		const sourceRoll = new DwRoll(flags.sourceRoll);

		const messageData = await sourceRoll.toMessage(
			{
				flavor: `Contested roll against <strong>${targetActor.name}</strong>`,
				speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
				flags: {
					[SYSTEM.id]: {
						source: sourceActor.uuid,
						points: 0,
					},
				},
			},
			{ create: false }
		);

		const cls = getDocumentClass('ChatMessage');
		let msg = new cls(messageData);
		cls.create(msg.toObject());
	});
}
