export default class DwItem extends Item {
	static getDefaultArtwork(itemData) {
		let icon = `systems/${SYSTEM.id}/icons/${itemData.type}.svg`;
		return { img: icon };
	}
}
