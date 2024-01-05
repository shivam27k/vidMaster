'use client'
import React, { useEffect, useState } from 'react'
import { RTCConfiguration } from '@/app/types'
import { RtmClient, RtmMessage, RtmTextMessage } from 'agora-rtm-sdk/index'

const LandingPage = () => {
	let localStream: MediaStream | undefined
	let remoteStream: MediaStream | undefined
	let peerConnection: RTCPeerConnection | undefined
	let client: RtmClient
	let channel: any
	// let parsedMessage: any

	const [UID, setUID] = useState(String(Math.floor(Math.random() * 1010000)))

	let APP_ID: string = 'a5953c3ce0794d0ab9bab769c761e8e8'

	useEffect(() => {
		setUID(String(Math.floor(Math.random() * 1010000)))
	}, [])

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

	const handleMessageFromPeer = async (
		message: RtmMessage,
		memberId: string
	) => {
		if (message.text) {
			const parsedMessage = JSON.parse(message.text)
			if (parsedMessage?.type === 'offer') {
				createAnswer(parsedMessage?.offer, memberId)
			}
			if (parsedMessage?.type === 'answer') {
				addAnswer(parsedMessage?.answer)
			}
			if (parsedMessage?.type === 'candidate') {
				if (parsedMessage?.candidate) {
					peerConnection?.addIceCandidate(parsedMessage?.candidate)
				}
			}
		}
	}

	const tryLogin = async () => {
		const { default: AgoraRTM } = await import('agora-rtm-sdk')
		client = AgoraRTM.createInstance(APP_ID)

		client.on('MessageFromPeer', handleMessageFromPeer)

		try {
			await client.login({ uid: UID })
		} catch (error) {
			setTimeout(tryLogin, 10000)
		}
	}

	const handleUserJoined = async (memberId: any) => {
		createOffer(memberId)
	}

	const handleChannelMessage = async (
		message: RtmTextMessage,
		memberId: string
	) => {}

	let createPeerConnection = async (memberId: any) => {
		peerConnection = new RTCPeerConnection(servers)
		remoteStream = new MediaStream()

		const user2Video = document.getElementById(
			'user-2'
		) as HTMLVideoElement | null
		if (user2Video) {
			user2Video.srcObject = remoteStream
			user2Video.style.display = 'block'
		}

		if (!localStream) {
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

		localStream?.getTracks().forEach((track) => {
			peerConnection?.addTrack(track, localStream!)
		})

		peerConnection.ontrack = (event) => {
			event.streams[0].getTracks().forEach((track) => {
				remoteStream?.addTrack(track)
			})
		}

		peerConnection.onicecandidate = (event) => {
			try {
				if (peerConnection && peerConnection.remoteDescription) {
					client.sendMessageToPeer(
						{
							text: JSON.stringify({
								type: 'candidate',
								candidate: event?.candidate,
							}),
						},
						memberId
					)
				} else {
					console.warn(
						'Remote description is not set. Ice candidate not added.'
					)
				}
			} catch (err) {
				console.error('Error sending ICE candidate', err)
			}
		}
	}

	let createOffer = async (memberId: any) => {
		await createPeerConnection(memberId)

		let offer = await peerConnection?.createOffer()
		await peerConnection?.setLocalDescription(offer)
		try {
			client.sendMessageToPeer(
				{
					text: JSON.stringify({
						type: 'offer',
						offer: offer,
					}),
				},
				memberId
			)
		} catch (err) {
			console.error('Error sending offer', err)
		}
	}

	let createAnswer = async (
		offer: RTCSessionDescriptionInit,
		memberId: any
	) => {
		await createPeerConnection(memberId)

		await peerConnection?.setRemoteDescription(offer)
		let answer = await peerConnection?.createAnswer()
		await peerConnection?.setLocalDescription(answer)

		try {
			client.sendMessageToPeer(
				{
					text: JSON.stringify({
						type: 'answer',
						answer: answer,
					}),
				},
				memberId
			)
		} catch (err) {
			console.error('Error sending answer', err)
		}
	}

	let addAnswer = async (answer: any) => {
		if (!peerConnection?.currentRemoteDescription) {
			await peerConnection?.setRemoteDescription(answer)
		}
	}

	const handleUserLeft = async (memberId: any) => {
		const user2Video = document.getElementById(
			'user-2'
		) as HTMLVideoElement | null
		if (user2Video) {
			user2Video.style.display = 'none'
		}
	}

	let init = async () => {
		try {
			await tryLogin()

			channel = client.createChannel('master')
			await channel.join()

			channel.on('MemberJoined', handleUserJoined)

			channel.on('ChannelMessage', handleChannelMessage)

			channel.on('MemberLeft', handleUserLeft)

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
		} catch (error) {
			console.error('Error during initalization', error)
		}
	}

	useEffect(() => {
		init()
	})

	const leaveChannel = async () => {
		await channel.leave()
		await client.logout()
	}

	window.addEventListener('beforeunload', leaveChannel)

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
					style={{ display: 'none' }}
					autoPlay
					playsInline
				></video>
			</div>
		</div>
	)
}

export default LandingPage
