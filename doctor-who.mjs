/**
 * Doctor Who The Roleplaying Game
 * Author: Nick van Oosten (NickEast)
 * Software License: MIT
 * Repository: https://github.com/NickEastNL/fvtt-doctor-who
 *
 * Based on the Doctor Who Roleplaying Game by Cubicle 7. Based on Doctor Who (c) BBC
 */

import { SYSTEM } from './module/config.mjs';
globalThis.SYSTEM = SYSTEM;

import * as applications from './module/applications/_module.mjs';
import * as documents from './module/documents/_module.mjs';
import * as models from './module/data/_module.mjs';

Hooks.once('init', async function () {
	console.log('Initializing Doctor Who The Roleplaying Game');

	CONFIG.DOCTORWHO = SYSTEM;

	CONFIG.Actor.documentClass = documents.CharacterActor;
	CONFIG.Actor.dataModels = {
		character: models.CharacterModel,
	};

	Actors.unregisterSheet('core', ActorSheet);
	Actors.registerSheet(SYSTEM.id, applications.CharacterSheet, {
		types: ['character'],
		label: 'SHEETS.CharacterSheet',
		makeDefault: true,
	});

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

Hooks.once('i18nInit', function () {
	const toLocalize = ['ATTRIBUTES', 'SKILLS'];
	for (const c of toLocalize) {
		const conf = foundry.utils.getProperty(SYSTEM, c);
		for (const [k, v] of Object.entries(conf)) {
			if (v.label) v.label = game.i18n.localize(v.label);
			if (typeof v === 'string') conf[k] = game.i18n.localize(v);
		}
	}
});
