'use client'
import React, { useEffect } from 'react'
import { RTCConfiguration } from '@/app/types'

const LandingPage = () => {
	let localStream: MediaStream | undefined
	let remoteStream: MediaStream | undefined
	let peerConnection: RTCPeerConnection | undefined

	const servers: RTCConfiguration = {
		iceServers: [
			{
				urls: [
					'stun:stun1.l.google.com:19302',
					'stun:stun2.l.google.com:19302',
				],
			},
		],
	}

	let init = async () => {
		localStream = await navigator.mediaDevices.getUserMedia({
			audio: false,
			video: true,
		})

		const user1Video = document.getElementById(
			'user-1'
		) as HTMLVideoElement | null
		if (user1Video) {
			user1Video.srcObject = localStream
		}

		createOffer()
	}

	let createOffer = async () => {
		peerConnection = new RTCPeerConnection(servers)
		remoteStream = new MediaStream()

		const user2Video = document.getElementById(
			'user-2'
		) as HTMLVideoElement | null
		if (user2Video) {
			user2Video.srcObject = remoteStream
		}

		localStream?.getTracks().forEach((track) => {
			peerConnection?.addTrack(track, localStream!)
		})

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream?.addTrack(track)
			})
		}

		peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				console.log('New ICE Candidate:', event.candidate)
			}
		}

		let offer = await peerConnection.createOffer()
		await peerConnection.setLocalDescription(offer)

		console.log('offer', offer)
	}

	useEffect(() => {
		init()
	})

	return (
		<div className="">
			<div className="flex flex-row gap-10 p-10">
				<video
					className="bg-[#000] w-1/2 h-[30rem]"
					id="user-1"
					autoPlay
					playsInline
				></video>
				<video
					className="bg-[#000] w-1/2 h-[30rem]"
					id="user-2"
					autoPlay
					playsInline
				></video>
			</div>
		</div>
	)
}

export default LandingPage
