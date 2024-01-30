export default class DwRoll extends Roll {
	constructor(rollData, data) {
		if (typeof rollData === 'object') {
			data = rollData;
			rollData = '';
		}

		super(rollData, data);
	}

	get isSuccess() {
		if (!this._evaluated) return undefined;
		return this.total >= this.data.difficulty;
	}

	get isFailure() {
		if (!this._evaluated) return undefined;
		return this.total < this.data.difficulty;
	}

	get hasOne() {
		if (!this._evaluated) return undefined;
		return (
			this.dice[0].results.some((die) => die.active && die.result === 1) &&
			!this.isAllOnes
		);
	}

	get isAllOnes() {
		if (!this._evaluated) return undefined;
		return this.dice[0].results.every((die) => die.active && die.result === 1);
	}

	get hasSix() {
		if (!this._evaluated) return undefined;
		return (
			this.dice[0].results.some((die) => die.active && die.result === 6) &&
			!this.isAllSixes
		);
	}

	get isAllSixes() {
		if (!this._evaluated) return undefined;
		return this.dice[0].results.every((die) => die.active && die.result === 6);
	}

	static parse(_, data) {
		let pool = 2;
		let modifier = '';

		if (data.favor !== 'none') {
			pool = 3;

			if (data.favor === 'adv') modifier = 'kh2';
			if (data.favor === 'disadv') modifier = 'kl2';
		}

		const terms = [`${pool}d6${modifier}`, data.attributeScore, data.skillScore];
		if (data.bonusDice > 0) terms.push(`${data.bonusDice}d6`);
		if (data.bonusModifier > 0) terms.push(data.bonusModifier);
		const formula = terms.join(' + ');
		return super.parse(formula, data);
	}

	render() {
		return '<div class="doctor-who dice-roll"></div>';
	}

	initialize(data) {
		this.data = this._prepareData(data);
		this.terms = this.constructor.parse('', this.data);
	}

	toJSON() {
		const data = super.toJSON();
		data.data = foundry.utils.deepClone(this.data);
		return data;
	}
}
