export type ThemeType = 'dark' | 'light'

export interface RTCConfiguration {
	iceServers?: RTCIceServer[]
	iceTransportPolicy?: RTCIceTransportPolicy
	bundlePolicy?: RTCBundlePolicy
	rtcpMuxPolicy?: RTCRtcpMuxPolicy
	peerIdentity?: string
	certificates?: RTCCertificate[]
}

export interface RtmMessage {
	text: string
}
