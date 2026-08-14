/**
 * Fallback for sharp, used by sharp-loader.mjs when the native module fails
 * to load. Provides `.metadata()` via header parsing so image uploads still
 * finalize; the conversion pipeline throws a catchable error.
 */
export default function sharpStub(input) {
	return {
		metadata: async () => parseImageMetadata(input),
		resize: conversionUnavailable,
		webp: conversionUnavailable,
		jpeg: conversionUnavailable,
		png: conversionUnavailable,
		gif: conversionUnavailable,
		toBuffer: conversionUnavailable,
	}
}

function conversionUnavailable() {
	throw new Error('[echo-desktop] image conversion (sharp) is not available in desktop mode')
}

function parseImageMetadata(input) {
	const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
	const result = parsePng(buffer) ?? parseGif(buffer) ?? parseJpeg(buffer) ?? parseWebp(buffer) ?? parseSvg(buffer)
	if (!result) {
		throw new Error('[echo-desktop] unrecognized image format')
	}
	return result
}

function parsePng(buffer) {
	if (buffer.length < 24 || !buffer.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) return null
	return { format: 'png', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

function parseGif(buffer) {
	if (buffer.length < 10 || !['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString())) return null
	return { format: 'gif', width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) }
}

function parseJpeg(buffer) {
	if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null
	let offset = 2
	while (offset + 9 < buffer.length) {
		if (buffer[offset] !== 0xff) return null
		const marker = buffer[offset + 1]
		if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
			return { format: 'jpeg', height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) }
		}
		offset += 2 + buffer.readUInt16BE(offset + 2)
	}
	return null
}

function parseWebp(buffer) {
	if (
		buffer.length < 30 ||
		buffer.subarray(0, 4).toString() !== 'RIFF' ||
		buffer.subarray(8, 12).toString() !== 'WEBP'
	) {
		return null
	}
	const chunk = buffer.subarray(12, 16).toString()
	if (chunk === 'VP8 ') {
		return {
			format: 'webp',
			width: buffer.readUInt16LE(26) & 0x3fff,
			height: buffer.readUInt16LE(28) & 0x3fff,
		}
	}
	if (chunk === 'VP8L') {
		const bits = buffer.readUInt32LE(21)
		return { format: 'webp', width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
	}
	if (chunk === 'VP8X') {
		return {
			format: 'webp',
			width: buffer.readUIntLE(24, 3) + 1,
			height: buffer.readUIntLE(27, 3) + 1,
		}
	}
	return null
}

function parseSvg(buffer) {
	const text = buffer.subarray(0, 4096).toString('utf8')
	const svgTag = text.match(/<svg[^>]*>/i)?.[0]
	if (!svgTag) return null
	const dimension = (name) => Number(svgTag.match(new RegExp(`\\b${name}="([\\d.]+)`, 'i'))?.[1])
	const viewBox = svgTag.match(/\bviewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/i)
	const width = dimension('width') || (viewBox ? Number(viewBox[1]) : undefined)
	const height = dimension('height') || (viewBox ? Number(viewBox[2]) : undefined)
	return { format: 'svg', width: width ? Math.round(width) : undefined, height: height ? Math.round(height) : undefined }
}
