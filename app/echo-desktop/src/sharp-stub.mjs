/**
 * Bundle-time stand-in for sharp (native libvips image processing). Desktop
 * mode ships without asset storage, so every code path that would process
 * images is already unreachable or fails gracefully; stubbing sharp drops
 * ~37 MB of native prebuilds from the package and removes the documented
 * sharp/Electron-on-Linux incompatibility from the equation. Calls throw a
 * catchable error, matching how the disabled asset endpoints already behave.
 */
function sharpStub() {
	throw new Error('[echo-desktop] image processing (sharp) is not available in desktop mode')
}

export default sharpStub
