/**
 * Doctor Who The Roleplaying Game
 * Author: Nick van Oosten (NickEast)
 * Software License: MIT
 * Repository: https://github.com/NickEastNL/fvtt-doctor-who
 *
 * Based on the Doctor Who Roleplaying Game by Cubicle 7. Doctor Who (c) BBC
 */

import { SYSTEM } from './module/config.mjs';
globalThis.SYSTEM = SYSTEM;

import * as applications from './module/applications/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as models from './module/data/_module.mjs';
import * as hooks from './module/hooks/_module.mjs';
import DwRoll from './module/roll.mjs';

Hooks.once('init', async () => {
	console.log('Initializing Doctor Who The Roleplaying Game');

	CONFIG.DOCTORWHO = SYSTEM;

	CONFIG.Dice.rolls.push(DwRoll);
	CONFIG.Actor.documentClass = documents.DwCharacter;
	CONFIG.Actor.dataModels = {
		character: models.CharacterModel,
		npc: models.CharacterModel,
	};

	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet(SYSTEM.id, applications.CharacterSheet, {
		types: ['character'],
		label: 'SHEETS.CharacterSheet',
		makeDefault: true,
	});
	Actors.registerSheet(SYSTEM.id, applications.CharacterSheet, {
		types: ['npc'],
		label: 'SHEETS.CharacterSheet',
		makeDefault: true,
	});

	CONFIG.Item.documentClass = documents.DwItem;
	CONFIG.Item.dataModels = {
		distinction: models.DistinctionModel,
		gadget: models.GadgetModel,
		weapon: models.WeaponModel,
	};

	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet(SYSTEM.id, applications.DistinctionSheet, {
		types: ['distinction'],
		label: 'SHEETS.DistinctionSheet',
		makeDefault: true,
	});
	Items.registerSheet(SYSTEM.id, applications.GadgetSheet, {
		types: ['gadget'],
		label: 'SHEETS.GadgetSheet',
		makeDefault: true,
	});
	Items.registerSheet(SYSTEM.id, applications.WeaponSheet, {
		types: ['weapon'],
		label: 'SHEETS.WeaponSheet',
		makeDefault: true,
	});
});

Hooks.once('i18nInit', () => {
	const toLocalize = ['ATTRIBUTES', 'SKILLS'];
	for (const c of toLocalize) {
		const conf = foundry.utils.getProperty(SYSTEM, c);
		for (const [k, v] of Object.entries(conf)) {
			if (v.label) v.label = game.i18n.localize(v.label);
			if (typeof v === 'string') conf[k] = game.i18n.localize(v);
		}
	}
});

Hooks.on('renderChatMessage', (msg, html, data) => {
	hooks.contestedRoll(msg, html);
	hooks.standardRoll(msg, html);
});

Hooks.on('updateActor', (actor, data) => {
	const messages = game.messages.filter((m) => {
		return m.flags[SYSTEM.id].targetActorId === data._id;
	});

	messages.forEach((m) => {
		ui.chat.updateMessage(m);
	});
});
