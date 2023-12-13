'use client'
import React, { useEffect } from 'react'
import { RTCConfiguration } from '@/app/types'
import { RtmMessage } from 'agora-rtm-sdk/index'

const LandingPage = () => {
	let localStream: MediaStream | undefined
	let remoteStream: MediaStream | undefined
	let peerConnection: RTCPeerConnection | undefined
	let client
	let channel

	let APP_ID: string = 'a5953c3ce0794d0ab9bab769c761e8e8'
	let token: null = null
	let UID: string = String(Math.floor(Math.random() * 1010000))

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
		const { default: AgoraRTM } = await import('agora-rtm-sdk')
		client = AgoraRTM.createInstance(APP_ID)
		await client.login({ uid: UID })

		channel = client.createChannel('masterrr')
		await channel.join()

		channel.on('MemberJoined', handleUserJoined)

		channel.on('ChannelMessage', handleChannelMessage)

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
	}

	const handleUserJoined = async (memberId: any) => {
		console.log('MemberJoined', memberId)
		createOffer(memberId)
	}
	const handleChannelMessage = async (
		message: RtmMessage,
		memberId: string
	) => {
		console.log('ChannelMessage', message.text, memberId)
	}

	let createOffer = async (memberId: any) => {
		const { default: AgoraRTM } = await import('agora-rtm-sdk')
		client = AgoraRTM.createInstance(APP_ID)

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

		client.sendMessageToPeer({ text: 'Hey' }, memberId)
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
