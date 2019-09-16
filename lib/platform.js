/**
 * Device OS platform.
 */
export class Platform {
	/**
	 * Construct a platform object.
	 *
	 * @param {Object} platform Platform properties.
	 * @param {Number} platform.id Platform ID.
	 * @param {String} platform.name Platform name.
	 * @param {Array<String>} platform.tags Platform tags.
	 */
	constructor({ id, name, tags }) {
		this._id = id;
		this._name = name;
		this._tags = tags;
	}

	/**
	 * Platform ID.
	 */
	get id() {
		return this._id;
	}

	/**
	 * Platform name.
	 */
	get name() {
		return this._name;
	}

	/**
	 * Platform tags.
	 */
	get tags() {
		return this._tags;
	}

	/**
	 * Check if the platform is tagged with a specific tag.
	 *
	 * @param {String} tag Tag name.
	 * @returns {Boolean}
	 */
	has(tag) {
		if (!isKnownPlatformTag(tag)) {
			throw new Error(`Unknown platform tag: ${tag}`);
		}
		return this._tags.includes(tag);
	}

	/**
	 * This method is an alias for `has()`.
	 */
	is(tag) {
		return this.has(tag);
	}
}

/**
 * Supported Device OS platforms.
 */
export const PLATFORMS = [
	{
		id: 6,
		name: 'photon',
		tags: [ 'photon', 'gen2', 'wifi', 'tcp' ]
	},
	{
		id: 8,
		name: 'p1',
		tags: [ 'p1', 'gen2', 'wifi', 'tcp' ]
	},
	{
		id: 10,
		name: 'electron',
		tags: [ 'electron', 'gen2', 'cellular', 'udp' ]
	},
	{
		id: 12,
		name: 'argon',
		tags: [ 'argon', 'gen3', 'wifi', 'mesh', 'ble', 'udp' ]
	},
	{
		id: 13,
		name: 'boron',
		tags: [ 'boron', 'gen3', 'cellular', 'mesh', 'ble', 'udp' ]
	},
	{
		id: 14,
		name: 'xenon',
		tags: [ 'xenon', 'gen3', 'mesh', 'ble', 'udp' ]
	},
	{
		id: 22,
		name: 'asom',
		tags: [ 'asom', 'gen3', 'wifi', 'mesh', 'ble', 'udp' ]
	},
	{
		id: 23,
		name: 'bsom',
		tags: [ 'bsom', 'gen3', 'cellular', 'mesh', 'ble', 'udp' ]
	},
	{
		id: 24,
		name: 'xsom',
		tags: [ 'xsom', 'gen3', 'mesh', 'ble', 'udp' ]
	}
].map(p => new Platform(p));

const PLATFORMS_BY_ID = PLATFORMS.reduce((map, p) => map.set(p.id, p), new Map());
const PLATFORMS_BY_NAME = PLATFORMS.reduce((map, p) => map.set(p.name, p), new Map());

const PLATFORMS_BY_TAG = PLATFORMS.reduce((map, p) => {
	p.tags.forEach(tag => {
		let ps = map.get(tag);
		if (!ps) {
			ps = [];
			map.set(tag, ps);
		}
		ps.push(p);
	});
	return map;
}, new Map());

/**
 * Get platform by ID.
 *
 * @param {Number} id Platform ID.
 * @returns {Platform}
 */
export function platformForId(id) {
	const p = PLATFORMS_BY_ID.get(id);
	if (!p) {
		throw new Error(`Unknown platform ID: ${id}`);
	}
	return p;
}

/**
 * Check if the given platform ID is valid.
 *
 * @param {Number} id Platform ID.
 * @returns {Boolean}
 */
export function isKnownPlatformId(id) {
	return PLATFORMS_BY_ID.has(id);
}

/**
 * Get platform by name.
 *
 * @param {String} name Platform name.
 * @returns {Platform}
 */
export function platformForName(name) {
	const p = PLATFORMS_BY_NAME.get(name);
	if (!p) {
		throw new Error(`Unknown platform name: ${name}`);
	}
	return p;
}

/**
 * Check if the given platform name is valid.
 *
 * @param {String} name Platform name.
 * @returns {Boolean}
 */
export function isKnownPlatformName(name) {
	return PLATFORMS_BY_NAME.has(name);
}

/**
 * Get platforms tagged with a specific tag.
 *
 * @param {String} tag Platform tag.
 * @returns {Array<Platform>}
 */
export function platformsForTag(tag) {
	const ps = PLATFORMS_BY_TAG.get(tag);
	if (!ps) {
		throw new Error(`Unknown platform tag: ${tag}`);
	}
	return ps;
}

/**
 * Check if the given platform tag is valid.
 *
 * @param {String} tag Platform tag.
 * @returns {Boolean}
 */
export function isKnownPlatformTag(tag) {
	return PLATFORMS_BY_TAG.has(tag);
}

function parsePlatform(tag) {
	let not = false;
	if (tag.startsWith('!')) {
		tag = tag.substring(1);
		not = true;
	}
	if (tag === 'all') {
		return not ? [] : PLATFORMS;
	}
	if (not) {
		return PLATFORMS.filter(p => !p.has(tag));
	}
	return platformsForTag(tag);
}

/**
 * Parse arguments of the platforms() function.
 *
 * @param {Array<String>} args Arguments.
 * @returns {Array<Platform>}
 */
export function parsePlatforms(tags) {
	const platforms = new Map();
	tags.forEach(tag => {
		let ps = null;
		const tags = tag.split(/\s+/);
		tags.forEach(tag => {
			const ps2 = parsePlatform(tag);
			if (ps) {
				// Filter out platforms not tagged with this tag
				ps = ps.filter(p => ps2.some(p2 => p2.id === p.id));
			} else {
				ps = ps2;
			}
		});
		ps.forEach(p => platforms.set(p.id, p));
	});
	return Array.from(platforms.values());
}